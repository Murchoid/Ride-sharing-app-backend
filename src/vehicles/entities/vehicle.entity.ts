import { Driver } from 'src/drivers/entities/driver.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  model: string;

  @Column({ unique: true })
  plate: string;

  @OneToOne(() => Driver, (driver) => driver.vehicle, {
     cascade:['soft-remove']
  })
  @JoinColumn()
  driver: Driver;

  @Column({default: false})
  isRetired: boolean;
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
