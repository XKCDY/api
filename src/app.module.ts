import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {BullModule} from '@codetheweb/nestjs-bull';
import {ComicModule} from './comic/comic.module';
import {DeviceTokenModule} from './device-token/device-token.module';

@Module({
	imports: [
		ConfigModule.forRoot(),
		BullModule.forRoot({
			connection: {
				port: Number.parseInt(process.env.REDIS_PORT!, 10),
				host: process.env.REDIS_HOST
			}
		}),
		ComicModule,
		DeviceTokenModule
	],
	controllers: [],
	providers: []
})
export class AppModule {}
