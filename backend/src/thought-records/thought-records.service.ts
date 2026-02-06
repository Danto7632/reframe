import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ThoughtRecord } from './thought-record.entity';
import { CreateThoughtRecordDto, UpdateThoughtRecordDto } from './thought-records.dto';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ThoughtRecordsService {
  constructor(
    @InjectRepository(ThoughtRecord)
    private readonly repo: Repository<ThoughtRecord>,
    private readonly aiService: AiService,
  ) {}

  async findAll(userId: string, filters?: { applicationId?: string; completed?: string }): Promise<ThoughtRecord[]> {
    const qb = this.repo
      .createQueryBuilder('tr')
      .leftJoinAndSelect('tr.application', 'app')
      .where('tr.userId = :userId', { userId })
      .orderBy('tr.createdAt', 'DESC');

    if (filters?.applicationId) {
      qb.andWhere('tr.applicationId = :appId', { appId: filters.applicationId });
    }
    if (filters?.completed === 'true') {
      qb.andWhere('tr.isCompleted = true');
    } else if (filters?.completed === 'false') {
      qb.andWhere('tr.isCompleted = false');
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<ThoughtRecord> {
    const record = await this.repo.findOne({
      where: { id },
      relations: ['application'],
    });
    if (!record) throw new NotFoundException('Thought record not found');
    return record;
  }

  async create(userId: string, dto: CreateThoughtRecordDto): Promise<ThoughtRecord> {
    const record = this.repo.create({
      ...dto,
      userId,
      distortions: dto.distortions || [],
      isCompleted: dto.isCompleted || false,
    });
    return this.repo.save(record);
  }

  async update(id: string, dto: UpdateThoughtRecordDto): Promise<ThoughtRecord> {
    const record = await this.findOne(id);
    Object.assign(record, dto);
    return this.repo.save(record);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Thought record not found');
  }

  async analyzeDistortions(thought: string, situationType: string, situationDetail?: string) {
    return this.aiService.analyzeDistortions(thought, situationType, situationDetail);
  }

  async getReframeSuggestions(
    thought: string,
    distortions: string[],
    situationType: string,
    company?: string,
    position?: string,
  ) {
    return this.aiService.getReframeSuggestions(thought, distortions, situationType, company, position);
  }

  async getDistortionDistribution(userId: string) {
    const records = await this.repo.find({ where: { userId } });
    const dist: Record<string, number> = {};
    for (const r of records) {
      if (r.distortions) {
        for (const d of r.distortions) {
          dist[d.type] = (dist[d.type] || 0) + 1;
        }
      }
    }
    const total = Object.values(dist).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(dist).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  }

  async getEmotionTrends(userId: string) {
    const records = await this.repo.find({
      where: { userId, isCompleted: true },
      order: { createdAt: 'ASC' },
    });
    return records.map((r) => {
      const avgBefore =
        r.emotionsBefore.reduce((s, e) => s + e.intensity, 0) / (r.emotionsBefore.length || 1);
      const avgAfter = r.emotionsAfter
        ? r.emotionsAfter.reduce((s, e) => s + e.intensity, 0) / (r.emotionsAfter.length || 1)
        : null;
      return {
        date: new Date(r.createdAt).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }),
        avgBefore: Math.round(avgBefore * 10) / 10,
        avgAfter: avgAfter ? Math.round(avgAfter * 10) / 10 : null,
      };
    });
  }
}
