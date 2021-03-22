import {Job} from 'bullmq';
import {PrismaClient} from '@prisma/client';
import {Logger} from '@nestjs/common';
import apnProviderFactory from 'src/lib/apn-provider-factory';
import pLimit from 'p-limit';
import apn from 'apn';

const prisma = new PrismaClient();
const logger = new Logger('Job: send notifications');

const provider = apnProviderFactory();

const processJob = async (_: Job) => {
	logger.log('Started processing...');

	// Get latest comic ID
	const latestComic = await prisma.comic.findFirst({orderBy: {id: 'desc'}});

	if (!latestComic) {
		return;
	}

	// Find tokens of devices that need to be updated
	const devicesToUpdate = await prisma.deviceToken.findMany({
		where: {
			lastComicIdSent: {
				lt: latestComic.id
			}
		},
		select: {
			token: true
		}
	});

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
		await Promise.all(result.sent.map(async sent => prisma.deviceToken.update({
			data: {
				lastComicIdSent: latestComic.id
			},
			where: {
				token: sent.device
			}
		})));

		await Promise.all(result.failed.map(async failed => {
			if (failed.response?.reason === 'BadDeviceToken') {
				// Remove token
				await prisma.deviceToken.delete({where: {token: failed.device}});
			}
		}));
	})));

	logger.log('Finished sending notifications');

	await prisma.$disconnect();
	provider.shutdown();
};

export default processJob;
