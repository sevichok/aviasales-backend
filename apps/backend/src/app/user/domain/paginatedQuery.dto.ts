import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class PaginatedQueryDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => +value)
  pageSize: number;
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => +value)
  pageNumber: number;
}
