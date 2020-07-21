import {PUT, DELETE, Path, PathParam} from 'typescript-rest';
import {DeviceToken} from '../models';

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
}
