import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Length} from "class-validator";
import {UserEntity} from "./UserEntity";
import {UserDTO} from "../../user/payload/UserDTO";

@Entity()
export class GameResultEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => UserEntity, { nullable: false, lazy: true })
    @JoinColumn()
    player1: UserEntity;

    @ManyToOne(() => UserEntity, { nullable: false, lazy: true })
    @JoinColumn()
    player2: UserEntity;

    @ManyToOne(() => UserEntity, { nullable: true, lazy: true })
    @JoinColumn()
    winner: UserEntity | null;
}
