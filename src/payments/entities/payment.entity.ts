import { Booking } from "src/bookings/entities/booking.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Booking, booking => booking.payments)
  booking: Booking;

  @Column()
  bookingId: string;

  @Column()
  phoneNumber: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  merchantRequestId: string;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'],
    default: 'PENDING'
  })
  status: string;

  @Column({ nullable: true })
  failureReason: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ default: false })
  isLatestAttempt: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
