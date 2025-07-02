import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    let { password } = createUserDto;
    const salt = await bcrypt.genSalt(20);
    password = await bcrypt.hash(password, salt);
    const preparedUser = this.userRepo.create({
      ...createUserDto,
      password,
    });

    const user = await this.userRepo.save(preparedUser);
    return user;
  }

  async findAll() {
    const user = await this.userRepo.find();
    return user;
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOneBy({
      id,
    });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepo.update(id, updateUserDto);
    return user;
  }

  async remove(id: string) {
    const user = await this.userRepo.delete(id);
    return user;
  }
}
