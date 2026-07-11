export type ReportTargetType = 'resource' | 'discussion_post' | 'user';

export interface Report {
  id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  created_at: string;
}

export interface CreateReportPayload {
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
}
