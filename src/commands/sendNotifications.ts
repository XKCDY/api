import {Op} from 'sequelize';
import apn from 'apn';
import {DeviceToken, Comic} from '../models';
import {KEY_PATH, KEY_ID, KEY_TEAM_ID} from '../lib/config';

export default async () => {
  // Get latest comic ID
  const latestComic = await Comic.findOne({order: [['id', 'DESC']]});

  if (!latestComic) {
    return;
  }

  // Find tokens of devices that need to be updated
  const devicesToUpdate = await DeviceToken.findAll({
    where: {
      lastComicIdSent: {
        [Op.lt]: latestComic.id
      }
    },
    attributes: ['token']
  });

  // Send notifications
  const apnProvider = new apn.Provider({
    token: {
      key: KEY_PATH,
      keyId: KEY_ID,
      teamId: KEY_TEAM_ID
    }
  });

  await Promise.all(devicesToUpdate.map(async deviceToken => {
    const notification = new apn.Notification();

    notification.expiry = Math.floor(Date.now() / 1000) + 3600;
    notification.sound = 'ping.aiff';
    notification.alert = {
      title: 'New comic!',
      body: `#${latestComic.id} was just published.`
    };
    notification.topic = 'com.maxisom.xkcdy';

    const result = await apnProvider.send(notification, deviceToken.token);

    await Promise.all(result.sent.map(async sent => {
      // Success, update lastComicIdSent field
      await DeviceToken.update({
        lastComicIdSent: latestComic.id
      }, {
        where: {
          token: sent.device
        }
      });
    }));

    await Promise.all(result.failed.map(async failed => {
      if (failed.response?.reason === 'BadDeviceToken') {
        // Remove token
        await DeviceToken.destroy({where: {token: failed.device}});
      }
    }));
  }));

  apnProvider.shutdown();
};
