import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsOptional} from 'class-validator';
import {Type} from 'class-transformer';

export class GetAllComicsParameters {
	@IsNumber()
	@IsOptional()
	@Type(() => Number)
	@ApiProperty({required: false, description: 'return all comics after this ID'})
		since!: number;
}
