import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UsersModule } from './users.module';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<UsersModule>
  ){}
  async create(createUserDto: CreateUserDto) {
    const user = await this.userRepo.save(createUserDto);
    return user;
  }

  async findAll() {
    const user = await this.userRepo.find();
    return user;
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOneBy({
      where:{id}
    });
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepo.update(id, updateUserDto);
    return user;
  }

  async remove(id: number) {
    const user = await this.userRepo.delete(id);
    return user;
  }
}
