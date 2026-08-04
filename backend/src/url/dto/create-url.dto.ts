// dto/create-url.dto.ts

import { IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUrlDto {
  @ApiProperty({
    example: 'https://www.google.com',
  })
  @IsUrl()
  originalUrl!: string;
}