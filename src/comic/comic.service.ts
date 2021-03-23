import {Injectable, OnModuleInit} from '@nestjs/common';
import {InjectQueue} from '@codetheweb/nestjs-bull';
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
			jobId: '1'
		});

		// Add recurring job
		await this.scrapeComicsQueue.add('recurring-scrape', null, {
			repeat: {
				cron: '5 * * * *' // Every 5 minutes
			},
			jobId: '2'
		});

		// Run immediately if job doesn't exist
		await this.specialComicsQueue.add('initial-check', null, {
			jobId: '1'
		});

		// Add recurring job
		await this.specialComicsQueue.add('recurring-check', null, {
			repeat: {
				cron: '5 * * * *' // Every 5 minutes
			},
			jobId: '2'
		});
	}
}
