import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne } from 'typeorm';
import { MarkerColor } from './marker-color.enum';
import { ColumnNumericTransformer } from '../@common/numeric.transformer';
import { User } from 'src/auth/user.entity';

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

    @ManyToOne(() => User, (user) => user.post, { eager: false })
    user: User;
}
