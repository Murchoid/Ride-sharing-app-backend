// src/entities/notification.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  receiverId: string;

  @Column()
  title: string;

  @Column()
  body: string;

  @CreateDateColumn()
  createdAt: Date;
}
