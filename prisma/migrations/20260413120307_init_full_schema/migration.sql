-- CreateTable
CREATE TABLE "Center" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Seoul',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CenterConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "centerId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "memo" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CenterConfig_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Holiday" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "centerId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "name" TEXT,
    "isAllDay" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Holiday_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Member" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "centerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "gender" TEXT,
    "birth" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Member_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HealthProfile" (
    "memberId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "injuries" TEXT,
    "surgeries" TEXT,
    "goal" TEXT,
    "caution" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HealthProfile_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Measurement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "memberId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "measuredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weight" REAL,
    "bodyFat" REAL,
    "muscleMass" REAL,
    "bmi" REAL,
    "visceralFat" INTEGER,
    "basalMetabolic" INTEGER,
    "bodyWater" REAL,
    "chest" REAL,
    "waist" REAL,
    "hip" REAL,
    "thigh" REAL,
    "arm" REAL,
    "customKey" TEXT,
    "customVal" REAL,
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Measurement_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "memberId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "targetValue" REAL,
    "targetUnit" TEXT,
    "targetDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "achievedAt" DATETIME,
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Goal_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MemberInsight" (
    "memberId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "attendanceScore" REAL NOT NULL DEFAULT 100.0,
    "sentimentScore" REAL NOT NULL DEFAULT 100.0,
    "progressScore" REAL NOT NULL DEFAULT 100.0,
    "retentionIndex" REAL NOT NULL DEFAULT 100.0,
    "churnRiskScore" REAL NOT NULL DEFAULT 0.0,
    "lastCalculated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MemberInsight_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "centerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "baseSalary" INTEGER NOT NULL DEFAULT 0,
    "isFreelancer" BOOLEAN NOT NULL DEFAULT true,
    "hireDate" DATETIME,
    "resignationDate" DATETIME,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Staff_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'PT',
    "price" INTEGER NOT NULL,
    "sessionCnt" INTEGER NOT NULL,
    "validDays" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "memberId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "staffId" INTEGER NOT NULL,
    "totalCnt" INTEGER NOT NULL,
    "remainingCnt" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "originalPrice" INTEGER NOT NULL DEFAULT 0,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "transferredFromId" INTEGER,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Subscription_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Subscription_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Subscription_transferredFromId_fkey" FOREIGN KEY ("transferredFromId") REFERENCES "Subscription" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "paidAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRefunded" BOOLEAN NOT NULL DEFAULT false,
    "refundAmount" INTEGER NOT NULL DEFAULT 0,
    "refundReason" TEXT,
    "refundedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_subId_fkey" FOREIGN KEY ("subId") REFERENCES "Subscription" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TransferLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fromMemberId" INTEGER NOT NULL,
    "toMemberId" INTEGER NOT NULL,
    "fromSubId" INTEGER NOT NULL,
    "toSubId" INTEGER NOT NULL,
    "transferFee" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT,
    "transferredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransferLog_fromMemberId_fkey" FOREIGN KEY ("fromMemberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransferLog_toMemberId_fkey" FOREIGN KEY ("toMemberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransferLog_fromSubId_fkey" FOREIGN KEY ("fromSubId") REFERENCES "Subscription" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransferLog_toSubId_fkey" FOREIGN KEY ("toSubId") REFERENCES "Subscription" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subId" INTEGER NOT NULL,
    "staffId" INTEGER NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Appointment_subId_fkey" FOREIGN KEY ("subId") REFERENCES "Subscription" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subId" INTEGER NOT NULL,
    "staffId" INTEGER NOT NULL,
    "apptId" INTEGER,
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commValue" INTEGER NOT NULL DEFAULT 0,
    "sessionNumber" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Attendance_subId_fkey" FOREIGN KEY ("subId") REFERENCES "Subscription" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Attendance_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Attendance_apptId_fkey" FOREIGN KEY ("apptId") REFERENCES "Appointment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "targetArea" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "WorkoutLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "memberId" INTEGER NOT NULL,
    "staffId" INTEGER NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "conditionScore" INTEGER NOT NULL DEFAULT 3,
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkoutLog_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkoutLog_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WorkoutLog_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkoutSet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "workoutLogId" INTEGER NOT NULL,
    "setNo" INTEGER NOT NULL,
    "weight" REAL,
    "reps" INTEGER,
    "rir" INTEGER,
    "seconds" INTEGER,
    "memo" TEXT,
    CONSTRAINT "WorkoutSet_workoutLogId_fkey" FOREIGN KEY ("workoutLogId") REFERENCES "WorkoutLog" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Interaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "memberId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sentimentScore" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Interaction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "memberId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "payload" TEXT,
    "scheduledAt" DATETIME,
    "sentAt" DATETIME,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Notification_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaxRule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "year" INTEGER NOT NULL,
    "nationalPension" REAL NOT NULL DEFAULT 0.045,
    "healthInsurance" REAL NOT NULL DEFAULT 0.03545,
    "longTermCareRate" REAL NOT NULL DEFAULT 0.1295,
    "employmentIns" REAL NOT NULL DEFAULT 0.009,
    "freelancerTax" REAL NOT NULL DEFAULT 0.033,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CommissionRule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "staffId" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PER_SESSION',
    "minSessions" INTEGER NOT NULL DEFAULT 0,
    "maxSessions" INTEGER NOT NULL DEFAULT 9999,
    "rate" REAL NOT NULL,
    "effectiveFrom" DATETIME,
    "effectiveTo" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CommissionRule_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payroll" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "staffId" INTEGER NOT NULL,
    "targetMonth" TEXT NOT NULL,
    "basePay" INTEGER NOT NULL DEFAULT 0,
    "sessionPay" INTEGER NOT NULL DEFAULT 0,
    "salesIncentive" INTEGER NOT NULL DEFAULT 0,
    "totalGrossPay" INTEGER NOT NULL,
    "nationalPension" INTEGER NOT NULL DEFAULT 0,
    "healthInsurance" INTEGER NOT NULL DEFAULT 0,
    "longTermCare" INTEGER NOT NULL DEFAULT 0,
    "employmentIns" INTEGER NOT NULL DEFAULT 0,
    "incomeTax" INTEGER NOT NULL DEFAULT 0,
    "localIncomeTax" INTEGER NOT NULL DEFAULT 0,
    "totalDeduction" INTEGER NOT NULL DEFAULT 0,
    "finalNetPay" INTEGER NOT NULL,
    "severanceAccrual" INTEGER NOT NULL DEFAULT 0,
    "isSettled" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payroll_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SeveranceLedger" (
    "staffId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "totalAccumulated" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SeveranceLedger_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyStats" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "centerId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "revenue" INTEGER NOT NULL DEFAULT 0,
    "refunds" INTEGER NOT NULL DEFAULT 0,
    "netRevenue" INTEGER NOT NULL DEFAULT 0,
    "totalVisits" INTEGER NOT NULL DEFAULT 0,
    "newMembers" INTEGER NOT NULL DEFAULT 0,
    "netProfit" INTEGER NOT NULL DEFAULT 0,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CenterConfig_centerId_key_key" ON "CenterConfig"("centerId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Holiday_centerId_date_key" ON "Holiday"("centerId", "date");

-- CreateIndex
CREATE INDEX "Member_centerId_status_idx" ON "Member"("centerId", "status");

-- CreateIndex
CREATE INDEX "Member_deletedAt_idx" ON "Member"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Member_centerId_phone_key" ON "Member"("centerId", "phone");

-- CreateIndex
CREATE INDEX "Measurement_memberId_measuredAt_idx" ON "Measurement"("memberId", "measuredAt");

-- CreateIndex
CREATE INDEX "Goal_memberId_status_idx" ON "Goal"("memberId", "status");

-- CreateIndex
CREATE INDEX "Staff_centerId_role_idx" ON "Staff"("centerId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_centerId_email_key" ON "Staff"("centerId", "email");

-- CreateIndex
CREATE INDEX "Subscription_memberId_status_deletedAt_idx" ON "Subscription"("memberId", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "Subscription_staffId_startDate_idx" ON "Subscription"("staffId", "startDate");

-- CreateIndex
CREATE INDEX "Subscription_endDate_status_idx" ON "Subscription"("endDate", "status");

-- CreateIndex
CREATE INDEX "Subscription_deletedAt_idx" ON "Subscription"("deletedAt");

-- CreateIndex
CREATE INDEX "Payment_subId_paidAt_idx" ON "Payment"("subId", "paidAt");

-- CreateIndex
CREATE INDEX "Appointment_staffId_startTime_idx" ON "Appointment"("staffId", "startTime");

-- CreateIndex
CREATE INDEX "Appointment_subId_status_idx" ON "Appointment"("subId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_apptId_key" ON "Attendance"("apptId");

-- CreateIndex
CREATE INDEX "Attendance_subId_checkedAt_idx" ON "Attendance"("subId", "checkedAt");

-- CreateIndex
CREATE INDEX "Attendance_staffId_checkedAt_idx" ON "Attendance"("staffId", "checkedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_name_key" ON "Exercise"("name");

-- CreateIndex
CREATE INDEX "WorkoutLog_memberId_createdAt_idx" ON "WorkoutLog"("memberId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutSet_workoutLogId_setNo_key" ON "WorkoutSet"("workoutLogId", "setNo");

-- CreateIndex
CREATE INDEX "Interaction_memberId_createdAt_idx" ON "Interaction"("memberId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_memberId_status_idx" ON "Notification"("memberId", "status");

-- CreateIndex
CREATE INDEX "Notification_scheduledAt_status_idx" ON "Notification"("scheduledAt", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TaxRule_year_key" ON "TaxRule"("year");

-- CreateIndex
CREATE INDEX "CommissionRule_staffId_effectiveFrom_effectiveTo_idx" ON "CommissionRule"("staffId", "effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionRule_staffId_minSessions_maxSessions_key" ON "CommissionRule"("staffId", "minSessions", "maxSessions");

-- CreateIndex
CREATE UNIQUE INDEX "Payroll_staffId_targetMonth_key" ON "Payroll"("staffId", "targetMonth");

-- CreateIndex
CREATE UNIQUE INDEX "DailyStats_date_key" ON "DailyStats"("date");

-- CreateIndex
CREATE INDEX "DailyStats_centerId_date_idx" ON "DailyStats"("centerId", "date");
