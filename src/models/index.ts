import * as sequelize from 'sequelize';
import {ComicFactory} from './comic';
import {ComicImgFactory} from './comic-img';

export const db = new sequelize.Sequelize(
  'postgres',
  'postgres',
  '',
  {
    port: Number(process.env.DB_PORT) ?? 5432,
    host: process.env.DB_HOST ?? 'localhost',
    dialect: 'postgres',
    pool: {
      min: 0,
      max: 5,
      acquire: 30000,
      idle: 10000
    }
  }
);

export const Comic = ComicFactory(db);
export const ComicImg = ComicImgFactory(db);

Comic.Imgs = Comic.hasMany(ComicImg, {foreignKey: 'comic_id', as: 'imgs'});
