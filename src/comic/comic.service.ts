import type {OnModuleInit} from '@nestjs/common';
import {Injectable} from '@nestjs/common';
import {InjectQueue} from '@nestjs/bullmq';
import {Queue} from 'bullmq';

@Injectable()
export class ComicService implements OnModuleInit {
	constructor(
		@InjectQueue('scrape-comics') private readonly scrapeComicsQueue: Queue,
		@InjectQueue('special-comics') private readonly specialComicsQueue: Queue
	) {}

	async onModuleInit() {
		// Run immediately if job doesn't exist
		await this.scrapeComicsQueue.add('initial-scrape', null, {
			jobId: 'first-job'
		});

		// Add recurring job
		await this.scrapeComicsQueue.add('recurring-scrape', null, {
			repeat: {
				pattern: '*/5 * * * *' // Every 5 minutes
			},
			jobId: 'recurring-job'
		});

		// Run immediately if job doesn't exist
		await this.specialComicsQueue.add('initial-check', null, {
			jobId: 'first-job'
		});

		// Add recurring job
		await this.specialComicsQueue.add('recurring-check', null, {
			repeat: {
				pattern: '*/5 * * * *' // Every 5 minutes
			},
			jobId: 'recurring-job'
		});
	}
}
