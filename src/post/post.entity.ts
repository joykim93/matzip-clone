import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { MarkerColor } from './marker-color.enum';
import { ColumnNumericTransformer } from '../@common/numeric.transformer';

@Entity()
export class Post extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'decimal',
        transformer: new ColumnNumericTransformer(),
    })
    latitude: number;

    @Column({
        type: 'decimal',
        transformer: new ColumnNumericTransformer(),
    })
    longitude: number;

    @Column()
    color: MarkerColor;

    @Column()
    title: string;

    @Column()
    address: string;

    @Column()
    description: string;

    @Column({
        type: 'timestamp with time zone',
        default: () => 'CURRENT_TIMESTAMP',
    })
    date: Date;

    @Column()
    score: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date | null;
}
