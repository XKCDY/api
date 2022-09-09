import {Kysely, PostgresDialect} from 'kysely';
import type {DB} from 'src/types/db';
import {Pool} from 'pg';

export const db = new Kysely<DB>({
	dialect: new PostgresDialect({
		pool: new Pool({
			connectionString: process.env.DATABASE_URL,
		})
	}),
});
