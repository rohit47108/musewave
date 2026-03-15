import type {
  ExportDuration,
  ExportJob,
  SceneSpec,
  ShareSceneRequest,
  ShareSceneResponse
} from "@/lib/scene/types";
import { apiBaseUrl } from "@/lib/utils";

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const saveScene = (payload: ShareSceneRequest) =>
  request<ShareSceneResponse>("/v1/scenes", {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const fetchScene = (slug: string) =>
  request<ShareSceneResponse>(`/v1/scenes/${slug}`);

export const createExport = (slug: string, durationSeconds: ExportDuration, scene?: SceneSpec) =>
  request<ExportJob>(`/v1/scenes/${slug}/exports`, {
    method: "POST",
    body: JSON.stringify({
      durationSeconds,
      scene
    })
  });

export const getExportJob = (jobId: string) =>
  request<ExportJob>(`/v1/exports/${jobId}`);
