import cron from 'node-cron';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { insightService } from '@/modules/insight/insight.service';

export function setupInsightJobs() {
  // Run daily at 02:00 AM server time (Assumed to be configured in KST system timezone)
  cron.schedule('0 2 * * *', async () => {
    logger.info('Starting nightly insight recalculation job for ACTIVE members...');

    try {
      const activeMembers = await prisma.member.findMany({
        where: {
          status: 'ACTIVE',
          deletedAt: null,
        },
        select: { id: true },
      });

      logger.info(`Found ${activeMembers.length} active members to process.`);

      let successCount = 0;
      let failureCount = 0;

      // Processing serially to avoid exhausting database connection bounds on high member counts
      for (const member of activeMembers) {
        try {
          await insightService.calculate(member.id);
          successCount++;
        } catch (err) {
          logger.error({ err, memberId: member.id }, 'Failed recalculating insight during batch process.');
          failureCount++;
        }
      }

      logger.info(`Nightly insight job completed. Success: ${successCount}, Failures: ${failureCount}`);
    } catch (err) {
      logger.error({ err }, 'Critical failure connecting to DB during batch execution.');
    }
  });

  logger.info('Cron job [Insight Recalculation] registered at 02:00 daily.');
}
