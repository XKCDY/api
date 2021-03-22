import {Controller, Get, Header, Injectable, InternalServerErrorException, NotFoundException, Param, Query} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {PrismaService} from 'src/prisma/prisma.service';
import {GetAllComicsParameters} from './types';

const findManyOptions: Prisma.ComicFindManyArgs = {
	include: {
		imgs: {
			select: {
				height: true,
				width: true,
				ratio: true,
				sourceUrl: true,
				size: true
			}
		}
	},
	orderBy: {
		id: 'asc'
	}
};

@Controller('comics')
@Injectable()
export class ComicController {
	constructor(private readonly prisma: PrismaService) {}

	@Get()
	@Header('Cache-Control', 'max-age=300')
	async getAllComics(@Query() parameters?: GetAllComicsParameters) {
		if (typeof parameters?.since === 'number') {
			return this.prisma.comic.findMany({
				...findManyOptions,
				where: {
					id: {
						gt: parameters.since
					}
				}
			});
		}

		return this.prisma.comic.findMany(findManyOptions);
	}

	@Get('/latest')
	@Header('Cache-Control', 'max-age=300')
	async getLatestComic() {
		const comic = await this.prisma.comic.findFirst({...findManyOptions, orderBy: {
			id: 'desc'
		}});

		if (comic) {
			return comic;
		}

		throw new InternalServerErrorException('No comics');
	}

	@Get(':comicId')
	@Header('Cache-Control', 'max-age=300')
	async getComic(@Param('comicId') comicId: string) {
		const id = Number.parseInt(comicId, 10);

		const comic = await this.prisma.comic.findUnique({
			include: findManyOptions.include,
			where: {id}
		});

		if (!comic) {
			throw new NotFoundException(`${id} not found`);
		}

		return comic;
	}
}
