import {join} from 'node:path';
import {BullModule} from '@codetheweb/nestjs-bull';
import {Module} from '@nestjs/common';
import {DbModule} from 'src/db/db.module';
import {ComicController} from './comic.controller';
import {ComicService} from './comic.service';

@Module({
	imports: [
		DbModule,
		BullModule.registerQueue({
			name: 'scrape-comics',
			processors: [join(__dirname, 'processors/scrape-comics.js')]
		}),
		BullModule.registerQueue({
			name: 'special-comics',
			processors: [join(__dirname, 'processors/special-comics.js')]
		})
	],
	controllers: [ComicController],
	providers: [ComicService]
})
export class ComicModule {}
