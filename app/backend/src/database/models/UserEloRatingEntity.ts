import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './UserEntity';

@Entity()
export class UserEloRatingEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 1000, nullable: false })
    elo: number;

    @ManyToOne(() => UserEntity, { nullable: false, cascade: true })
    @JoinColumn()
    player: UserEntity;

    constructor(player: UserEntity, elo: number) {
        this.player = player;
        this.elo = elo;
    }
}
