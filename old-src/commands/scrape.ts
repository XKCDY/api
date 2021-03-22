import got, {HTTPError} from 'got';
import probe, {ProbeResult} from 'probe-image-size';
import * as exifr from 'exifr';
import {Comic} from '../models';
import {ComicImgModel, ImgSize} from '../models/comic-img';

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

const getX2Url = (fromUrl: string): string => {
  const imageUrlSplit = fromUrl.split('.');

  return `${imageUrlSplit.splice(0, imageUrlSplit.length - 1).join('.')}_2x.${imageUrlSplit[imageUrlSplit.length - 1]}`;
};

export default async () => {
  // This could be significantly speed up on the first run by using binary search.
  // Not really worth it at this point.
  const latestComic = await Comic.findOne({order: [['id', 'DESC']]});
  let fetchingId = 1;

  if (latestComic) {
    fetchingId = latestComic.id + 1;
  }

  // Require 2 not found errors in a row to terminate
  let idsNotFound: number[] = [];

  const hasScrapedAll = () => {
    let twoConsecutiveNotFound = false;

    idsNotFound.forEach((id, i) => {
      const nextId = idsNotFound[i + 1];

      if (nextId && nextId === id + 1) {
        twoConsecutiveNotFound = true;
      }
    });

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

        const imgs: ComicImgModel[] = [];

        imgResults.forEach((result, i) => {
          if (result.status === 'fulfilled') {
            const height = swapWidthAndHeight ? result.value.width : result.value.height;
            const width = swapWidthAndHeight ? result.value.height : result.value.width;

            imgs.push({
              height,
              width,
              ratio: width / height,
              sourceUrl: result.value.url,
              size: i === 0 ? ImgSize.x1 : ImgSize.x2
            } as ComicImgModel);
          } else if (result.reason.statusCode !== 404) {
            throw new Error(`Non-404 HTTP code: ${result.reason.statusCode as string}`);
          }
        });

        await Comic.create({
          id: comic.num,
          publishedAt: new Date(`${comic.month}-${comic.day}-${comic.year}`),
          news: comic.news,
          safeTitle: comic.safe_title,
          title: comic.title,
          transcript: comic.transcript,
          alt: comic.alt,
          sourceUrl: `https://xkcd.com/${comic.num}`,
          explainUrl: `https://www.explainxkcd.com/wiki/index.php/${comic.num}`,
          imgs: imgs
        }, {
          include: [Comic.Imgs]
        });
      } catch (error) {
        if (error.constructor === HTTPError) {
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

  const newLatestComic = await Comic.findOne({order: [['id', 'DESC']]});

  if (newLatestComic) {
    console.log(`Scrapped all comics up to and including ${newLatestComic.id}.`);
  }
};
