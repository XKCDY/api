import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {BullModule} from '@codetheweb/nestjs-bull';
import {ServeStaticModule} from '@nestjs/serve-static';
import {join} from 'path';
import Redis from 'ioredis';
import {ComicModule} from './comic/comic.module';
import {DeviceTokenModule} from './device-token/device-token.module';

const redisConnection = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : {
	port: Number.parseInt(process.env.REDIS_PORT!, 10),
	host: process.env.REDIS_HOST
};

@Module({
	imports: [
		ConfigModule.forRoot(),
		BullModule.forRoot({
			connection: redisConnection
		}),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'public'),
			serveRoot: '/static'
		}),
		ComicModule,
		DeviceTokenModule
	],
	controllers: [],
	providers: []
})
export class AppModule {}
