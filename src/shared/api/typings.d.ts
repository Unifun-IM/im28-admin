declare namespace API {
  type BaseResponse = {
    code: number;
    message?: string;
    msg?: string;
  };

  type getApiWorkplacePopularContentsParams = {
    page?: number;
    pageSize?: number;
    category?: string;
  };

  type LoginRequest = {
    userName: string;
    password: string;
  };

  type LoginResult = {
    status?: "ok" | "error";
    msg?: string;
    access_token?: string;
  };

  type MessageItem = {
    id?: string;
    title?: string;
    subTitle?: string;
    avatar?: string;
    content?: string;
    time?: string;
    status?: number;
    type?: string;
  };

  type MessageReadRequest = {
    ids: string[];
  };

  type UserInfo = {
    name?: string;
    avatar?: string;
    email?: string;
    job?: string;
    jobName?: string;
    organization?: string;
    organizationName?: string;
    location?: string;
    locationName?: string;
    introduction?: string;
    personalWebsite?: string;
    verified?: boolean;
    phoneNumber?: string;
    accountId?: string;
    registrationTime?: string;
    permissions: Record<string, any>;
  };

  type WorkplaceAnnouncement = {
    key?: string;
    type?: string;
    content?: string;
  };

  type WorkplaceContentPercentage = {
    type?: string;
    count?: number;
    percent?: number;
  };

  type WorkplaceOverview = {
    allContents?: string;
    liveContents?: string;
    increaseComments?: string;
    growthRate?: string;
    down?: boolean;
    chartData?: { count?: number; date?: string }[];
  };

  type WorkplacePopularContent = {
    key?: string;
    rank?: number;
    title?: string;
    pv?: number;
    increase?: number;
    clickNumber?: string;
    increaseNumber?: string;
  };

  type WorkplacePopularContentsResult = {
    list?: WorkplacePopularContent[];
    total?: number;
  };
}
