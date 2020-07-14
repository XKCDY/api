import {GET, Path, PathParam, QueryParam, Errors} from 'typescript-rest';
import {Op, FindOptions} from 'sequelize';
import {Comic, ComicImg} from '../models';
import {ComicModel, ComicAttributes} from '../models/comic';

const findOptions: FindOptions<ComicAttributes> = {
  include: [
    {
      model: ComicImg,
      as: 'imgs',
      attributes: ['height', 'width', 'ratio', 'sourceUrl', 'size']
    }
  ],
  order: [
    ['id', 'ASC']
  ]
};

/**
 * @api {OBJECT} Comic Comic
 * @apiGroup Custom Types
 * @apiParam {Number} id id
 * @apiParam {Date} publishedAt when the comic was published
 * @apiParam {String} news usually empty
 * @apiParam {String} safeTitle usually the same as title
 * @apiParam {String} title name of comic
 * @apiParam {String} transcript transcribed text from the comic
 * @apiParam {String} alt 'alt' text (appears when you hover over a comic with your mouse)
 * @apiParam {[ComicImg[]](#api-Custom_Types-ObjectComicimg)} imgs comic images
 * @apiParam {String} sourceUrl URL to original comic
 * @apiParam {String} explainUrl URL to the wiki
 * @apiParam {String} interactiveUrl for comics that have interactive elements, this will either be a link to the original comic or to a third-party site to facilitate easier interaction
 */

/**
 * @api {OBJECT} ComicImg Comic Image
 * @apiGroup Custom Types
 * @apiParam {Number} height height in pixels
 * @apiParam {Number} width width in pixels
 * @apiParam {Number} ratio ratio of width:height
 * @apiParam {String} sourceUrl URL to image
 * @apiParam {String} size size of image, can be x1 or x2
 */

/**
 * @api {get} /comics Get all comics
 * @apiName GetAllComics
 * @apiGroup Comic
 *
 * @apiSuccess {[Comic[]](#api-Custom_Types-ObjectComic)} comics All known comics
 */
@Path('/comics')
export class ComicController {
  /**
   * @api {get} /comics Get comics since ID
   * @apiParam {Number} since return all comics after this ID
   * @apiName GetComicsSince
   * @apiGroup Comic
   *
   * @apiSuccess {[Comic[]](#api-Custom_Types-ObjectComic)} comics comics since provided ID
   */
  @GET
  public async getAllComics(@QueryParam('since') since?: number): Promise<ComicModel[]> {
    let options = null;

    if (typeof since === 'number') {
      options = {
        ...findOptions,
        where: {
          id: {
            [Op.gt]: since
          }
        }
      };
    } else {
      options = findOptions;
    }

    return Comic.findAll(options);
  }

  /**
   * @api {get} /comics/latest Get latest comic
   * @apiName GetLatestComic
   * @apiGroup Comic
   *
   * @apiSuccess {[Comic](#api-Custom_Types-ObjectComic)} comic latest comic
   */
  @Path('/latest')
  @GET
  public async getLatestComic(): Promise<ComicModel> {
    const comic = await Comic.findOne({...findOptions, order: [['id', 'DESC']]});

    if (comic) {
      return comic;
    }

    throw new Errors.NotFoundError('no comics');
  }

  /**
   * @api {get} /comics Get specific comic by ID
   * @apiParam {Number} comicId comic to fetch
   * @apiName GetComicById
   * @apiGroup Comic
   *
   * @apiSuccess {[Comic](#api-Custom_Types-ObjectComic)} comic fetched comic
   * @apiError ComicNotFound <code>comicId</code> not found
   */
  @Path(':comicId')
  @GET
  public async getComic(@PathParam('comicId') comicId: number): Promise<ComicModel> {
    const comic = await Comic.findByPk(comicId, findOptions);

    if (comic) {
      return comic;
    }

    throw new Errors.NotFoundError(`${comicId} not found`);
  }
}
