import type {ColumnType} from 'kysely';

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
	? ColumnType<S, I | undefined, U>
	: ColumnType<T, T | undefined, T>;

export type Int8 = ColumnType<string, string | number | bigint, string | number | bigint>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type GraphileWorkerJobQueues = {
	job_count: number;
	locked_at: Timestamp | undefined;
	locked_by: string | undefined;
	queue_name: string;
};

export type GraphileWorkerJobs = {
	attempts: Generated<number>;
	created_at: Generated<Timestamp>;
	id: Generated<Int8>;
	key: string | undefined;
	last_error: string | undefined;
	locked_at: Timestamp | undefined;
	locked_by: string | undefined;
	max_attempts: Generated<number>;
	payload: Generated<number>;
	priority: Generated<number>;
	queue_name: Generated<string | undefined>;
	run_at: Generated<Timestamp>;
	task_identifier: string;
	updated_at: Generated<Timestamp>;
};

export type GraphileWorkerMigrations = {
	id: number;
	ts: Generated<Timestamp>;
};

export type _PrismaMigrations = {
	applied_steps_count: Generated<number>;
	checksum: string;
	finished_at: Timestamp | undefined;
	id: string;
	logs: string | undefined;
	migration_name: string;
	rolled_back_at: Timestamp | undefined;
	started_at: Generated<Timestamp>;
};

export type ComicImgs = {
	comic_id: number;
	height: number;
	id: Generated<number>;
	ratio: number;
	size: string;
	sourceUrl: string;
	width: number;
};

export type Comics = {
	alt: string;
	explainUrl: string;
	id: number;
	interactiveUrl: string | undefined;
	news: string;
	publishedAt: Timestamp;
	safeTitle: string;
	sourceUrl: string;
	title: string;
	transcript: string;
};

export type DeviceTokens = {
	createdAt: Generated<Timestamp>;
	lastComicIdSent: number;
	token: string;
	updatedAt: Timestamp;
	version: string | undefined;
};

export type DB = {
	'graphile_worker.job_queues': GraphileWorkerJobQueues;
	'graphile_worker.jobs': GraphileWorkerJobs;
	'graphile_worker.migrations': GraphileWorkerMigrations;
	_prisma_migrations: _PrismaMigrations;
	comic_imgs: ComicImgs;
	comics: Comics;
	device_tokens: DeviceTokens;
};
