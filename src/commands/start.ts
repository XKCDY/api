import {ApiServer} from '../api-server';

export default async () => {
  const apiServer = new ApiServer();

  try {
    await apiServer.start();
  } catch (error) {
    console.error(`Error starting server: ${error.message as string}`);
    process.exit(-1);
  }
};
