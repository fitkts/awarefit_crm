import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';

export class InsightService {
  async calculate(memberId: number) {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // --- 1. Attendance Score Calculation ---
      // Find the currently active subscription to derive frequency requirements
      const subscription = await prisma.subscription.findFirst({
        where: {
          memberId,
          status: 'ACTIVE',
          deletedAt: null,
        },
        include: { product: true },
        orderBy: { startDate: 'desc' },
      });

      let attendanceScore = 100; // Default optimal score
      
      if (subscription && subscription.product.validDays > 0 && subscription.totalCnt > 0) {
        // Calculate the theoretical expected sessions in a 30-day window
        const dailyExpected = subscription.totalCnt / subscription.product.validDays;
        const expected30Days = dailyExpected * 30;

        // Fetch actual attendances in the last 30 days
        const recentAttendances = await prisma.attendance.count({
          where: {
            subscription: { memberId },
            checkedAt: { gte: thirtyDaysAgo },
          },
        });

        if (expected30Days > 0) {
          const rawAttendanceScore = (recentAttendances / expected30Days) * 100;
          attendanceScore = Math.max(0, Math.min(100, rawAttendanceScore)); // Clamp 0-100
        }
      }

      // --- 2. Sentiment Score Calculation ---
      const recentInteractions = await prisma.interaction.findMany({
        where: {
          memberId,
          sentimentScore: { not: null },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      let sentimentScore = 100;
      if (recentInteractions.length > 0) {
        const sum = recentInteractions.reduce((acc, curr) => acc + (curr.sentimentScore || 0), 0);
        const avgSentiment = sum / recentInteractions.length;
        // Formula: scale [-2, +2] to [0, +100] -> (avg+2)/4 * 100
        const rawSentimentScore = ((avgSentiment + 2) / 4) * 100;
        sentimentScore = Math.max(0, Math.min(100, rawSentimentScore));
      }

      // --- 3. Progress Score Calculation ---
      const allGoals = await prisma.goal.findMany({
        where: { memberId },
      });

      let progressScore = 100;
      if (allGoals.length > 0) {
        const achievedGoals = allGoals.filter(g => g.status === 'ACHIEVED').length;
        progressScore = (achievedGoals / allGoals.length) * 100;
      }

      // --- 4. Final Aggregation ---
      const retentionIndex = (attendanceScore * 0.5) + (sentimentScore * 0.3) + (progressScore * 0.2);
      const churnRiskScore = 100 - retentionIndex;

      // Upsert into member insight isolation table
      const insight = await prisma.memberInsight.upsert({
        where: { memberId },
        create: {
          memberId,
          attendanceScore,
          sentimentScore,
          progressScore,
          retentionIndex,
          churnRiskScore,
        },
        update: {
          attendanceScore,
          sentimentScore,
          progressScore,
          retentionIndex,
          churnRiskScore,
          lastCalculated: now,
        },
      });

      return insight;
    } catch (err) {
      logger.error({ err, memberId }, 'Failed to calculate member insight.');
      throw err;
    }
  }
}

export const insightService = new InsightService();
