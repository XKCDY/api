import {BullModule} from '@codetheweb/nestjs-bull';
import {Module} from '@nestjs/common';
import {join} from 'path';
import {PrismaModule} from 'src/prisma/prisma.module';
import {DeviceTokenController} from './device-token.controller';
import {DeviceTokenService} from './device-token.service';

@Module({
	imports: [
		PrismaModule,
		BullModule.registerQueue({
			name: 'send-notifications',
			processors: [join(__dirname, 'processors/send-notifications.js')]
		})
	],
	controllers: [DeviceTokenController],
	providers: [DeviceTokenService]
})
export class DeviceTokenModule {}
