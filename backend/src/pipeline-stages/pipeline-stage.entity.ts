import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('pipeline_stages')
export class PipelineStage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  label: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  order: number;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ nullable: true })
  encouragement: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
