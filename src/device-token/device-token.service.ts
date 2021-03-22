import {Injectable, OnModuleInit} from '@nestjs/common';
import {InjectQueue} from '@codetheweb/nestjs-bull';
import {Queue} from 'bullmq';

@Injectable()
export class DeviceTokenService implements OnModuleInit {
	constructor(@InjectQueue('send-notifications') private readonly sendNotificationsQueue: Queue) {}

	async onModuleInit() {
		// Run immediately if job doesn't exist
		await this.sendNotificationsQueue.add('initial-process', null, {
			jobId: '1'
		});

		// Add recurring job
		await this.sendNotificationsQueue.add('recurring-process', null, {
			repeat: {
				cron: '5 * * * *' // Every 5 minutes
			},
			jobId: '2'
		});
	}
}
