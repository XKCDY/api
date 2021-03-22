import {Controller, Get, Injectable, InternalServerErrorException, NotFoundException, Param, Query} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {PrismaService} from 'src/prisma/prisma.service';
import {GetAllComicsParameters} from './types';

const findManyOptions: Prisma.ComicsFindManyArgs = {
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
	async getAllComics(@Query() parameters?: GetAllComicsParameters) {
		if (typeof parameters?.since === 'number') {
			return this.prisma.comics.findMany({
				...findManyOptions,
				where: {
					id: {
						gt: parameters.since
					}
				}
			});
		}

		return this.prisma.comics.findMany(findManyOptions);
	}

	@Get('/latest')
	async getLatestComic() {
		const comic = await this.prisma.comics.findFirst({...findManyOptions, orderBy: {
			id: 'desc'
		}});

		if (comic) {
			return comic;
		}

		throw new InternalServerErrorException('No comics');
	}

	@Get(':comicId')
	async getComic(@Param('comicId') comicId: string) {
		const id = Number.parseInt(comicId, 10);

		const comic = await this.prisma.comics.findUnique({
			include: findManyOptions.include,
			where: {id}
		});

		if (!comic) {
			throw new NotFoundException(`${id} not found`);
		}

		return comic;
	}
}
