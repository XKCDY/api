import {db} from 'src/lib/db';
import specialComics from '../../special-comics.json';

const processJob = async () => {
	await Promise.all(Object.keys(specialComics).map(async id => {
		const url = specialComics[id as keyof typeof specialComics];
		const comic = await db.selectFrom('comics').where('id', '=', Number.parseInt(id, 10)).selectAll().executeTakeFirst();

		if (!comic) {
			return;
		}

		if (comic.interactiveUrl !== url) {
			await db.updateTable('comics')
				.set({interactiveUrl: url})
				.where('id', '=', Number.parseInt(id, 10))
				.execute();
		}
	}));
};

export default processJob;
