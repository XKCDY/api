import {PrismaClient} from '@prisma/client';
import specialComics from '../../special-comics.json';

const prisma = new PrismaClient();

const processJob = async () => {
	await Promise.all(Object.keys(specialComics).map(async id => {
		const url = specialComics[id as keyof typeof specialComics];

		const comic = await prisma.comic.findUnique({where: {id: Number.parseInt(id, 10)}});

		if (!comic) {
			return;
		}

		if (comic.interactiveUrl !== url) {
			await prisma.comic.update({
				data: {
					interactiveUrl: url
				},
				where: {
					id: Number.parseInt(id, 10)
				}
			});
		}
	}));

	await prisma.$disconnect();
};

export default processJob;
