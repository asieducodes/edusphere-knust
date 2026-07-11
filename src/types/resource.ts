import { Course } from './course';
import { User } from './user';

export type ResourceType = 'past_question' | 'notes' | 'slides' | 'other';

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  resource_type: ResourceType;
  course: Course;
  uploader: User;
  file_url: string;
  cloudinary_public_id: string;
  file_size_bytes: number;
  download_count: number;
  created_at: string;
}

export interface UploadResourcePayload {
  title: string;
  description?: string;
  resource_type: ResourceType;
  course_id: string;
  // file itself sent as multipart/form-data, not part of this JSON shape
}

export interface ResourceReportPayload {
  resource_id: string;
  reason: string;
}
