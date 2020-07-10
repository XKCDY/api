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

@Path('/comics')
export class ComicController {
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

  @Path('/latest')
  @GET
  public async getLatestComic(): Promise<ComicModel> {
    const comic = await Comic.findOne({...findOptions, order: [['id', 'DESC']]});

    if (comic) {
      return comic;
    }

    throw new Errors.NotFoundError('no comics');
  }

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
