import got, {HTTPError} from 'got';
import probe, {ProbeResult} from 'probe-image-size';
import * as exifr from 'exifr';
import {Comic} from '../models';
import {ComicImgModel, ImgSize} from '../models/comic-img';

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
  let numOfNotFoundErrors = 0;

  while (numOfNotFoundErrors < 2) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const comic: XKCDResponse = await got(`https://xkcd.com/${fetchingId}/info.0.json`).json();

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

      // eslint-disable-next-line no-await-in-loop
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

      // eslint-disable-next-line no-await-in-loop
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
          numOfNotFoundErrors++;
        } else {
          throw error;
        }
      }
    }

    fetchingId++;
  }

  console.log(`Scrapped all comics up to and including ${fetchingId - 3}.`);
};
