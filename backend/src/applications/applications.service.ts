import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './application.entity';
import { CreateApplicationDto, UpdateApplicationDto } from './applications.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly repo: Repository<Application>,
  ) {}

  async findAll(userId: string, filters?: { status?: string; search?: string }): Promise<Application[]> {
    const qb = this.repo
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.currentStage', 'stage')
      .where('app.userId = :userId', { userId })
      .orderBy('app.createdAt', 'DESC');

    if (filters?.search) {
      qb.andWhere('(app.company LIKE :search OR app.position LIKE :search)', {
        search: `%${filters.search}%`,
      });
    }
    if (filters?.status === 'rejected') {
      qb.andWhere('app.isRejected = :rejected', { rejected: true });
    } else if (filters?.status === 'active') {
      qb.andWhere('app.isRejected = :rejected', { rejected: false });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Application> {
    const app = await this.repo.findOne({ where: { id }, relations: ['currentStage'] });
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  async create(userId: string, dto: CreateApplicationDto): Promise<Application> {
    const app = this.repo.create({ ...dto, userId });
    return this.repo.save(app);
  }

  async update(id: string, dto: UpdateApplicationDto): Promise<Application> {
    const app = await this.findOne(id);
    Object.assign(app, dto);
    return this.repo.save(app);
  }

  async updateStage(id: string, stageId: string, memo?: string): Promise<Application> {
    const app = await this.findOne(id);
    app.currentStageId = stageId;
    app.isRejected = false;
    if (memo) app.memo = memo;
    return this.repo.save(app);
  }

  async reject(id: string, memo?: string): Promise<Application> {
    const app = await this.findOne(id);
    app.isRejected = true;
    if (memo) app.memo = memo;
    return this.repo.save(app);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Application not found');
  }

  async count(userId: string): Promise<number> {
    return this.repo.count({ where: { userId } });
  }

  async getPassRate(userId: string): Promise<number> {
    const total = await this.repo.count({ where: { userId } });
    if (total === 0) return 0;
    const passed = await this.repo
      .createQueryBuilder('app')
      .leftJoin('app.currentStage', 'stage')
      .where('app.userId = :userId', { userId })
      .andWhere('app.isRejected = false')
      .andWhere('stage.sort_order > 0')
      .getCount();
    return Math.round((passed / total) * 100);
  }
}
