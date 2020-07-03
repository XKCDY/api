import {GET, Path, PathParam, Errors} from 'typescript-rest';
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
  public async getAllComics(): Promise<ComicModel[]> {
    return Comic.findAll(findOptions);
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
