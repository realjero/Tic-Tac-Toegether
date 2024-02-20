import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {Length} from "class-validator";
@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @Length(6, 64)
    username: string

    @Column()
    @Length(8, 60)
    password: string

    @Column({default: 1000})
    elo: number

    @Column({default: false})
    isAdmin: boolean;

    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
    }
}
