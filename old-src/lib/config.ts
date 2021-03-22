import dotenv from 'dotenv';
dotenv.config({path: `${__dirname}/../../.env`});

export const DB_URL = process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost/postgres';

export const KEY_PATH = process.env.KEY_PATH as string;
export const KEY_ID = process.env.KEY_ID as string;
export const KEY_TEAM_ID = process.env.KEY_TEAM_ID as string;
