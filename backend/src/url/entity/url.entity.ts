import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('urls')
export class UrlEntity {
  @ApiProperty({
    description: 'Unique identifier of the URL record',
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
  short_code!: string;

  @ApiProperty({
    description: 'Original long URL that the short URL redirects to',
    example: 'https://www.example.com/xyzxyzxyz',
  })
  @Column({ type: 'varchar', length: 256 })
  original_url!: string;

  @ApiProperty({
    description: 'Date and time when the short URL was created',
    example: '2026-08-04T10:30:00.000Z',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @ApiProperty({
    description: 'Number of times the short URL has been accessed',
    example: 25,
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  visit_count!: number;
}