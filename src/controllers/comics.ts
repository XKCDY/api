import {GET, Path, PathParam, QueryParam, Errors} from 'typescript-rest';
import {Op} from 'sequelize';
import {Comic, ComicImg} from '../models';
import {ComicModel} from '../models/comic';

const findOptions = {
  include: [
    {
      model: ComicImg,
      as: 'imgs',
      attributes: ['height', 'width', 'ratio', 'sourceUrl', 'size']
    }
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
