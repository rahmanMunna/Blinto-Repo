import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty({
        
    })
    username!: string;
    email!: string;
    password!: string;
    confirmPassword!: string;
}