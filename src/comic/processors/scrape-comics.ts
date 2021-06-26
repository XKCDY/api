import {Job} from 'bullmq';
import got, {HTTPError} from 'got';
import probe, {ProbeResult} from 'probe-image-size';
import {Logger} from '@nestjs/common';
import * as exifr from 'exifr';
import {ComicImg, Prisma, PrismaClient} from '@prisma/client';

const PARALLEL_SCRAPES = 5;

interface XKCDResponse {
	num: number;
	link: string;
	year: string;
	month: string;
	day: string;
	news: string;
	safe_title: string;
	transcript: string;
	alt: string;
	img: string;
	title: string;
}

enum ImgSize {
	x1 = 'x1',
	x2 = 'x2'
}

const prisma = new PrismaClient();

const getX2Url = (fromUrl: string): string => {
	const imageUrlSplit = fromUrl.split('.');

	return `${imageUrlSplit.splice(0, imageUrlSplit.length - 1).join('.')}_2x.${imageUrlSplit[imageUrlSplit.length - 1]}`;
};

const logger = new Logger('Job: scrape comics');

const processJob = async (_: Job) => {
	logger.log('Started scraping...');

	// This could be significantly speed up on the first run by using binary search. Not really worth it at this point.
	const latestComic = await prisma.comic.findFirst({orderBy: {id: 'desc'}});
	let fetchingId = 1;

	if (latestComic) {
		// Check the latest two for updates
		fetchingId = latestComic.id - 2;
	}

	// Require 2 not found errors in a row to terminate
	const idsNotFound: number[] = [];

	const hasScrapedAll = () => {
		let twoConsecutiveNotFound = false;

		for (const [i, id] of idsNotFound.entries()) {
			const nextId = idsNotFound[i + 1];

			if (nextId && nextId === id + 1) {
				twoConsecutiveNotFound = true;
			}
		}

		return twoConsecutiveNotFound;
	};

	while (!hasScrapedAll()) {
		const idsToScrape = [];

		for (let i = fetchingId; i < fetchingId + PARALLEL_SCRAPES; i++) {
			idsToScrape.push(i);
		}

		// eslint-disable-next-line no-await-in-loop
		await Promise.all(idsToScrape.map(async id => {
			try {
				const comic: XKCDResponse = await got(`https://xkcd.com/${id}/info.0.json`).json();

				// Get images
				const promises: Array<Promise<[PromiseSettledResult<ProbeResult>, PromiseSettledResult<ProbeResult>] | number>> = [
					Promise.allSettled([
						probe(comic.img),
						probe(getX2Url(comic.img))
					])
				];

				if (comic.img.includes('jpeg') || comic.img.includes('jpg')) {
					promises.push((async () => {
						const imgData = await got(comic.img).buffer();
						return (await exifr.orientation(imgData)) ?? 1;
					})());
				}

				const resolved = await Promise.all(promises);
				const imgResults = resolved[0] as Array<PromiseSettledResult<ProbeResult>>;
				const orientation = resolved[1] as number;

				const swapWidthAndHeight = orientation !== undefined && [5, 6, 7, 8].includes(orientation);

				const imgs: ComicImg[] = [];

				for (const [i, result] of imgResults.entries()) {
					if (result.status === 'fulfilled') {
						const height = swapWidthAndHeight ? result.value.width : result.value.height;
						const width = swapWidthAndHeight ? result.value.height : result.value.width;

						imgs.push({
							height,
							width,
							ratio: width / height,
							sourceUrl: result.value.url,
							size: i === 0 ? ImgSize.x1 : ImgSize.x2
						} as ComicImg);
					} else if (result.reason.statusCode !== 404) {
						throw new Error(`Non-404 HTTP code: ${result.reason.statusCode as string}`);
					}
				}

				const currentComic = await prisma.comic.findUnique({
					where: {id: comic.num},
					select: {imgs: true}
				});

				const data: Prisma.ComicCreateInput = {
					id: comic.num,
					publishedAt: new Date(`${comic.month}-${comic.day}-${comic.year}`),
					news: comic.news,
					safeTitle: comic.safe_title,
					title: comic.title,
					transcript: comic.transcript,
					alt: comic.alt,
					sourceUrl: `https://xkcd.com/${comic.num}`,
					explainUrl: `https://www.explainxkcd.com/wiki/index.php/${comic.num}`
				};

				if (currentComic) {
					await Promise.all<any>([
						prisma.comic.update({
							where: {id: data.id},
							data
						}),
						...imgs.map(async img => {
							const existingImage = await prisma.comicImg.findFirst({
								where: {
									comic_id: data.id,
									size: img.size
								}
							});

							if (existingImage) {
								await prisma.comicImg.update({
									where: {id: existingImage.id},
									data: img
								});
							} else {
								await prisma.comicImg.create({
									data: {
										...img,
										comic_id: data.id
									}
								});
							}
						})
					]);
				} else {
					data.imgs = {
						create: imgs
					};

					await prisma.comic.create({data});
				}
			} catch (error: unknown) {
				if (error instanceof HTTPError) {
					if (error.response.statusCode === 404) {
						idsNotFound.push(id);
					} else {
						throw error;
					}
				}
			}
		}));

		fetchingId += PARALLEL_SCRAPES;
	}

	const newLatestComic = await prisma.comic.findFirst({orderBy: {id: 'desc'}});

	if (newLatestComic) {
		logger.log(`Scrapped all comics up to and including ${newLatestComic.id}.`);
	}

	await prisma.$disconnect();
};

export default processJob;
