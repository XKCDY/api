import migrate from './migrate';
import start from './start';

export default async () => {
  await migrate();
  await start();
};
