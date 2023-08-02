import {NestFactory} from '@nestjs/core';
import {ValidationPipe} from '@nestjs/common';
import type {
	NestFastifyApplication,
} from '@nestjs/platform-fastify';
import {
	FastifyAdapter,
} from '@nestjs/platform-fastify';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {AppModule} from './app.module';

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

	app.useGlobalPipes(new ValidationPipe({
		forbidNonWhitelisted: true,
		whitelist: true
	}));

	const config = new DocumentBuilder()
		.setTitle('XKCDY')
		.setDescription('An API for xkcd comics.')
		.setVersion('1.0')
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('docs', app, document);

	app.enableCors();

	await app.listen(process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000, '0.0.0.0');
}

void bootstrap();

const EXIT_AFTER_MS = process.env.EXIT_AFTER_MS ? Number.parseInt(process.env.EXIT_AFTER_MS, 10) : 0;
const RANDOM_EXIT_DELAY_MS = Math.random() * 5000;

if (EXIT_AFTER_MS > 0) {
	setTimeout(() => {
		console.log('Reached exit time, exiting.');
		// eslint-disable-next-line unicorn/no-process-exit
		process.exit(2);
	}, EXIT_AFTER_MS + RANDOM_EXIT_DELAY_MS);
}
