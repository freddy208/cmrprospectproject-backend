import { PartialType } from '@nestjs/mapped-types';
import { CreateSimulateurDto } from './create-simulateur.dto';

export class UpdateSimulateurDto extends PartialType(CreateSimulateurDto) {}
