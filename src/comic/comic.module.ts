import {Module} from '@nestjs/common';
import {PrismaModule} from 'src/prisma/prisma.module';
import {ComicController} from './comic.controller';

@Module({
	imports: [
		PrismaModule
	],
	controllers: [ComicController],
	providers: []
})
export class ComicModule {}
