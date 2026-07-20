import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { CHAT_API_BASE_URL } from '@/constants/chat';
import { showGlobalSnackbar } from '../components/GlobalSnackbar';

export interface ReqInt {
  url: string;
  method?: string;
  data?: any;
  params?: any;
  headers?: any;
}

export type ResInt<T = any> = T; // 具体的包装结构可以根据后端返回的格式在这里细化

const service = axios.create({
  baseURL: CHAT_API_BASE_URL,
  timeout: 30000, // 默认超时时间 30s
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers = config.headers || {};

    // 默认 header 配置
    config.headers.Accept = 'application/json';
    config.headers['Content-Type'] = 'application/json';

    // 1.保留这段代码，先注释起来，后续要
    // const token = window.sessionStorage.getItem('token')?.trim();
    // if (token) {
    //   config.headers.Authorization = token;
    // }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 配合下方的 http 函数，保留原始 response
    return response;
  },
  (error: AxiosError<any>) => {
    // 尝试提取后端返回的错误信息，如果提取不到，使用 axios 默认的 message
    const errorMessage =
      error.response?.data?.message || error.message || '网络请求失败';

    // 2.使用全局唯一的错误弹窗机制 Snackbar 提示用户
    showGlobalSnackbar(errorMessage, 'error');

    return Promise.reject(new Error(errorMessage));
  },
);

export function http<T>({
  url,
  method = 'post',
  data,
  params,
  headers,
}: ReqInt): Promise<ResInt<T>> {
  return new Promise((resolve) => {
    service({ url, method, data, params, headers })
      .then((res) => {
        resolve(res.data);
        return res.data;
      })
      .catch((err) => {
        resolve(err);
      });
  });
}

export default service;
