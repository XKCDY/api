import {BuildOptions, DataTypes, Model, Sequelize} from 'sequelize';

export interface DeviceTokenAttributes {
  token: string;
  version: string;
  lastComicIdSent?: number;
  updatedAt?: Date;
}
export interface DeviceTokenModel extends Model<DeviceTokenAttributes>, DeviceTokenAttributes {}
export class DeviceToken extends Model<DeviceTokenModel, DeviceTokenAttributes> {}

export type DeviceTokenStatic = typeof Model & (new (values?: Record<string, unknown>, options?: BuildOptions) => DeviceTokenModel);

export function DeviceTokenFactory(sequelize: Sequelize): DeviceTokenStatic {
  return sequelize.define('device_tokens', {
    token: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    version: DataTypes.STRING,
    lastComicIdSent: DataTypes.INTEGER
  }) as DeviceTokenStatic;
}
