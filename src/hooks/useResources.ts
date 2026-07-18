/**
 * EduSphere — hooks/useResources.ts
 * -----------------------------------------------------------------------
 * React Query wrappers around resourceService.
 * -----------------------------------------------------------------------
 */

import { useMutation, useQuery, useQueryClient, QueryClient } from '@tanstack/react-query';
import * as resourceService from '../services/resourceService';
import { UploadProgressEvent } from '../services/resourceService';
import { queryKeys } from '../lib/queryClient';
import { CreateReviewPayload, Resource, ResourceQueryParams, UploadResourcePayload } from '../types/resource';
import { PaginatedData } from '../types/api';

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

// Save/unsave should feel instant — the bookmark icon flipping color is
// the whole point of the interaction, so it can't wait on a network
// round-trip. Patches every cached list AND the single-resource query in
// place; onError below rolls this back if the request actually fails.
function applyOptimisticSaveState(queryClient: QueryClient, resourceId: string, isSaved: boolean) {
  const delta = isSaved ? 1 : -1;

  queryClient.setQueriesData<PaginatedData<Resource>>({ queryKey: ['resources'] }, (old) => {
    if (!old || !Array.isArray(old.items)) return old;
    return {
      ...old,
      items: old.items.map((item) =>
        item.id === resourceId ? { ...item, isSaved, savesCount: Math.max(0, item.savesCount + delta) } : item
      ),
    };
  });

  queryClient.setQueryData<Resource>(queryKeys.resource(resourceId), (old) =>
    old ? { ...old, isSaved, savesCount: Math.max(0, old.savesCount + delta) } : old
  );
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
    onMutate: async (resourceId) => {
      await queryClient.cancelQueries({ queryKey: ['resources'] });
      const previous = queryClient.getQueriesData({ queryKey: ['resources'] });
      applyOptimisticSaveState(queryClient, resourceId, true);
      return { previous };
    },
    onError: (_err, _resourceId, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      invalidateResourceLists(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.profileStats });
    },
  });
}

export function useUnsaveResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (resourceId: string) => resourceService.unsaveResource(resourceId),
    onMutate: async (resourceId) => {
      await queryClient.cancelQueries({ queryKey: ['resources'] });
      const previous = queryClient.getQueriesData({ queryKey: ['resources'] });
      applyOptimisticSaveState(queryClient, resourceId, false);
      return { previous };
    },
    onError: (_err, _resourceId, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
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
