import {db} from '../models';

export default async () => {
  await db.sync();
};
