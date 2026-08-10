import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class LoginDto {

  @ApiProperty({
    description: 'Username of the user',
    example: 'munna',
  })
  @IsString()
  @IsNotEmpty()
  username!: string;


  @ApiProperty({
    description: 'Password of the user',
    example: 'StrongPassword123!',
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;

}