import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReframeCard } from './reframe-card.entity';
import { CreateReframeCardDto } from './reframe-cards.dto';

@Injectable()
export class ReframeCardsService {
  constructor(
    @InjectRepository(ReframeCard)
    private readonly repo: Repository<ReframeCard>,
  ) {}

  async findAll(userId: string, filters?: { bookmarked?: string }): Promise<ReframeCard[]> {
    const qb = this.repo
      .createQueryBuilder('rc')
      .leftJoinAndSelect('rc.thoughtRecord', 'tr')
      .where('rc.userId = :userId', { userId })
      .orderBy('rc.createdAt', 'DESC');

    if (filters?.bookmarked === 'true') {
      qb.andWhere('rc.isBookmarked = true');
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<ReframeCard> {
    const card = await this.repo.findOne({
      where: { id },
      relations: ['thoughtRecord'],
    });
    if (!card) throw new NotFoundException('Reframe card not found');
    return card;
  }

  async create(userId: string, dto: CreateReframeCardDto): Promise<ReframeCard> {
    const card = this.repo.create({
      ...dto,
      userId,
    });
    return this.repo.save(card);
  }

  async toggleBookmark(id: string): Promise<ReframeCard> {
    const card = await this.findOne(id);
    card.isBookmarked = !card.isBookmarked;
    return this.repo.save(card);
  }

  async incrementUseCount(id: string): Promise<ReframeCard> {
    const card = await this.findOne(id);
    card.useCount = (card.useCount || 0) + 1;
    return this.repo.save(card);
  }

  async updateEffectScore(id: string, score: number): Promise<ReframeCard> {
    const card = await this.findOne(id);
    card.effectScore = score;
    return this.repo.save(card);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Reframe card not found');
  }
}
