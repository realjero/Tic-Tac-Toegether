import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../models/UserEntity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserService {
    private readonly userRepository: Repository<UserEntity>;
    constructor(private dataSource: DataSource) {
        this.userRepository = dataSource.getRepository(UserEntity);
    }
    async findUserByUsername(username: string): Promise<UserEntity | null> {
        return this.userRepository.findOne({ where: { username: username } });
    }

    async findUserByUserId(userId: number): Promise<UserEntity | null> {
        return this.userRepository.findOne({ where: { id: userId } });
    }

    async saveUser(username: string, password: string): Promise<UserEntity> {
        return await this.userRepository.save(new UserEntity(username, password));
    }

    async updateUser(userId: number, username: string): Promise<UserEntity | undefined> {
        const user = await this.findUserByUserId(userId);
        if (!user) return undefined;

        user.username = username;
        return await this.userRepository.save(user);
    }

    async isUserAdmin(userId: number): Promise<boolean> {
        return (await this.findUserByUserId(userId)).isAdmin;
    }

    async saveImage(userId: number, buffer: Buffer): Promise<UserEntity | undefined> {
        const user = await this.findUserByUserId(userId);
        if (!user) return undefined;

        user.image = buffer;
        return await this.userRepository.save(user);
    }

    async getImageAsByteArrayByUserId(userId: number): Promise<Buffer | undefined> {
        const user = await this.findUserByUserId(userId);
        return !user ? undefined : user.image;
    }

    async updateUserPassword(userId: number, newPassword: string) {
        const user = await this.findUserByUserId(userId);
        if (!user) return undefined;

        user.password = newPassword;
        return await this.userRepository.save(user);
    }
}
