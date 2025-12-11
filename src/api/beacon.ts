import request from './request'

// 接口返回类型定义
export interface BeaconData {
  _id: string
  uiLibrary: string
  loginStrategy: number // 单位：秒
  i18n: boolean
  createAt: string // 格式：YYYY-MM-DD HH:mm:ss
  cpuModel: string
  osPlatform: string // 系统平台（win32/darwin/linux）
  nodeVersion?: string
  totalMem: string
  cpuArch: string
  version: string
  cbVersion: string
  projectName: string
  platforms: string[]
}

export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
  page: number
  limit: number
  total: number
}

export interface QueryParams {
  page?: number
  pageSize?: number
  os?: string
}

// 分页查询接口
export async function fetchBeaconData(
  params: QueryParams,
): Promise<ApiResponse<BeaconData[]>> {
  const response = await request.get<any, ApiResponse<BeaconData[]>>(
    '/getBeacon',
    {
      params,
    },
  )
  return response
}

export interface HourlyDataItem {
  hour: number
  count: number
}
export interface HourlyDateResp {
  total: number
  hourlyData: HourlyDataItem[]
}
export interface DailyDataItem {
  date: string
  count: number
  dayOfWeek: string
}
export interface DailyDateResp {
  total: number
  dailyData: DailyDataItem[]
}
export async function fetchBeaconHourlyData(): Promise<
  ApiResponse<HourlyDateResp>
> {
  const response = await request.get<any, ApiResponse<HourlyDateResp>>(
    '/getBeaconByHour',
  )
  return response
}
export async function fetchBeaconDailyData(): Promise<
  ApiResponse<DailyDateResp>
> {
  const response = await request.get<any, ApiResponse<DailyDateResp>>(
    '/getBeaconByDay',
  )
  return response
}
