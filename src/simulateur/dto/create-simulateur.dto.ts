import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateSimulateurDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  monthlyPrice: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}
