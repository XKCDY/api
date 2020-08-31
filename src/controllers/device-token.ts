import {PUT, DELETE, POST, Path, PathParam} from 'typescript-rest';
import apn from 'apn';
import {DeviceToken} from '../models';
import {KEY_PATH, KEY_ID, KEY_TEAM_ID} from '../lib/config';

interface AddTokenRequest {
  token: string;
  version: string;
}

@Path('/device-tokens')
export class DeviceTokenController {
  @PUT
  public async addToken(data: AddTokenRequest): Promise<void> {
    // Upsert token
    const [savedToken, created] = await DeviceToken.findOrCreate({
      where: {
        token: data.token
      },
      defaults: data
    });

    if (!created) {
      // Need to update version and updatedAt fields
      savedToken.set('version', data.version);
      savedToken.changed('updatedAt', true);
      await savedToken.save();
    }
  }

  @Path(':token')
  @DELETE
  public async removeToken(@PathParam('token') token: string): Promise<void> {
    await DeviceToken.destroy({where: {token}});
  }

  @Path(':token/test')
  @POST
  public async sendTestNotification(@PathParam('token') token: string): Promise<void> {
    const apnProvider = new apn.Provider({
      token: {
        key: KEY_PATH,
        keyId: KEY_ID,
        teamId: KEY_TEAM_ID
      }
    });

    const notification = new apn.Notification();

    notification.expiry = Math.floor(Date.now() / 1000) + 3600;
    notification.sound = 'ping.aiff';
    notification.alert = {
      title: 'New comic!',
      body: 'Test Comic (#2000) was just published.'
    };
    notification.topic = 'com.maxisom.xkcdy';
    notification.payload = {comicId: 2000};

    await apnProvider.send(notification, token);
  }
}
