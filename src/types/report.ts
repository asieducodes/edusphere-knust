/**
 * EduSphere — types/report.ts
 * -----------------------------------------------------------------------
 * Report shapes — matches ResourceDetailsScreen's "Report Resource"
 * button, and generalizes to reporting groups/users/posts/comments too.
 * -----------------------------------------------------------------------
 */

export type ReportTargetType = 'resource' | 'group' | 'user' | 'post' | 'comment';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details?: string;
  status: ReportStatus;
  createdAt: string;
}

export interface CreateReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details?: string;
}
