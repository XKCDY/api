import {Body, Controller, Delete, Injectable, Param, Post, Put} from '@nestjs/common';
import apn from 'apn';
import apnProviderFactory from 'src/lib/apn-provider-factory';
import {PrismaService} from 'src/prisma/prisma.service';
import {CreateTokenDto} from './create-token.dto';

@Controller('device-tokens')
@Injectable()
export class DeviceTokenController {
	constructor(private readonly prisma: PrismaService) {}

	@Put()
	async addToken(@Body() createTokenDto: CreateTokenDto) {
		const latestComic = await this.prisma.comic.findFirst({orderBy: {id: 'desc'}});

		await this.prisma.deviceToken.upsert({
			create: {
				...createTokenDto,
				lastComicIdSent: latestComic?.id ?? 0
			},
			update: createTokenDto,
			where: {
				token: createTokenDto.token
			}
		});
	}

	@Delete(':token')
	async removeToken(@Param('token') token: string) {
		await this.prisma.deviceToken.delete({where: {token}});
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
