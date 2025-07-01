import { Driver } from 'src/drivers/entities/driver.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.bookings)
  customer: User;

  @ManyToOne(() => Driver, (driver) => driver.bookings, { nullable: true })
  driver: Driver;

  @Column()
  pickupAddress: string;

  @Column()
  dropoffAddress: string;

  @Column('float')
  pickupLat: number;

  @Column('float')
  pickupLng: number;

  @Column('float')
  dropoffLat: number;

  @Column('float')
  dropoffLng: number;

  @Column('float')
  distanceKm: number;

  @Column('int')
  durationMins: number;

  @Column('float')
  price: number;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING',
  })
  status: string;

  @Column({ type: 'enum', enum: ['PENDING', 'PAID'], default: 'PENDING' })
  paymentStatus: string;

  @Column({ type: 'enum', enum: ['CASH', 'MPESA', 'CARD'], default: 'CASH' })
  paymentMethod: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
