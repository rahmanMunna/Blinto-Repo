import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
    @ApiProperty({
        description: 'Unique identifier of the user record',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({
        description: 'Unique short code generated for the original URL',
        example: 'aB3xY91Q',
        maxLength: 10,
    })
    @Column({ type: 'varchar', length: 10, unique: true })
    user_name!: string;

    @ApiProperty({
        description: 'Original long URL that the short URL redirects to',
        example: 'https://www.example.com/xyzxyzxyz',
    })
    @Column({ type: 'varchar', length: 256 })
    email!: string;

    @ApiProperty({
        description: 'Password for the user account',
        example: 'P@ssw0rd123',
    })
    @Column({ type: 'varchar', length: 256 })
    password!: string;

    @ApiProperty({
        description: 'Role of the user in the system',
        example: 'guest',
    })
    role!: string;

    @ApiProperty({
        description: 'Date and time when the short URL was created',
        example: '2026-08-04T10:30:00.000Z',
    })
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

}