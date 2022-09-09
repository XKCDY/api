import type {OnModuleInit, OnModuleDestroy} from '@nestjs/common';
import {Injectable} from '@nestjs/common';
import {Kysely, PostgresDialect} from 'kysely';
import {Pool} from 'pg';
import type {DB} from 'src/types/db';

@Injectable()
export class DbService extends Kysely<DB>
	implements OnModuleInit, OnModuleDestroy {
	private readonly pool: Pool;

	constructor() {
		const pool = new Pool({
			connectionString: process.env.DATABASE_URL,
		});

		super({
			dialect: new PostgresDialect({
				pool,
			}),
		});

		this.pool = pool;
	}

	async onModuleInit() {
		await this.pool.connect();
	}

	async onModuleDestroy() {
		await this.pool.end();
	}
}
