import {Injectable, OnModuleInit} from '@nestjs/common';
import {InjectQueue} from '@codetheweb/nestjs-bull';
import {Queue} from 'bullmq';

@Injectable()
export class ComicService implements OnModuleInit {
	constructor(@InjectQueue('scrape-comics') private readonly scrapeComicsQueue: Queue) {}

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
	}
}
