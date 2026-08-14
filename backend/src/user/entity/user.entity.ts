import { ApiProperty } from '@nestjs/swagger';
import { UrlEntity } from 'src/url/entity/url.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @ApiProperty({
    description: 'Unique identifier of the user record',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  googleId!: string | null;

  @ApiProperty({
    description: 'Unique username of the user',
    example: 'habib',
    maxLength: 50,
  })
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  username!: string;

  @ApiProperty({
    description: 'Unique email address of the user',
    example: 'habib@example.com',
    maxLength: 256,
  })
  @Column({
    type: 'varchar',
    length: 256,
    unique: true,
  })
  email!: string;

  @ApiProperty({
    description: 'Hashed password of the user',
    example: '$2b$10$...',
  })
  @Column({
    nullable: true,
    type: 'varchar',
    length: 256,
  })
  password!: string | null;

  @ApiProperty({
    description: 'Role of the user in the system',
    example: 'guest',
  })
  @Column({
    type: 'varchar',
    length: 20,
    default: 'guest',
  })
  role!: string;

  @ApiProperty({
    description: 'Date and time when the user was created',
    example: '2026-08-04T10:30:00.000Z',
  })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at!: Date;

  // One user can have many URLs
  @OneToMany(() => UrlEntity, (url) => url.user)
  urls!: UrlEntity[];

}