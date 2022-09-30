import type {Job} from 'bullmq';
import {Logger} from '@nestjs/common';
import apnProviderFactory from 'src/lib/apn-provider-factory';
import pLimit from 'p-limit';
import apn from 'apn';
import {db} from 'src/lib/db';

const logger = new Logger('Job: send notifications');

const provider = apnProviderFactory();

const processJob = async (_: Job) => {
	logger.log('Started processing...');

	// Get latest comic ID
	const latestComic = await db.selectFrom('comics').orderBy('id', 'desc').selectAll().executeTakeFirst();

	if (!latestComic) {
		return;
	}

	// Find tokens of devices that need to be updated
	const devicesToUpdate = await db.selectFrom('device_tokens').where('lastComicIdSent', '<', latestComic.id).select('token').execute();

	// Send notifications
	const limit = pLimit(10);

	await Promise.all(devicesToUpdate.map(async ({token}) => limit(async () => {
		const notification = new apn.Notification();

		notification.expiry = Math.floor(Date.now() / 1000) + 3600;
		notification.sound = 'ping.aiff';
		notification.alert = {
			title: 'New comic!',
			body: `${latestComic.title} (#${latestComic.id}) was just published.`
		};
		notification.topic = 'com.maxisom.xkcdy';
		notification.payload = {comicId: latestComic.id};

		const result = await provider.send(notification, token);

		// Success, update lastComicIdSent field
		await Promise.all(result.sent.map(async sent => {
			await db
				.updateTable('device_tokens')
				.set({lastComicIdSent: latestComic.id})
				.where('token', '=', sent.device)
				.execute();
		}));

		await Promise.all(result.failed.map(async failed => {
			if (failed.response?.reason === 'BadDeviceToken') {
				// Remove token
				await db.deleteFrom('device_tokens').where('token', '=', failed.device).execute();
			} else {
				logger.error(`Failed to send notification to ${failed.device}: ${failed.response?.reason ?? ''}`);
			}
		}));
	})));

	logger.log('Finished sending notifications');

	provider.shutdown();
};

export default processJob;
