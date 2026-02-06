import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { ThoughtRecord } from '../thought-records/thought-record.entity';

@Entity('reframe_cards')
export class ReframeCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'thought_record_id' })
  thoughtRecordId: string;

  @ManyToOne(() => ThoughtRecord, { eager: true })
  @JoinColumn({ name: 'thought_record_id' })
  thoughtRecord: ThoughtRecord;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'distortion_type' })
  distortionType: string;

  @Column({ name: 'effect_score', type: 'float', default: 0 })
  effectScore: number;

  @Column({ name: 'use_count', default: 0 })
  useCount: number;

  @Column({ name: 'is_bookmarked', default: false })
  isBookmarked: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
