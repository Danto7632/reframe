import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { PipelineStage } from '../pipeline-stages/pipeline-stage.entity';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  company: string;

  @Column()
  position: string;

  @Column({ name: 'applied_at', type: 'date' })
  appliedAt: string;

  @Column({ name: 'resume_type', type: 'enum', enum: ['file', 'link', 'label'], nullable: true })
  resumeType: 'file' | 'link' | 'label' | null;

  @Column({ name: 'resume_value', type: 'varchar', length: 500, nullable: true })
  resumeValue: string | null;

  @Column({ name: 'current_stage_id', nullable: true })
  currentStageId: string | null;

  @ManyToOne(() => PipelineStage, { eager: true, nullable: true })
  @JoinColumn({ name: 'current_stage_id' })
  currentStage: PipelineStage;

  @Column({ type: 'enum', enum: ['active', 'offered', 'rejected'], default: 'active' })
  status: 'active' | 'offered' | 'rejected';

  @Column({ name: 'is_rejected', default: false })
  isRejected: boolean;

  @Column({ type: 'text', nullable: true })
  memo: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
