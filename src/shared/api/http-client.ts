import axios, {
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosInstance
} from 'axios';

export type HttpClient = AxiosInstance;

export interface CreateHttpClientOptions {
  adapter?: AxiosAdapter;
  baseURL: string;
  getAccessToken?: () => string | null;
}

export function createHttpClient({
  adapter,
  baseURL,
  getAccessToken
}: CreateHttpClientOptions): HttpClient {
  const client = axios.create({
    adapter,
    baseURL
  });

  client.interceptors.request.use((config) => {
    const accessToken = getAccessToken?.();

    if (accessToken) {
      const headers = AxiosHeaders.from(config.headers);
      headers.set('Authorization', `Bearer ${accessToken}`);
      config.headers = headers;
    }

    return config;
  });

  return client;
}
