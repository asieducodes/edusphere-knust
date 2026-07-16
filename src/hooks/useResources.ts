/**
 * EduSphere — hooks/useResources.ts
 * -----------------------------------------------------------------------
 * React Query wrappers around resourceService.
 * -----------------------------------------------------------------------
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as resourceService from '../services/resourceService';
import { UploadProgressEvent } from '../services/resourceService';
import { queryKeys } from '../lib/queryClient';
import { CreateReviewPayload, ResourceQueryParams, UploadResourcePayload } from '../types/resource';

export function useResources(params: ResourceQueryParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.resources(params),
    queryFn: () => resourceService.getResources(params).then((r) => r.data),
    enabled,
  });
}

export function useResource(resourceId: string) {
  return useQuery({
    queryKey: queryKeys.resource(resourceId),
    queryFn: () => resourceService.getResourceById(resourceId).then((r) => r.data),
    enabled: !!resourceId,
  });
}

export function useResourceReviews(resourceId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.resourceReviews(resourceId),
    queryFn: () => resourceService.getResourceReviews(resourceId).then((r) => r.data),
    enabled: enabled && !!resourceId,
  });
}

// ---- Mutations ----------------------------------------------------------

// Every list-shaped resources query (search, category, mine, saved, ...)
// gets invalidated on any resource mutation — the alternative is threading
// exact param combinations through every call site, which is far more
// likely to silently miss a stale variant than a small handful of broad
// `['resources']`-prefixed invalidations here.
function invalidateResourceLists(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['resources'] });
}

export function useUploadResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      payload,
      onUploadProgress,
    }: {
      payload: UploadResourcePayload;
      onUploadProgress?: (event: UploadProgressEvent) => void;
    }) => resourceService.uploadResource(payload, { onUploadProgress }).then((r) => r.data),
    onSuccess: () => {
      invalidateResourceLists(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.profileStats });
    },
  });
}

export function useSaveResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (resourceId: string) => resourceService.saveResource(resourceId),
    onSuccess: () => {
      invalidateResourceLists(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.profileStats });
    },
  });
}

export function useUnsaveResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (resourceId: string) => resourceService.unsaveResource(resourceId),
    onSuccess: () => {
      invalidateResourceLists(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.profileStats });
    },
  });
}

export function useDownloadResource() {
  return useMutation({
    mutationFn: (resourceId: string) => resourceService.downloadResource(resourceId).then((r) => r.data),
  });
}

export function useCreateResourceReview(resourceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewPayload) =>
      resourceService.createResourceReview(resourceId, payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resourceReviews(resourceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.resource(resourceId) });
    },
  });
}
