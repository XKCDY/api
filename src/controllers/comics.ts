import {GET, Path, PathParam, Errors} from 'typescript-rest';
import {Comic, ComicImg} from '../models';
import {ComicModel} from '../models/comic';

@Path('/comics')
export class ComicController {
  @GET
  public async getAllComics(): Promise<ComicModel[]> {
    return Comic.findAll({include: ComicImg});
  }

  @Path(':comicId')
  @GET
  public async getComic(@PathParam('comicId') comicId: number): Promise<ComicModel> {
    const comic = await Comic.findByPk(comicId, {include: ComicImg});

    if (comic) {
      return comic;
    }

    throw new Errors.NotFoundError(`${comicId} not found`);
  }
}
