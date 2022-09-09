import {Controller, Get, Header, Injectable, NotFoundException, Param, Query} from '@nestjs/common';
import {sql} from 'kysely';
import {DbService} from 'src/db/db.service';
import {GetAllComicsParameters} from './types';

const getBaseQuery = (db: DbService) => db
	.selectFrom('comics')
	.innerJoin('comic_imgs', 'comic_imgs.comic_id', 'comics.id')
	.selectAll('comics')
	.select([sql`json_agg(json_build_object('width', width, 'height', height, 'ratio', ratio, 'sourceUrl', comic_imgs."sourceUrl", 'size', size))`.as('imgs')])
	.groupBy('comics.id');

@Controller('comics')
@Injectable()
export class ComicController {
	constructor(private readonly db: DbService) {}

	@Get()
	@Header('Cache-Control', 'max-age=300')
	async getAllComics(@Query() parameters?: GetAllComicsParameters) {
		return getBaseQuery(this.db)
			.orderBy('comics.id', 'asc')
			.where('comics.id', '>', parameters?.since ?? 0)
			.execute();
	}

	@Get('/latest')
	@Header('Cache-Control', 'max-age=300')
	async getLatestComic() {
		const comic = await getBaseQuery(this.db).orderBy('comics.id', 'desc').executeTakeFirst();

		if (comic) {
			return comic;
		}

		throw new NotFoundException('No comics');
	}

	@Get(':comicId')
	@Header('Cache-Control', 'max-age=300')
	async getComic(@Param('comicId') comicId: string) {
		const id = Number.parseInt(comicId, 10);

		const comic = await getBaseQuery(this.db).where('comics.id', '=', id).executeTakeFirst();

		if (!comic) {
			throw new NotFoundException(`${id} not found`);
		}

		return comic;
	}
}
