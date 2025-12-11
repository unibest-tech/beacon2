import axios from 'axios'
import type {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios'
import { message } from 'ant-design-vue'

// 创建axios实例
// 接口基础URL（从vite代理迁移至此）
const API_BASE_URL = 'https://ukw0y1.laf.run/create-unibest-v3'

const request: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config
  },
  error => {
    return Promise.reject(error)
  },
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response
    console.log(data)
    if (data.code !== 200) {
      message.error(data.msg || '请求失败')
      return Promise.reject(new Error(data.msg || '请求失败'))
    }
    return data.data
  },
  error => {
    message.error(error.message || '请求失败')
    return Promise.reject(error)
  },
)

export default request
