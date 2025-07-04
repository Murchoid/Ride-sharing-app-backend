import { Booking } from "src/bookings/entities/booking.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Booking, booking => booking.payment)
  @JoinColumn()
  booking: Booking;

  @Column()
  phoneNumber: string;

  @Column('float')
  amount: number;

  @Column({nullable:true})
  merchantRequestId: string

  @Column({ type: 'enum', enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
