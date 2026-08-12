import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
    ) { }

    async isUsernameExist(username: string): Promise<boolean> {
        const user = await this.userRepo.findOne({
            where: { username },
        });

        return !!user;
    }

    async isEmailExist(email: string): Promise<boolean> {
        const user = await this.userRepo.findOne({
            where: { email },
        });

        return !!user;
    }

    async createUser(
        createUserDto: CreateUserDto,
        role: string,
    ): Promise<UserEntity> {
        const usernameExists = await this.isUsernameExist(
            createUserDto.username,
        );

        if (usernameExists) {
            throw new ConflictException('Username already exists');
        }

        const emailExists = await this.isEmailExist(
            createUserDto.email,
        );

        if (emailExists) {
            throw new ConflictException('Email already exists');
        }

        const user = this.userRepo.create({
            username: createUserDto.username,
            email: createUserDto.email,
            password: createUserDto.password,
            role,
        });

        return await this.userRepo.save(user);
    }

    async findByUsername(username: string): Promise<UserEntity | null> {
        return this.userRepo.findOne({
            where: { username },
        });
    }

    async findById(id: string): Promise<UserEntity | null> {
        return this.userRepo.findOne({
            where: { id },
        });
    }

    async findUserOrFail(id: string): Promise<UserEntity> {
        const user = await this.findById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async IsValidatePassword(
        plainPassword: string,
        hashedPassword: string,
    ): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    async findUserByEmail(email: string): Promise<UserEntity | null> {
        const user = await this.userRepo.findOne({
            where: {
                email: email
            }
        })

        return user;
    }

    async findUserByGoogleId(googleId: string): Promise<UserEntity | null> {
        const user = await this.userRepo.findOne({
            where: {
                googleId: googleId
            }
        })

        return user;
    }

    async createUserByGoogleSignIn(googleUser): Promise<UserEntity> {
        let user = this.userRepo.create({
            googleId: googleUser.googleId,
            email: googleUser.email,
            username: googleUser.email,
            // firstName: googleUser.firstName,
            // lastName: googleUser.lastName,
            // avatar: googleUser.avatar,
            password: null,
            role: "guest",
        });

        return await this.userRepo.save(user);
    }


}