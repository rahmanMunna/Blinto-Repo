import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('urls')
export class UrlEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 10, unique: true })
    short_code!: string;

    @Column({ type: 'varchar', length: 256 })
    original_url!: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ type: 'int', default: 0 })
    visit_count!: number;
}