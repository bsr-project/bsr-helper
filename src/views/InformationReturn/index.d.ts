import { VehicleType } from '@/enums/InformationReturn'

export namespace InformationReturnTypes {
  export interface PersonnelList {
    /**
     * 姓名
     */
    name: string

    /**
     * 是否选中
     */
    checked: boolean

    /**
     * 是否是司机
     */
    driver: boolean

    /**
     * 是否可拖拽
     */
    draggable: boolean
  }

  /**
   * 地址
   */
  export interface Address {
    /**
     * 出发地
     */
    departure: string

    /**
     * 目的地
     */
    destination: string

    /**
     * 历史地址
     */
    history: string[]
  }

  /**
   * 交通工具 对象项目
   */
  export interface VehicleItem {
    type: VehicleType
    name: string
  }

  /**
   * 专业工具 对象项目
   */
  export interface ProfessionalToolItem {
    name: string
    selected: boolean
  }

  export interface StorageVehicle {
    current: VehicleType
    custom: string
    carNumber: string
  }

  export interface StorageTime {
    isCurrent: boolean
    start: string
    end: string
    lastCopy: string
  }

  export interface StorageProfessionalTool {
    list: InformationReturnTypes.ProfessionalToolItem[]
    custom: InformationReturnTypes.ProfessionalToolItem[]
  }
}
