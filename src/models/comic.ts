import {BuildOptions, DataTypes, Model, Sequelize} from 'sequelize';

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
}
export interface ComicModel extends Model<ComicAttributes>, ComicAttributes {}
export class Comic extends Model<ComicModel, ComicAttributes> {}

export type ComicStatic = typeof Model & (new (values?: Record<string, unknown>, options?: BuildOptions) => ComicModel);

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
      type: DataTypes.STRING
    },
    safeTitle: {
      type: DataTypes.STRING
    },
    title: {
      type: DataTypes.STRING
    },
    transcript: {
      type: DataTypes.STRING
    },
    alt: {
      type: DataTypes.STRING
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
