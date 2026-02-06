import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PipelineStage } from './pipeline-stage.entity';
import { CreatePipelineStageDto, UpdatePipelineStageDto } from './pipeline-stages.dto';

const DEFAULT_STAGES = [
  { label: '지원', order: 0, encouragement: '첫 발을 내딛었어요!' },
  { label: '서류', order: 1, encouragement: '한 걸음 더 나아갔어요!' },
  { label: '면접', order: 2, encouragement: '거의 다 왔어요, 힘내세요!' },
  { label: '오퍼', order: 3, encouragement: '해냈어요! 축하합니다!' },
];

@Injectable()
export class PipelineStagesService {
  constructor(
    @InjectRepository(PipelineStage)
    private readonly repo: Repository<PipelineStage>,
  ) {}

  async findAll(userId: string): Promise<PipelineStage[]> {
    let stages = await this.repo.find({
      where: { userId },
      order: { order: 'ASC' },
    });
    if (stages.length === 0) {
      stages = await this.initDefaults(userId);
    }
    return stages;
  }

  async initDefaults(userId: string): Promise<PipelineStage[]> {
    const stages = DEFAULT_STAGES.map((s) =>
      this.repo.create({ ...s, userId, isDefault: true }),
    );
    return this.repo.save(stages);
  }

  async create(userId: string, dto: CreatePipelineStageDto): Promise<PipelineStage> {
    const stage = this.repo.create({ ...dto, userId, isDefault: false });
    return this.repo.save(stage);
  }

  async update(id: string, dto: UpdatePipelineStageDto): Promise<PipelineStage> {
    const stage = await this.repo.findOneBy({ id });
    if (!stage) throw new NotFoundException('Stage not found');
    Object.assign(stage, dto);
    return this.repo.save(stage);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async reorder(stages: { id: string; order: number }[]): Promise<void> {
    for (const s of stages) {
      await this.repo.update(s.id, { order: s.order });
    }
  }
}
