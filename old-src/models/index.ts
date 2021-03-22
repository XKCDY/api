import * as sequelize from 'sequelize';
import {ComicFactory} from './comic';
import {ComicImgFactory} from './comic-img';
import {DeviceTokenFactory} from './device-token';
import {DB_URL} from '../lib/config';

export const db = new sequelize.Sequelize(DB_URL);

export const Comic = ComicFactory(db);
export const ComicImg = ComicImgFactory(db);
export const DeviceToken = DeviceTokenFactory(db);

Comic.Imgs = Comic.hasMany(ComicImg, {foreignKey: 'comic_id', as: 'imgs'});

DeviceToken.beforeCreate(async deviceToken => {
  if (deviceToken.lastComicIdSent) {
    return;
  }

  // Add latest comic ID as default
  const comic = await Comic.findOne({order: [['id', 'DESC']]});

  if (comic) {
    deviceToken.lastComicIdSent = comic.id;
  }
});