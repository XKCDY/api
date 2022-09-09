import {Body, Controller, Delete, Injectable, NotFoundException, Param, Post, Put} from '@nestjs/common';
import apn from 'apn';
import {DbService} from 'src/db/db.service';
import apnProviderFactory from 'src/lib/apn-provider-factory';
import {CreateTokenDto} from './create-token.dto';

@Controller('device-tokens')
@Injectable()
export class DeviceTokenController {
	constructor(private readonly db: DbService) {}

	@Put()
	async putToken(@Body() createTokenDto: CreateTokenDto) {
		await this.db
			.insertInto('device_tokens')
			.values({
				...createTokenDto,
				lastComicIdSent: qb => qb.selectFrom('comics').orderBy('id', 'desc').limit(1).select('id'),
				updatedAt: new Date()
			})
			.onConflict(oc => oc.column('token').doUpdateSet({
				...createTokenDto,
				updatedAt: new Date()
			}))
			.execute();
	}

	@Delete(':token')
	async removeToken(@Param('token') token: string) {
		const existingToken = await this.db.selectFrom('device_tokens').where('token', '=', token).executeTakeFirst();

		if (!existingToken) {
			throw new NotFoundException('Token does not exist');
		}

		await this.db.deleteFrom('device_tokens').where('token', '=', token).execute();
	}

	@Post(':token/test')
	async sendTestNotification(@Param('token') token: string) {
		const provider = apnProviderFactory();

		const notification = new apn.Notification();

		notification.expiry = Math.floor(Date.now() / 1000) + 3600;
		notification.sound = 'ping.aiff';
		notification.alert = {
			title: 'New comic!',
			body: 'Test Comic (#2000) was just published.'
		};
		notification.topic = 'com.maxisom.xkcdy';
		notification.payload = {comicId: 2000};

		await provider.send(notification, token);
	}
}
