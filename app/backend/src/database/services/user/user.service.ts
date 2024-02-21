import { Injectable } from '@nestjs/common';
import {UserEntity} from "../../models/UserEntity";
import {DataSource, Repository} from "typeorm";
import {RegisterDTO} from "../../../authentication/payload/RegisterDTO";
import {rethrow} from "@nestjs/core/helpers/rethrow";

@Injectable()
export class UserService {
    private readonly userRepository: Repository<UserEntity>;
    constructor(private dataSource: DataSource) {
        this.userRepository = dataSource.getRepository(UserEntity);
    }
    async findUserByUsername(username: string): Promise<UserEntity | null> {
        return this.userRepository.findOne({where: { username: username }})
    }

    async findUserByUserId(userId: number): Promise<UserEntity | null> {
        return this.userRepository.findOne({where: { id: userId }})
    }
    
    async saveUser(username: string, password: string): Promise<UserEntity> {
        return await this.userRepository.save(new UserEntity(username, password));
    }

    async updateUser(userId: number, username: string): Promise<UserEntity | undefined> {
        const user = await this.findUserByUserId(userId);
        if(!user)
            return undefined;

        user.username = username;
        await this.userRepository.save(user);
        return user;
    }

    async isUserAdmin(userId: number): Promise<boolean> {
        return (await this.findUserByUserId(userId)).isAdmin;
    }
}
