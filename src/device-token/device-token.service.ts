import type {OnModuleInit} from '@nestjs/common';
import {Injectable} from '@nestjs/common';
import {InjectQueue} from '@nestjs/bullmq';
import {Queue} from 'bullmq';

@Injectable()
export class DeviceTokenService implements OnModuleInit {
	constructor(@InjectQueue('send-notifications') private readonly sendNotificationsQueue: Queue) {}

	async onModuleInit() {
		// Run immediately if job doesn't exist
		await this.sendNotificationsQueue.add('initial-process', null, {});

		// Add recurring job
		await this.sendNotificationsQueue.add('recurring-process', null, {
			repeat: {
				pattern: '*/5 * * * *' // Every 5 minutes
			},
		});
	}
}
