import { IsString, IsOptional } from 'class-validator';

export class FilterCommentDto {
  @IsString()
  @IsOptional()
  prospectId?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  content?: string;
}
