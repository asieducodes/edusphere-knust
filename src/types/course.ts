/**
 * EduSphere — types/course.ts
 * -----------------------------------------------------------------------
 * NOTE: this file wasn't in the requested type-file list, but
 * courseService.ts (which was requested) needs Department/Course shapes
 * to exist somewhere — adding a small dedicated file for them is cleaner
 * than bundling unrelated types into user.ts or group.ts.
 * -----------------------------------------------------------------------
 */

import { PaginationParams } from './api';

export interface Department {
  id: string;
  name: string;
  college?: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  departmentId: string;
}

/** Shared by GET /departments and GET /courses. */
export interface CourseQueryParams extends PaginationParams {
  search?: string;
  departmentId?: string;
}
