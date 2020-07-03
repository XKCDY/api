import got, {HTTPError} from 'got';
import probe from 'probe-image-size';
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
      // eslint-disable-next-line no-await-in-loop
      const imgResults = await Promise.allSettled([
        probe(comic.img),
        probe(getX2Url(comic.img))
      ]);

      const imgs: ComicImgModel[] = [];

      imgResults.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          imgs.push({
            height: result.value.height,
            width: result.value.width,
            ratio: result.value.width / result.value.height,
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
