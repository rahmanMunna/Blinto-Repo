import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterGuestDto {
  @ApiProperty({
    description: 'Username of the guest user',
    example: 'munna',
  })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({
    description: 'Email address of the guest user',
    example: 'munna@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Password for the guest account',
    example: 'StrongPassword123!',
    format: 'password',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({
    description: 'Password confirmation; must match the password',
    example: 'StrongPassword123!',
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword!: string;
}