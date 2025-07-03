import { Booking } from 'src/bookings/entities/booking.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'enum', enum: ['CUSTOMER', 'DRIVER', 'ADMIN'] })
  role: string;

  @OneToOne(() => Driver, (driver) => driver.user)
  driver: Driver;

  @OneToMany(() => Booking, (booking) => booking.customer)
  bookings: Booking[];

  @Column({default: true})
  isActive: boolean;

  @Column({ nullable: true })
  accessToken?: string;

  @Column({ nullable: true })
  refreshToken?: string;
}
