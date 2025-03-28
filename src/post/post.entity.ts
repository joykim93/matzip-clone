import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { MarkerColor } from './marker-color.enum';
import { ColumnNumericTransformer } from '../@common/numeric.transformer';
import { User } from 'src/auth/user.entity';
import { Image } from 'src/image/image.entity';
import { Favorite } from 'src/favorite/favorite.entity';

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

    @OneToMany(() => Image, (image) => image.post, { eager: false })
    images: Image[];

    @OneToMany(() => Favorite, (favorite) => favorite.post, { eager: false })
    favorites: Favorite[];
}
