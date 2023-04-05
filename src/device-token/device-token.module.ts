import {join} from 'node:path';
import {BullModule} from '@nestjs/bullmq';
import {Module} from '@nestjs/common';
import {DbModule} from 'src/db/db.module';
import {DeviceTokenController} from './device-token.controller';
import {DeviceTokenService} from './device-token.service';

@Module({
	imports: [
		DbModule,
		BullModule.registerQueue({
			name: 'send-notifications',
			processors: [join(__dirname, 'processors/send-notifications.js')]
		})
	],
	controllers: [DeviceTokenController],
	providers: [DeviceTokenService]
})
export class DeviceTokenModule {}
