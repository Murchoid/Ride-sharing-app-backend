import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Driver } from './entities/driver.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepo: Repository<Driver>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}
  async create(createDriverDto: CreateDriverDto) {
    //logic to check for user and save
    const { userId } = createDriverDto;
    if (!userId) throw new NotFoundException('User id must be provided');
    const user = await this.userRepo.findOneBy({
      id: userId,
    });
    if (!user) throw new NotFoundException('User not found!');
    const preparedDriver = this.driverRepo.create({
      ...createDriverDto,
      user,
    });

    const driver = await this.driverRepo.save(preparedDriver);
    user.role = 'DRIVER';
    await this.userRepo.update(user.id, user);
    return driver;
  }

  async findAll() {
    const driver = await this.driverRepo.find();
    return driver;
  }

  async findOne(id: string) {
    const driver = await this.driverRepo.findOne({
      where: { id, isActive: true },
    });

    return driver;
  }

  async update(id: string, updateDriverDto: UpdateDriverDto) {
    const driver = await this.driverRepo.update(id, updateDriverDto);
    return driver;
  }

  async remove(id: string) {
    const driver = await this.driverRepo.findOneBy({ id });
    if (driver) {
      driver.isActive = false;
      driver.isAvailable = false;
      await this.driverRepo.save(driver);

      return driver.id;
    }

    throw new NotFoundException('Driver not foind!');
  }
}
