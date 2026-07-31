// @ts-ignore
/* eslint-disable */
import request from "@shared/api/request";

/** 存活检查 GET /healthz */
export async function getHealthz(options?: { [key: string]: any }) {
  return request<AdminAPI.HealthResponse>("/healthz", {
    method: "GET",
    ...(options || {}),
  });
}

/** 就绪检查 GET /readyz */
export async function getReadyz(options?: { [key: string]: any }) {
  return request<AdminAPI.ReadyResponse>("/readyz", {
    method: "GET",
    ...(options || {}),
  });
}
