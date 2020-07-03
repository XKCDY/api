import {BuildOptions, DataTypes, Model, Sequelize} from 'sequelize';

export enum ImgSize {
  x1 = 'x1',
  x2 = 'x2'
}

export interface ComicImgAttributes {
  id: string;
  height: number;
  width: number;
  ratio: number;
  sourceUrl: string;
  size: ImgSize;
}
export interface ComicImgModel extends Model<ComicImgAttributes>, ComicImgAttributes {}
export class ComicImg extends Model<ComicImgModel, ComicImgAttributes> {}

export type ComicImgStatic = typeof Model & (new (values?: Record<string, unknown>, options?: BuildOptions) => ComicImgModel);

export function ComicImgFactory(sequelize: Sequelize): ComicImgStatic {
  return sequelize.define('comic_imgs', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    height: {
      type: DataTypes.INTEGER
    },
    width: {
      type: DataTypes.INTEGER
    },
    ratio: {
      type: DataTypes.FLOAT
    },
    sourceUrl: {
      type: DataTypes.STRING
    },
    size: {
      type: DataTypes.STRING
    }
  }, {
    timestamps: false,
    indexes: [
      {
        unique: false,
        fields: ['comic_id']
      }
    ]
  }) as ComicImgStatic;
}
