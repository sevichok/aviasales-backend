import { IsEmail } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, validate } from 'class-validator';

export class TokenDto {
  @ApiProperty({
    description: 'access-token',
  })
  @IsString()
  @IsNotEmpty()
  access_token: string;

  @ApiProperty({
    description: 'refresh-token',
  })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;

  static toEntity(entity?: TokenDto) {
    const it = {
        access_token : entity.access_token,
        refresh_token : entity.refresh_token
    }
    return it;
  }
}
