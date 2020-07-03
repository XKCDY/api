import {BuildOptions, DataTypes, Model, Sequelize, HasMany} from 'sequelize';
import {ComicImg, ComicImgModel} from './comic-img';

export interface ComicAttributes {
  id: number;
  publishedAt: Date;
  news: string;
  safeTitle: string;
  title: string;
  transcript: string;
  alt: string;
  sourceUrl: string;
  explainUrl: string;
  interactiveUrl?: string;
  imgs?: ComicImg[] | ComicImgModel[];
}
export interface ComicModel extends Model<ComicAttributes>, ComicAttributes {}
export class Comic extends Model<ComicModel, ComicAttributes> {}

export type ComicStatic = typeof Model & (new (values?: Record<string, unknown>, options?: BuildOptions) => ComicModel) & {Imgs: HasMany<ComicModel, ComicImgModel>};

export function ComicFactory(sequelize: Sequelize): ComicStatic {
  return sequelize.define('comics', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: false,
      primaryKey: true
    },
    publishedAt: {
      type: DataTypes.DATE
    },
    news: {
      type: DataTypes.TEXT
    },
    safeTitle: {
      type: DataTypes.TEXT
    },
    title: {
      type: DataTypes.TEXT
    },
    transcript: {
      type: DataTypes.TEXT
    },
    alt: {
      type: DataTypes.TEXT
    },
    sourceUrl: {
      type: DataTypes.STRING
    },
    explainUrl: {
      type: DataTypes.STRING
    },
    interactiveUrl: {
      type: DataTypes.STRING
    }
  }, {
    timestamps: false
  }) as ComicStatic;
}
