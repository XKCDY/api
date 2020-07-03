import * as sequelize from 'sequelize';
import {ComicFactory} from './comic';
import {ComicImgFactory} from './comic-img';

export const db = new sequelize.Sequelize(process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost/postgres');

export const Comic = ComicFactory(db);
export const ComicImg = ComicImgFactory(db);

Comic.Imgs = Comic.hasMany(ComicImg, {foreignKey: 'comic_id', as: 'imgs'});
