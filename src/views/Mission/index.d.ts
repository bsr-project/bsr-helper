import { VEHICLE } from '@/enums/JoinMission'

export interface JoinMissionPickerData {
  /**
   * 任务 ID
   */
  mission_id: number

  /**
   * 子任务 ID
   */
  checked: number[]

  /**
   * 日期时间
   */
  datetime: string

  /**
   * 交通工具
   */
  vehicle: VEHICLE

  /**
   * 自定义交通工具
   */
  custom_vehicle?: string
}
