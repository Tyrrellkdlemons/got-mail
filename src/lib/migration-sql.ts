/**
 * Auto-generated DDL from `prisma migrate diff --from-empty --to-schema-datamodel`.
 * Embedded here so the /api/admin/seed route can bootstrap Neon at runtime
 * (Netlify build runners can't always reach Neon, so we migrate from Lambda).
 *
 * Idempotent: each statement is executed independently, and "already exists"
 * errors are caught and ignored. Safe to call multiple times.
 */
export const MIGRATION_SQL = `
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');
-- CreateEnum
CREATE TYPE "SendingMode" AS ENUM ('MY_EMAIL', 'OWNED_DOMAIN', 'FREE_DOMAIN', 'OPEN_SOURCE');
-- CreateEnum
CREATE TYPE "WarmupStatus" AS ENUM ('NONE', 'IN_PROGRESS', 'PAUSED', 'COMPLETED');
-- CreateEnum
CREATE TYPE "DomainStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED', 'NEEDS_RECHECK');
-- CreateEnum
CREATE TYPE "ConsentStatus" AS ENUM ('PENDING', 'VERIFIED', 'IMPORTED_WITH_PROOF', 'UNSUBSCRIBED', 'BOUNCED', 'COMPLAINED', 'SUPPRESSED');
-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'REVIEW', 'SCHEDULED', 'SENDING', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELED');
-- CreateEnum
CREATE TYPE "SendJobStatus" AS ENUM ('PENDING', 'RUNNING', 'PAUSED_QUOTA', 'PAUSED_CIRCUIT_BREAKER', 'PAUSED_DNS', 'PAUSED_MANUAL', 'COMPLETED', 'FAILED', 'CANCELED');

CREATE TABLE IF NOT EXISTS "User" ("id" TEXT NOT NULL, "email" TEXT NOT NULL, "name" TEXT, "passwordHash" TEXT, "role" "Role" NOT NULL DEFAULT 'MEMBER', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "User_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "Workspace" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "slug" TEXT NOT NULL, "legalName" TEXT, "postalAddress" TEXT, "replyTo" TEXT, "timezone" TEXT NOT NULL DEFAULT 'UTC', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "Membership" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "role" "Role" NOT NULL DEFAULT 'MEMBER', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Membership_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "SendingIdentity" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "mode" "SendingMode" NOT NULL, "name" TEXT NOT NULL, "fromName" TEXT NOT NULL, "fromEmail" TEXT NOT NULL, "replyTo" TEXT, "providerKind" TEXT, "domainId" TEXT, "smtpAccountId" TEXT, "providerAccountId" TEXT, "dailyLimit" INTEGER, "hourlyLimit" INTEGER, "warmupStatus" "WarmupStatus" NOT NULL DEFAULT 'NONE', "isDefault" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "SendingIdentity_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "SMTPAccount" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "label" TEXT NOT NULL, "host" TEXT NOT NULL, "port" INTEGER NOT NULL, "username" TEXT NOT NULL, "passwordEnc" TEXT NOT NULL, "useTls" BOOLEAN NOT NULL DEFAULT true, "fromEmail" TEXT NOT NULL, "fromName" TEXT NOT NULL, "dailyLimit" INTEGER, "hourlyLimit" INTEGER, "providerType" TEXT, "verifiedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "SMTPAccount_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "ProviderAccount" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "providerKind" TEXT NOT NULL, "label" TEXT NOT NULL, "apiKeyEnc" TEXT, "apiSecretEnc" TEXT, "baseUrl" TEXT, "webhookSecret" TEXT, "verifiedAt" TIMESTAMP(3), "dailyLimit" INTEGER, "monthlyLimit" INTEGER, "hourlyLimit" INTEGER, "dailySent" INTEGER NOT NULL DEFAULT 0, "monthlySent" INTEGER NOT NULL DEFAULT 0, "lastSentAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "ProviderAccount_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "Domain" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "domain" TEXT NOT NULL, "status" "DomainStatus" NOT NULL DEFAULT 'PENDING', "spfValid" BOOLEAN NOT NULL DEFAULT false, "dkimValid" BOOLEAN NOT NULL DEFAULT false, "dmarcValid" BOOLEAN NOT NULL DEFAULT false, "returnPathValid" BOOLEAN NOT NULL DEFAULT false, "trackingDomain" TEXT, "reputationScore" DOUBLE PRECISION, "freeSubdomain" BOOLEAN NOT NULL DEFAULT false, "freeSubdomainHost" TEXT, "lastCheckedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Domain_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "DomainVerification" ("id" TEXT NOT NULL, "domainId" TEXT NOT NULL, "recordType" TEXT NOT NULL, "name" TEXT NOT NULL, "value" TEXT NOT NULL, "status" TEXT NOT NULL, "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "DomainVerification_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "Contact" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "email" TEXT NOT NULL, "firstName" TEXT, "lastName" TEXT, "locale" TEXT, "timezone" TEXT, "consentStatus" "ConsentStatus" NOT NULL DEFAULT 'PENDING', "consentSource" TEXT, "consentAt" TIMESTAMP(3), "consentIp" TEXT, "consentUa" TEXT, "tagsJson" TEXT NOT NULL DEFAULT '[]', "importBatchId" TEXT, "lastActivityAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Contact_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "ConsentRecord" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "contactId" TEXT NOT NULL, "event" TEXT NOT NULL, "source" TEXT, "ip" TEXT, "userAgent" TEXT, "proofHash" TEXT, "prevHash" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "Segment" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT, "filterJson" TEXT NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Segment_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "SegmentMember" ("id" TEXT NOT NULL, "segmentId" TEXT NOT NULL, "contactId" TEXT NOT NULL, "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "SegmentMember_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "Suppression" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "email" TEXT NOT NULL, "reason" TEXT NOT NULL, "note" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Suppression_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "Unsubscribe" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "email" TEXT NOT NULL, "campaignId" TEXT, "source" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Unsubscribe_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "Bounce" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "email" TEXT NOT NULL, "kind" TEXT NOT NULL, "code" TEXT, "message" TEXT, "campaignId" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Bounce_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "Complaint" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "email" TEXT NOT NULL, "campaignId" TEXT, "source" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "EmailTemplate" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "name" TEXT NOT NULL, "subject" TEXT NOT NULL, "preheader" TEXT, "html" TEXT NOT NULL, "text" TEXT NOT NULL, "variablesJson" TEXT NOT NULL DEFAULT '[]', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "Campaign" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "name" TEXT NOT NULL, "subject" TEXT NOT NULL, "preheader" TEXT, "html" TEXT NOT NULL, "text" TEXT NOT NULL, "templateId" TEXT, "segmentId" TEXT, "sendingIdentityId" TEXT, "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT', "scheduledAt" TIMESTAMP(3), "sentAt" TIMESTAMP(3), "approvedBy" TEXT, "approvedAt" TIMESTAMP(3), "complianceJson" TEXT NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "CampaignRecipient" ("id" TEXT NOT NULL, "campaignId" TEXT NOT NULL, "contactId" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'PENDING', "reason" TEXT, "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "CampaignRecipient_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "SendJob" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "campaignId" TEXT NOT NULL, "sendingIdentityId" TEXT, "providerAccountId" TEXT, "status" "SendJobStatus" NOT NULL DEFAULT 'PENDING', "pauseReason" TEXT, "totalRecipients" INTEGER NOT NULL DEFAULT 0, "sent" INTEGER NOT NULL DEFAULT 0, "failed" INTEGER NOT NULL DEFAULT 0, "bounced" INTEGER NOT NULL DEFAULT 0, "unsubscribed" INTEGER NOT NULL DEFAULT 0, "complained" INTEGER NOT NULL DEFAULT 0, "startedAt" TIMESTAMP(3), "completedAt" TIMESTAMP(3), "pausedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "SendJob_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "SendingBatch" ("id" TEXT NOT NULL, "sendJobId" TEXT NOT NULL, "size" INTEGER NOT NULL, "sendAfter" TIMESTAMP(3) NOT NULL, "startedAt" TIMESTAMP(3), "finishedAt" TIMESTAMP(3), "sent" INTEGER NOT NULL DEFAULT 0, "failed" INTEGER NOT NULL DEFAULT 0, "recipientIdsJson" TEXT NOT NULL, CONSTRAINT "SendingBatch_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "EmailSend" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "campaignId" TEXT, "contactId" TEXT, "messageId" TEXT, "subject" TEXT NOT NULL, "toEmail" TEXT NOT NULL, "fromEmail" TEXT NOT NULL, "status" TEXT NOT NULL, "providerKind" TEXT, "errorCode" TEXT, "errorMessage" TEXT, "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "EmailSend_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "EmailEvent" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "emailSendId" TEXT, "type" TEXT NOT NULL, "payloadJson" TEXT, "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "EmailEvent_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "WarmupSchedule" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "sendingIdentityId" TEXT NOT NULL, "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "day" INTEGER NOT NULL DEFAULT 1, "dailyCap" INTEGER NOT NULL, "status" "WarmupStatus" NOT NULL DEFAULT 'IN_PROGRESS', "completedAt" TIMESTAMP(3), CONSTRAINT "WarmupSchedule_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "DeliverabilityHealth" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "domain" TEXT, "providerKind" TEXT, "measuredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "bounceRate" DOUBLE PRECISION, "complaintRate" DOUBLE PRECISION, "openRate" DOUBLE PRECISION, "clickRate" DOUBLE PRECISION, "unsubRate" DOUBLE PRECISION, "inboxPct" DOUBLE PRECISION, "rblListed" BOOLEAN NOT NULL DEFAULT false, CONSTRAINT "DeliverabilityHealth_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "SourceResearchItem" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "category" TEXT NOT NULL, "description" TEXT, "officialUrl" TEXT, "freeLimit" TEXT, "dailyLimit" INTEGER, "monthlyLimit" INTEGER, "supportsSmtp" BOOLEAN NOT NULL DEFAULT false, "supportsApi" BOOLEAN NOT NULL DEFAULT false, "supportsMarketing" BOOLEAN NOT NULL DEFAULT false, "supportsTransactional" BOOLEAN NOT NULL DEFAULT false, "supportsWebhooks" BOOLEAN NOT NULL DEFAULT false, "supportsBulk" BOOLEAN NOT NULL DEFAULT false, "selfHosted" BOOLEAN NOT NULL DEFAULT false, "license" TEXT, "status" TEXT NOT NULL DEFAULT 'verified', "riskLevel" TEXT, "notes" TEXT, "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "SourceResearchItem_pkey" PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "AuditLog" ("id" TEXT NOT NULL, "workspaceId" TEXT, "userId" TEXT, "action" TEXT NOT NULL, "targetType" TEXT, "targetId" TEXT, "metaJson" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id"));

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Workspace_slug_key" ON "Workspace"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Membership_userId_workspaceId_key" ON "Membership"("userId", "workspaceId");
CREATE UNIQUE INDEX IF NOT EXISTS "Domain_workspaceId_domain_key" ON "Domain"("workspaceId", "domain");
CREATE INDEX IF NOT EXISTS "Contact_workspaceId_consentStatus_idx" ON "Contact"("workspaceId", "consentStatus");
CREATE UNIQUE INDEX IF NOT EXISTS "Contact_workspaceId_email_key" ON "Contact"("workspaceId", "email");
CREATE UNIQUE INDEX IF NOT EXISTS "SegmentMember_segmentId_contactId_key" ON "SegmentMember"("segmentId", "contactId");
CREATE UNIQUE INDEX IF NOT EXISTS "Suppression_workspaceId_email_key" ON "Suppression"("workspaceId", "email");
CREATE UNIQUE INDEX IF NOT EXISTS "CampaignRecipient_campaignId_contactId_key" ON "CampaignRecipient"("campaignId", "contactId");
CREATE INDEX IF NOT EXISTS "SendingBatch_sendAfter_idx" ON "SendingBatch"("sendAfter");
CREATE INDEX IF NOT EXISTS "EmailEvent_workspaceId_type_idx" ON "EmailEvent"("workspaceId", "type");
CREATE UNIQUE INDEX IF NOT EXISTS "SourceResearchItem_name_key" ON "SourceResearchItem"("name");
CREATE INDEX IF NOT EXISTS "AuditLog_workspaceId_createdAt_idx" ON "AuditLog"("workspaceId", "createdAt");

ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SendingIdentity" ADD CONSTRAINT "SendingIdentity_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SendingIdentity" ADD CONSTRAINT "SendingIdentity_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SendingIdentity" ADD CONSTRAINT "SendingIdentity_smtpAccountId_fkey" FOREIGN KEY ("smtpAccountId") REFERENCES "SMTPAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SendingIdentity" ADD CONSTRAINT "SendingIdentity_providerAccountId_fkey" FOREIGN KEY ("providerAccountId") REFERENCES "ProviderAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SMTPAccount" ADD CONSTRAINT "SMTPAccount_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProviderAccount" ADD CONSTRAINT "ProviderAccount_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DomainVerification" ADD CONSTRAINT "DomainVerification_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Segment" ADD CONSTRAINT "Segment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SegmentMember" ADD CONSTRAINT "SegmentMember_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "Segment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SegmentMember" ADD CONSTRAINT "SegmentMember_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Suppression" ADD CONSTRAINT "Suppression_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Unsubscribe" ADD CONSTRAINT "Unsubscribe_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Bounce" ADD CONSTRAINT "Bounce_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "Segment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_sendingIdentityId_fkey" FOREIGN KEY ("sendingIdentityId") REFERENCES "SendingIdentity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CampaignRecipient" ADD CONSTRAINT "CampaignRecipient_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CampaignRecipient" ADD CONSTRAINT "CampaignRecipient_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SendJob" ADD CONSTRAINT "SendJob_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SendJob" ADD CONSTRAINT "SendJob_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SendJob" ADD CONSTRAINT "SendJob_sendingIdentityId_fkey" FOREIGN KEY ("sendingIdentityId") REFERENCES "SendingIdentity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SendJob" ADD CONSTRAINT "SendJob_providerAccountId_fkey" FOREIGN KEY ("providerAccountId") REFERENCES "ProviderAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SendingBatch" ADD CONSTRAINT "SendingBatch_sendJobId_fkey" FOREIGN KEY ("sendJobId") REFERENCES "SendJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailSend" ADD CONSTRAINT "EmailSend_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailSend" ADD CONSTRAINT "EmailSend_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailSend" ADD CONSTRAINT "EmailSend_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailEvent" ADD CONSTRAINT "EmailEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailEvent" ADD CONSTRAINT "EmailEvent_emailSendId_fkey" FOREIGN KEY ("emailSendId") REFERENCES "EmailSend"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WarmupSchedule" ADD CONSTRAINT "WarmupSchedule_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WarmupSchedule" ADD CONSTRAINT "WarmupSchedule_sendingIdentityId_fkey" FOREIGN KEY ("sendingIdentityId") REFERENCES "SendingIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeliverabilityHealth" ADD CONSTRAINT "DeliverabilityHealth_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
`;
