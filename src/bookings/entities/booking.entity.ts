import { Driver } from 'src/drivers/entities/driver.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
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

  @Column('float', { nullable: true })
  distanceKm: number;

  @Column('float', { nullable: true })
  durationMins: number;

  @Column({ nullable: true, type: 'float' })
  price: number;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING',
  })
  status: string;

  @Column({ type: 'enum', enum: ['PENDING', 'PAID'], default: 'PENDING' })
  paymentStatus: string;

  @Column({ type: 'enum', enum: ['CASH', 'MPESA'], default: 'CASH' })
  paymentMethod: string;

   @OneToOne(() => Payment, payment => payment.booking, { nullable: true })
  payment: Payment;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
