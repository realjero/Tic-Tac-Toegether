import { Injectable } from '@nestjs/common';
import {UserEntity} from "../../models/UserEntity";
import {DataSource, Repository} from "typeorm";
import {LoginRegisterDTO} from "../../../authentication/payload/LoginRegisterDTO";

@Injectable()
export class UserService {
    private readonly userRepository: Repository<UserEntity>;
    constructor(private dataSource: DataSource) {
        this.userRepository = dataSource.getRepository(UserEntity);
    }
    async findUserByUsername(username: string): Promise<UserEntity | null> {
        return this.userRepository.findOne({where: {username: username}})
    }

    async saveUser(username: string, password: string): Promise<UserEntity> {
        return await this.userRepository.save(new UserEntity(username, password));
    }
}
