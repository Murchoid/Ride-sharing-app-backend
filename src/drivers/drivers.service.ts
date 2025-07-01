import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Driver } from './entities/driver.entity';
import { Repository } from 'typeorm';
import { DriversModule } from './drivers.module';
import { NotFoundException } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepo: Repository<Driver>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ){}
  async create(createDriverDto: CreateDriverDto) {
    //logic to check for user and save
    const { userId } = createDriverDto;
    if(!userId) throw new NotFoundException('User id must be provided');
    const user = await this.userRepo.findOneBy({
      where:{id: userId}
    });
    if(!user) throw new NotFoundException('User not found!');
    const preparedDriver = this.driverRepo.create({
      ...createDriverDto,
      user
    })

    const driver = await this.driverRepo.save(createDriverDto);
    return driver;
  }

  async findAll() {
    const driver = await this.driverRepo.find();
  }

  async findOne(id: number) {
    const driver = await this.driverRepo.findOneBy({
      where:{id}
    });

    return driver;
  }

  async update(id: number, updateDriverDto: UpdateDriverDto) {
    const driver = await this.driverRepo.update(id, updateDriverDto);
    return driver;
  }

  async remove(id: number) {
    const driver = await this.driverRepo.delete(id);
    return driver;
  }
}
