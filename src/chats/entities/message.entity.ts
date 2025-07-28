import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column()
  senderId: string;

  @Column()
  receiverId: string;

  @Column()
  rideId: string;

  @CreateDateColumn()
  createdAt: Date;
}
