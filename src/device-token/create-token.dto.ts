import {IsDefined, IsString} from 'class-validator';

export class CreateTokenDto {
	@IsDefined()
	@IsString()
	token!: string;

	@IsDefined()
	@IsString()
	version!: string;
}
