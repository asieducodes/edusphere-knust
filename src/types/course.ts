/**
 * EduSphere — types/course.ts
 * -----------------------------------------------------------------------
 * Department/Course shapes for courseService.ts — split out here instead
 * of getting bundled into user.ts or group.ts, where they don't belong.
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
