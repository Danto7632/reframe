import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../applications/application.entity';
import { ThoughtRecord } from '../thought-records/thought-record.entity';
import { ReframeCard } from '../reframe-cards/reframe-card.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Application)
    private readonly appRepo: Repository<Application>,
    @InjectRepository(ThoughtRecord)
    private readonly trRepo: Repository<ThoughtRecord>,
    @InjectRepository(ReframeCard)
    private readonly rcRepo: Repository<ReframeCard>,
  ) {}

  // ──────────────────────────────────────────
  //  대시보드 통계
  // ──────────────────────────────────────────
  async getDashboardStats(userId: string) {
    const totalApps = await this.appRepo.count({ where: { userId } });
    const offers = await this.appRepo.count({ where: { userId, status: 'offered' } });
    const rejected = await this.appRepo.count({ where: { userId, status: 'rejected' } });
    const active = await this.appRepo.count({ where: { userId, status: 'active' } });

    const totalRecords = await this.trRepo.count({ where: { userId } });
    const completedRecords = await this.trRepo.count({ where: { userId, isCompleted: true } });

    const totalCards = await this.rcRepo.count({ where: { userId } });
    const bookmarkedCards = await this.rcRepo.count({ where: { userId, isBookmarked: true } });

    // 주요 왜곡 타입 계산
    const records = await this.trRepo.find({ where: { userId } });
    const distortionCount: Record<string, number> = {};
    for (const r of records) {
      if (r.distortions) {
        for (const d of r.distortions) {
          distortionCount[d.type] = (distortionCount[d.type] || 0) + 1;
        }
      }
    }
    const topDistortion = Object.entries(distortionCount).sort((a, b) => b[1] - a[1])[0];

    // 번아웃 지수 (간단 계산: 최근 탈락 비율 기반)
    const recentApps = await this.appRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });
    const recentRejected = recentApps.filter((a) => a.status === 'rejected').length;
    const burnoutIndex = Math.min(100, Math.round((recentRejected / Math.max(recentApps.length, 1)) * 100));

    return {
      applications: {
        total: totalApps,
        active,
        offered: offers,
        rejected,
        passRate: totalApps > 0 ? Math.round((offers / totalApps) * 100) : 0,
      },
      thoughtRecords: {
        total: totalRecords,
        completed: completedRecords,
      },
      reframeCards: {
        total: totalCards,
        bookmarked: bookmarkedCards,
      },
      topDistortion: topDistortion ? { type: topDistortion[0], count: topDistortion[1] } : null,
      burnoutIndex,
    };
  }

  // ──────────────────────────────────────────
  //  지원 현황 통계 (채용 단계별, 도메인별 등)
  // ──────────────────────────────────────────
  async getApplicationStats(userId: string) {
    const apps = await this.appRepo.find({
      where: { userId },
      relations: ['currentStage'],
    });

    // 채용 단계별 분포
    const stageDist: Record<string, number> = {};
    for (const app of apps) {
      const label = app.currentStage?.label || '미지정';
      stageDist[label] = (stageDist[label] || 0) + 1;
    }

    // 월별 지원 추이
    const monthlyApps: Record<string, number> = {};
    for (const app of apps) {
      const key = new Date(app.appliedAt || app.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
      });
      monthlyApps[key] = (monthlyApps[key] || 0) + 1;
    }

    // 기업 규모별 (mock - 실제 데이터에는 companySize 필드 추가 필요)
    const statusDist = {
      active: apps.filter((a) => a.status === 'active').length,
      offered: apps.filter((a) => a.status === 'offered').length,
      rejected: apps.filter((a) => a.status === 'rejected').length,
    };

    return {
      stageDistribution: Object.entries(stageDist).map(([stage, count]) => ({ stage, count })),
      monthlyApplications: Object.entries(monthlyApps).map(([month, count]) => ({ month, count })),
      statusDistribution: statusDist,
      total: apps.length,
    };
  }

  // ──────────────────────────────────────────
  //  AI 인사이트 (Mock)
  // ──────────────────────────────────────────
  async getAiInsights(userId: string) {
    const stats = await this.getDashboardStats(userId);

    const insights: Array<{ type: string; title: string; content: string; icon: string }> = [];

    // 긍정적 인사이트
    if (stats.applications.total > 0) {
      insights.push({
        type: 'positive',
        title: '꾸준한 도전',
        content: `지금까지 총 ${stats.applications.total}건의 지원을 하셨어요. 꾸준히 도전하는 것 자체가 대단한 거예요! 💪`,
        icon: '🌟',
      });
    }

    if (stats.thoughtRecords.completed > 0) {
      insights.push({
        type: 'positive',
        title: '감정 관리 실천',
        content: `${stats.thoughtRecords.completed}건의 사고 기록을 완료하셨어요. 자신의 감정을 돌아보는 습관이 만들어지고 있어요.`,
        icon: '📝',
      });
    }

    // 주의 인사이트
    if (stats.burnoutIndex > 60) {
      insights.push({
        type: 'warning',
        title: '번아웃 주의',
        content: '최근 탈락 소식이 잦았어요. 잠시 쉬어가도 괜찮아요. 충분한 휴식이 다음 도전의 원동력이 됩니다.',
        icon: '⚠️',
      });
    }

    if (stats.topDistortion) {
      insights.push({
        type: 'suggestion',
        title: `"${stats.topDistortion.type}" 패턴 관찰`,
        content: `가장 자주 나타나는 사고 패턴이에요. 이 패턴을 인식하는 것만으로도 변화의 시작이에요. 리프레임 카드를 통해 연습해보세요.`,
        icon: '💡',
      });
    }

    // 기본 제안
    if (insights.length < 3) {
      insights.push({
        type: 'suggestion',
        title: '사고 기록 작성하기',
        content: '면접이나 탈락 후 느끼는 감정을 기록해보세요. 시간이 지나면 더 균형 잡힌 시각으로 볼 수 있게 될 거예요.',
        icon: '✍️',
      });
    }

    return insights;
  }

  // ──────────────────────────────────────────
  //  심층 리포트
  // ──────────────────────────────────────────
  async getReport(userId: string) {
    const dashboard = await this.getDashboardStats(userId);
    const appStats = await this.getApplicationStats(userId);
    const insights = await this.getAiInsights(userId);

    // 감정 변화 추이
    const records = await this.trRepo.find({
      where: { userId, isCompleted: true },
      order: { createdAt: 'ASC' },
    });

    const emotionTrends = records.map((r) => {
      const avgBefore =
        r.emotionsBefore.reduce((s, e) => s + e.intensity, 0) / (r.emotionsBefore.length || 1);
      const avgAfter = r.emotionsAfter
        ? r.emotionsAfter.reduce((s, e) => s + e.intensity, 0) / (r.emotionsAfter.length || 1)
        : null;
      return {
        date: new Date(r.createdAt).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }),
        avgBefore: Math.round(avgBefore * 10) / 10,
        avgAfter: avgAfter !== null ? Math.round(avgAfter * 10) / 10 : null,
      };
    });

    // 왜곡 분포
    const distortionCount: Record<string, number> = {};
    for (const r of records) {
      if (r.distortions) {
        for (const d of r.distortions) {
          distortionCount[d.type] = (distortionCount[d.type] || 0) + 1;
        }
      }
    }
    const totalDist = Object.values(distortionCount).reduce((s, v) => s + v, 0) || 1;
    const distortionDistribution = Object.entries(distortionCount).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / totalDist) * 100),
    }));

    return {
      dashboard,
      applicationStats: appStats,
      emotionTrends,
      distortionDistribution,
      insights,
      generatedAt: new Date().toISOString(),
    };
  }
}
