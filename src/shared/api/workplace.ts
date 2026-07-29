// @ts-ignore
/* eslint-disable */
import request from "@shared/api/request";

/** 公告列表 GET /api/workplace/announcement */
export async function getApiWorkplaceAnnouncement(options?: {
  [key: string]: any;
}) {
  return request<API.WorkplaceAnnouncement[]>("/api/workplace/announcement", {
    method: "GET",
    ...(options || {}),
  });
}

/** 内容占比 GET /api/workplace/content-percentage */
export async function getApiWorkplaceContentPercentage(options?: {
  [key: string]: any;
}) {
  return request<API.WorkplaceContentPercentage[]>(
    "/api/workplace/content-percentage",
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

/** 工作台概览 GET /api/workplace/overview-content */
export async function getApiWorkplaceOverviewContent(options?: {
  [key: string]: any;
}) {
  return request<API.WorkplaceOverview>("/api/workplace/overview-content", {
    method: "GET",
    ...(options || {}),
  });
}

/** 热门内容列表 GET /api/workplace/popular-contents */
export async function getApiWorkplacePopularContents(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getApiWorkplacePopularContentsParams,
  options?: { [key: string]: any }
) {
  return request<API.WorkplacePopularContentsResult>(
    "/api/workplace/popular-contents",
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}
