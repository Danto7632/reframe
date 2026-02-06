import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Application } from '../applications/application.entity';

@Entity('thought_records')
export class ThoughtRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'application_id', nullable: true })
  applicationId: string | null;

  @ManyToOne(() => Application, { eager: true, nullable: true })
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @Column({
    name: 'situation_type',
    type: 'enum',
    enum: ['rejection', 'interview_after', 'coding_test_after', 'acceptance', 'other'],
  })
  situationType: string;

  @Column({ name: 'situation_detail', type: 'text' })
  situationDetail: string;

  @Column({ name: 'emotions_before', type: 'json' })
  emotionsBefore: { name: string; intensity: number }[];

  @Column({ name: 'automatic_thought', type: 'text' })
  automaticThought: string;

  @Column({ type: 'json' })
  distortions: { type: string; label: string; reason: string }[];

  @Column({ name: 'ai_reframe', type: 'text', nullable: true })
  aiReframe: string | null;

  @Column({ name: 'user_reframe', type: 'text', nullable: true })
  userReframe: string | null;

  @Column({ name: 'emotions_after', type: 'json', nullable: true })
  emotionsAfter: { name: string; intensity: number }[] | null;

  @Column({ name: 'is_completed', default: false })
  isCompleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
