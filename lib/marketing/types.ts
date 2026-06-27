// =============================================================================
// Marketing Hub — shared types and enums (Phase 8a)
// =============================================================================
// One module for every cross-cutting type so the rest of the hub can import
// from a single place. New fields land here first; new status values land
// in the migration alongside a const here, in that order.

// ── Status machine ────────────────────────────────────────────────────────
export const CONTENT_STATUSES = [
  'idea',
  'draft',
  'review',
  'approved',
  'scheduled',
  'published',
  'reported',
  'archived',
  'publish_failed',
] as const
export type ContentStatus = (typeof CONTENT_STATUSES)[number]

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  idea: 'Idea',
  draft: 'Draft',
  review: 'In review',
  approved: 'Approved',
  scheduled: 'Scheduled',
  published: 'Published',
  reported: 'Reported',
  archived: 'Archived',
  publish_failed: 'Publish failed',
}

// Allowed forward transitions. Backward moves go through `reopenContent`.
// "archived" is reachable from anywhere as the soft-cancel terminal.
// "publish_failed" is reachable from scheduled by the runner; admin can
// retry by moving it back to scheduled or approved.
export const CONTENT_TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  idea: ['draft', 'archived'],
  draft: ['review', 'approved', 'archived'],
  review: ['approved', 'draft', 'archived'],
  approved: ['scheduled', 'draft', 'archived'],
  scheduled: ['published', 'approved', 'publish_failed', 'archived'],
  published: ['reported', 'archived'],
  reported: ['archived'],
  archived: [],
  publish_failed: ['scheduled', 'approved', 'published', 'archived'],
}

// ── Content types ─────────────────────────────────────────────────────────
export const CONTENT_TYPES = [
  'post',
  'story',
  'reel',
  'short',
  'video',
  'thread',
  'channel_message',
  'status',
  'ad',
  'newsletter_issue',
  'blog_post',
] as const
export type ContentType = (typeof CONTENT_TYPES)[number]

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  post: 'Post',
  story: 'Story',
  reel: 'Reel',
  short: 'Short',
  video: 'Video',
  thread: 'Thread',
  channel_message: 'Channel message',
  status: 'WhatsApp Status',
  ad: 'Ad',
  newsletter_issue: 'Newsletter issue',
  blog_post: 'Blog post',
}

// ── Production format (Task Ops linkage) ───────────────────────────────────
// Coarser than content_type and tuned to *how the asset is produced*, because
// that is what a production brief keys off. A "post" can be a single graphic or
// a carousel; a video can be motion graphics, a talking head, or a hybrid of
// the two. This is the discriminator the brief template and specialist routing
// use when a piece of content is sent to WM Task Ops.
export const PRODUCTION_FORMATS = [
  'graphic',
  'carousel',
  'motion_graphics',
  'talking_head',
  'hybrid_video',
  'written',
] as const
export type ProductionFormat = (typeof PRODUCTION_FORMATS)[number]

export const PRODUCTION_FORMAT_LABELS: Record<ProductionFormat, string> = {
  graphic: 'Single graphic',
  carousel: 'Carousel',
  motion_graphics: 'Motion graphics video',
  talking_head: 'Talking head',
  hybrid_video: 'Talking head + motion graphics',
  written: 'Written / long-form',
}

// Default production format suggested for each content type when the operator
// opens the form. They can override — a "post" defaults to a graphic but is
// often a carousel.
export const PRODUCTION_FORMAT_BY_CONTENT_TYPE: Record<ContentType, ProductionFormat> = {
  post: 'graphic',
  story: 'graphic',
  reel: 'motion_graphics',
  short: 'motion_graphics',
  video: 'talking_head',
  thread: 'written',
  channel_message: 'written',
  status: 'graphic',
  ad: 'graphic',
  newsletter_issue: 'written',
  blog_post: 'written',
}

// Production inputs captured on the calendar. All optional — only the fields
// relevant to the chosen production_format are shown in the form. Stored as the
// jsonb `production_spec` column; the brief builder reads from here.
export interface ProductionSpec {
  // Any format
  referenceLinks?: string[]
  deliverableCount?: number
  // graphic
  dimensions?: string
  mustInclude?: string
  // carousel
  slideCount?: number
  slideOutline?: string
  // video (motion_graphics | talking_head | hybrid_video)
  aspectRatio?: string
  durationSeconds?: number
  sourceFootageUrls?: string[]
  needsVoiceover?: boolean
  scriptNeeded?: boolean
  // written
  wordTarget?: number
  cta?: string
  seoKeywords?: string
}

// Slim project shape from the Task Ops `GET /api/hermes/projects` picker feed.
export interface TaskOpsProject {
  projectId: string
  projectName: string
  clientId: string
  clientName: string
  status: string
}

// ── Posted via ────────────────────────────────────────────────────────────
export const POSTED_VIA_VALUES = ['manual', 'buffer', 'api'] as const
export type PostedVia = (typeof POSTED_VIA_VALUES)[number]

export const POSTED_VIA_LABELS: Record<PostedVia, string> = {
  manual: 'Manual',
  buffer: 'Buffer',
  api: 'API',
}

// ── Platforms ─────────────────────────────────────────────────────────────
export const PLATFORM_KINDS = [
  'linkedin',
  'instagram',
  'x',
  'threads',
  'tiktok',
  'youtube',
  'whatsapp_status',
  'whatsapp_channel',
  'email',
  'blog',
  'podcast',
] as const
export type PlatformKind = (typeof PLATFORM_KINDS)[number]

export const PLATFORM_LABELS: Record<PlatformKind, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  x: 'X',
  threads: 'Threads',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  whatsapp_status: 'WhatsApp Status',
  whatsapp_channel: 'WhatsApp Channel',
  email: 'Email',
  blog: 'Blog',
  podcast: 'Podcast',
}

// ── Platform health (manual flag in Phase 8a) ─────────────────────────────
export const PLATFORM_HEALTH_VALUES = ['healthy', 'needs_attention', 'dormant'] as const
export type PlatformHealth = (typeof PLATFORM_HEALTH_VALUES)[number]

export const PLATFORM_HEALTH_LABELS: Record<PlatformHealth, string> = {
  healthy: 'Healthy',
  needs_attention: 'Needs attention',
  dormant: 'Dormant',
}

// ── Platform posting mode ─────────────────────────────────────────────────
export const POSTING_MODES = ['remind_only', 'api_publish'] as const
export type PostingMode = (typeof POSTING_MODES)[number]

export const POSTING_MODE_LABELS: Record<PostingMode, string> = {
  remind_only: 'Remind only',
  api_publish: 'API publish',
}

// ── Domain object types ───────────────────────────────────────────────────

export interface MarketingBrand {
  id: string
  slug: string
  name: string
  shortName: string | null
  tagline: string | null
  primaryColor: string
  accentColor: string | null
  logoStoragePath: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface MarketingPlatform {
  id: string
  brandId: string
  platform: PlatformKind
  handle: string | null
  externalId: string | null
  monthlyPostTarget: number
  currentHealth: PlatformHealth
  postingMode: PostingMode
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface MarketingPillar {
  id: string
  slug: string
  name: string
  description: string | null
  colorHex: string
  targetSharePct: number | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface MarketingContent {
  id: string
  brandId: string
  platformId: string | null
  campaignId: string | null
  campaignLabel: string | null
  episodeId: string | null
  whatsappFlowId: string | null
  metaAdCampaignId: string | null
  audienceQuery: Record<string, unknown> | null
  contentType: ContentType
  status: ContentStatus
  postedVia: PostedVia
  title: string | null
  hook: string | null
  bodyMarkdown: string
  hashtags: string | null
  assetUrls: string[]
  notes: string | null
  scheduledAt: string | null
  publishedAt: string | null
  externalUrl: string | null
  externalPostId: string | null
  publishError: string | null
  ownerEmail: string | null
  createdByEmail: string | null
  approvedByEmail: string | null
  pillarIds: string[]
  // Task Ops linkage
  taskOpsProjectId: string | null
  productionFormat: ProductionFormat | null
  productionSpec: ProductionSpec
  taskOpsTaskId: string | null
  taskOpsTaskUrl: string | null
  taskSentAt: string | null
  createdAt: string
  updatedAt: string
}

// ── Campaign status ──────────────────────────────────────────────────────
export const CAMPAIGN_STATUSES = [
  'planning',
  'live',
  'paused',
  'completed',
  'cancelled',
] as const
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number]

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  planning: 'Planning',
  live: 'Live',
  paused: 'Paused',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

// Allowed forward transitions for the campaign workflow.
export const CAMPAIGN_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  planning: ['live', 'cancelled'],
  live: ['paused', 'completed', 'cancelled'],
  paused: ['live', 'completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

export interface MarketingCampaign {
  id: string
  brandId: string
  slug: string
  name: string
  goal: string | null
  audienceSummary: string | null
  primaryChannel: string | null
  secondaryChannels: string[]
  startDate: string | null
  endDate: string | null
  status: CampaignStatus
  utmCampaign: string | null
  budgetKes: number | null
  targetLeads: number | null
  targetRevenueKes: number | null
  kpis: Record<string, unknown>
  ownerEmail: string | null
  notes: string | null
  createdByEmail: string | null
  createdAt: string
  updatedAt: string
}

export interface CampaignPerformance7d {
  campaignId: string
  campaignSlug: string
  campaignName: string
  campaignStatus: CampaignStatus
  brandId: string
  utmCampaign: string | null
  events7d: number
  uniqueSessions7d: number
  uniqueEmails7d: number
  conversions7d: number
}

// ── Episode status ───────────────────────────────────────────────────────
export const EPISODE_STATUSES = [
  'idea',
  'recording',
  'editing',
  'scheduled',
  'published',
  'archived',
] as const
export type EpisodeStatus = (typeof EPISODE_STATUSES)[number]

export const EPISODE_STATUS_LABELS: Record<EpisodeStatus, string> = {
  idea: 'Idea',
  recording: 'Recording',
  editing: 'Editing',
  scheduled: 'Scheduled',
  published: 'Published',
  archived: 'Archived',
}

export const EPISODE_TRANSITIONS: Record<EpisodeStatus, EpisodeStatus[]> = {
  idea: ['recording', 'archived'],
  recording: ['editing', 'idea', 'archived'],
  editing: ['scheduled', 'recording', 'archived'],
  scheduled: ['published', 'editing', 'archived'],
  published: ['archived'],
  archived: [],
}

export const EDIT_STATUSES = ['none', 'in_edit', 'review', 'done'] as const
export type EditStatus = (typeof EDIT_STATUSES)[number]

export const EDIT_STATUS_LABELS: Record<EditStatus, string> = {
  none: 'Not started',
  in_edit: 'In edit',
  review: 'In review',
  done: 'Done',
}

export interface MarketingEpisode {
  id: string
  brandId: string
  number: number | null
  slug: string | null
  title: string
  hook: string | null
  guestName: string | null
  guestOrg: string | null
  summaryMarkdown: string
  recordDate: string | null
  publishDate: string | null
  editStatus: EditStatus
  status: EpisodeStatus
  youtubeUrl: string | null
  podcastUrl: string | null
  transcriptStoragePath: string | null
  coverStoragePath: string | null
  durationSeconds: number | null
  campaignId: string | null
  createdByEmail: string | null
  createdAt: string
  updatedAt: string
}

export interface EpisodeClip {
  id: string
  episodeId: string
  contentId: string
  hook: string | null
  startSeconds: number | null
  endSeconds: number | null
  aspectRatio: string | null
  storagePath: string | null
  createdAt: string
  updatedAt: string
}

export interface EpisodeBanner {
  episodeId: string
  brandId: string
  brandSlug: string
  brandShortName: string | null
  brandColor: string
  number: number | null
  title: string
  hook: string | null
  publishDate: string
  status: EpisodeStatus
  youtubeUrl: string | null
  podcastUrl: string | null
}

export interface EpisodeClipSummary {
  episodeId: string
  totalClips: number
  inProgress: number
  scheduled: number
  published: number
}

// ── CRM ──────────────────────────────────────────────────────────────────
export const LIFECYCLE_STAGES = [
  'subscriber',
  'lead',
  'prospect',
  'client',
  'alumni',
] as const
export type LifecycleStage = (typeof LIFECYCLE_STAGES)[number]

export const LIFECYCLE_STAGE_LABELS: Record<LifecycleStage, string> = {
  subscriber: 'Subscriber',
  lead: 'Lead',
  prospect: 'Prospect',
  client: 'Client',
  alumni: 'Alumni',
}

export const DEAL_STAGES = [
  'new',
  'qualified',
  'proposal',
  'negotiation',
  'won',
  'lost',
] as const
export type DealStage = (typeof DEAL_STAGES)[number]

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  new: 'New',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
}

export const DEAL_TRANSITIONS: Record<DealStage, DealStage[]> = {
  new: ['qualified', 'lost'],
  qualified: ['proposal', 'lost'],
  proposal: ['negotiation', 'lost'],
  negotiation: ['won', 'lost'],
  won: [],
  lost: ['new'],
}

export const OPEN_DEAL_STAGES: DealStage[] = ['new', 'qualified', 'proposal', 'negotiation']

export const ACTIVITY_KINDS = [
  'call',
  'email',
  'dm',
  'meeting',
  'podcast_invite',
  'guide_sent',
  'newsletter_sent',
  'note',
  'system',
] as const
export type ActivityKind = (typeof ACTIVITY_KINDS)[number]

export const ACTIVITY_KIND_LABELS: Record<ActivityKind, string> = {
  call: 'Call',
  email: 'Email',
  dm: 'DM',
  meeting: 'Meeting',
  podcast_invite: 'Podcast invite',
  guide_sent: 'Guide email',
  newsletter_sent: 'Newsletter',
  note: 'Note',
  system: 'System',
}

// Activities the operator can log manually from the UI. The other kinds
// (guide_sent, newsletter_sent, system) are written by the email send paths.
export const MANUAL_ACTIVITY_KINDS: ActivityKind[] = [
  'note',
  'call',
  'email',
  'dm',
  'meeting',
  'podcast_invite',
]

export interface MarketingContact {
  id: string
  fullName: string | null
  email: string | null
  phone: string | null
  company: string | null
  role: string | null
  linkedinUrl: string | null
  source: string | null
  sourceDetail: string | null
  lifecycleStage: LifecycleStage
  ownerEmail: string | null
  tags: string[]
  lastContactAt: string | null
  nextContactAt: string | null
  notes: string | null
  leadSubscriberId: string | null
  entitlementId: string | null
  accountId: string | null
  createdByEmail: string | null
  createdAt: string
  updatedAt: string
}

export interface MarketingDeal {
  id: string
  contactId: string
  campaignId: string | null
  brandId: string | null
  name: string
  valueKes: number | null
  stage: DealStage
  expectedCloseDate: string | null
  closedAt: string | null
  lostReason: string | null
  orderId: string | null
  ownerEmail: string | null
  notes: string | null
  createdByEmail: string | null
  createdAt: string
  updatedAt: string
}

export interface MarketingActivity {
  id: string
  contactId: string
  dealId: string | null
  kind: ActivityKind
  subject: string | null
  body: string | null
  occurredAt: string
  byEmail: string | null
  createdAt: string
}

export interface SubscriberToPromote {
  subscriberId: string
  email: string
  name: string | null
  source: string | null
  leadMagnet: string | null
  subscriberStatus: string
  currentStep: number
  newsletterSubscribed: boolean
  subscribedAt: string
  lastSentAt: string | null
}

export interface DealPipelineSummary {
  stage: DealStage
  dealCount: number
  totalValueKes: number
  overdueCount: number
}

export interface OverdueFollowup {
  contactId: string
  fullName: string | null
  email: string | null
  company: string | null
  lifecycleStage: LifecycleStage
  ownerEmail: string | null
  nextContactAt: string
  lastContactAt: string | null
}

// ── WhatsApp flows (Phase 8g) ────────────────────────────────────────────
export const WHATSAPP_FLOW_STATUSES = [
  'drafting',
  'active',
  'paused',
  'archived',
] as const
export type WhatsappFlowStatus = (typeof WHATSAPP_FLOW_STATUSES)[number]

export const WHATSAPP_FLOW_STATUS_LABELS: Record<WhatsappFlowStatus, string> = {
  drafting: 'Drafting',
  active: 'Active',
  paused: 'Paused',
  archived: 'Archived',
}

export const WHATSAPP_FLOW_TRANSITIONS: Record<WhatsappFlowStatus, WhatsappFlowStatus[]> = {
  drafting: ['active', 'archived'],
  active: ['paused', 'archived'],
  paused: ['active', 'archived'],
  archived: [],
}

export const WHATSAPP_TRIGGER_TYPES = [
  'keyword',
  'new_contact',
  'manual_broadcast',
  'webhook',
] as const
export type WhatsappTriggerType = (typeof WHATSAPP_TRIGGER_TYPES)[number]

export const WHATSAPP_TRIGGER_LABELS: Record<WhatsappTriggerType, string> = {
  keyword: 'Keyword match',
  new_contact: 'New contact',
  manual_broadcast: 'Manual broadcast',
  webhook: 'Webhook',
}

export interface WhatsappFlow {
  id: string
  brandId: string
  slug: string
  name: string
  description: string | null
  triggerKeywords: string[]
  triggerType: WhatsappTriggerType
  triggerConfig: Record<string, unknown>
  flowDefinition: Record<string, unknown>
  status: WhatsappFlowStatus
  lastTriggeredAt: string | null
  triggeredCount: number
  ownerEmail: string | null
  notes: string | null
  createdByEmail: string | null
  createdAt: string
  updatedAt: string
}

// ── Platform credentials (Phase 8f) ──────────────────────────────────────
export const CREDENTIAL_STATUSES = [
  'active',
  'expired',
  'revoked',
  'needs_reauth',
] as const
export type CredentialStatus = (typeof CREDENTIAL_STATUSES)[number]

export const CREDENTIAL_STATUS_LABELS: Record<CredentialStatus, string> = {
  active: 'Connected',
  expired: 'Token expired',
  revoked: 'Revoked',
  needs_reauth: 'Reconnect needed',
}

export interface PlatformCredential {
  id: string
  brandId: string
  platformId: string | null
  platform: PlatformKind
  accountHandle: string | null
  externalUserId: string | null
  // The encrypted_payload field is never sent to clients. Server-only.
  scopes: string[]
  expiresAt: string | null
  lastValidatedAt: string | null
  status: CredentialStatus
  createdByEmail: string | null
  createdAt: string
  updatedAt: string
}

// ── Metrics & reports ────────────────────────────────────────────────────
export const METRIC_SOURCES = [
  'manual',
  'linkedin_api',
  'meta_api',
  'youtube_api',
  'tiktok_api',
  'webhook',
] as const
export type MetricSource = (typeof METRIC_SOURCES)[number]

export const METRIC_SOURCE_LABELS: Record<MetricSource, string> = {
  manual: 'Manual',
  linkedin_api: 'LinkedIn API',
  meta_api: 'Meta API',
  youtube_api: 'YouTube API',
  tiktok_api: 'TikTok API',
  webhook: 'Webhook',
}

export interface PostMetric {
  id: string
  contentId: string
  capturedAt: string
  source: MetricSource
  impressions: number
  reach: number
  engagements: number
  likes: number
  comments: number
  shares: number
  saves: number
  linkClicks: number
  profileVisits: number
  inquiries: number
  followerDelta: number
  enteredByEmail: string | null
  createdAt: string
  updatedAt: string
}

export const REPORT_STATUSES = [
  'drafting',
  'approved',
  'sending',
  'sent',
  'cancelled',
] as const
export type ReportStatus = (typeof REPORT_STATUSES)[number]

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  drafting: 'Drafting',
  approved: 'Approved',
  sending: 'Sending',
  sent: 'Sent',
  cancelled: 'Cancelled',
}

export interface ExecutiveReport {
  id: string
  periodStart: string
  periodEnd: string
  subject: string
  preheader: string | null
  bodyMarkdown: string
  aiNarrative: string | null
  metricsJson: Record<string, unknown>
  status: ReportStatus
  scheduledFor: string | null
  sentAt: string | null
  sentCount: number
  failedCount: number
  recipients: string[]
  createdByEmail: string | null
  approvedByEmail: string | null
  createdAt: string
  updatedAt: string
}

export interface RollupRow {
  brandId: string
  platformId: string | null
  platform: PlatformKind | null
  campaignId: string | null
  pillarId: string | null
  postsShipped: number
  totalImpressions: number
  totalEngagements: number
  totalReach: number
  totalLinkClicks: number
  totalInquiries: number
}

export interface CampaignRollupRow {
  campaignId: string
  campaignName: string
  brandId: string
  campaignStatus: string
  utmCampaign: string | null
  startDate: string | null
  endDate: string | null
  postsTotal: number
  postsShipped: number
  postsScheduled: number
  totalImpressions: number
  totalEngagements: number
  totalLinkClicks: number
  totalInquiries: number
}

export interface BrandWeeklyRollup {
  brandId: string
  brandSlug: string
  brandName: string
  postsShipped7d: number
  postsScheduledNext7d: number
  totalImpressions7d: number
  totalEngagements7d: number
  totalInquiries7d: number
}

// ── Compliance widget ────────────────────────────────────────────────────
export interface ComplianceRow {
  brandId: string
  platformId: string
  platform: PlatformKind
  handle: string | null
  weeklyTarget: number
  shippedThisWeek: number
  scheduledThisWeek: number
}

// ── Calendar views ──────────────────────────────────────────────────────
export const CALENDAR_VIEWS = ['week', 'month', 'year'] as const
export type CalendarView = (typeof CALENDAR_VIEWS)[number]

export const CALENDAR_VIEW_LABELS: Record<CalendarView, string> = {
  week: 'Week',
  month: 'Month',
  year: 'Year',
}

// ── Calendar feed ─────────────────────────────────────────────────────────
// One row per content item that lands inside the calendar window.
export interface CalendarContentRow {
  id: string
  brandId: string
  brandSlug: string
  brandName: string
  brandColor: string
  platformId: string | null
  platform: PlatformKind | null
  platformHandle: string | null
  contentType: ContentType
  status: ContentStatus
  postedVia: PostedVia
  title: string | null
  hook: string | null
  scheduledAt: string
  publishedAt: string | null
  externalUrl: string | null
  primaryPillarId: string | null
  primaryPillarColor: string | null
}
