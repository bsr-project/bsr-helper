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
   * 车牌列表项
   */
  export interface CarNumberItem {
    /**
     * 车主
     */
    owner: string

    /**
     * 车牌号
     */
    carNumber: string
  }

  export interface StorageVehicle {
    /**
     * 当前交通工具
     */
    current?: VehicleType

    /**
     * 自定义交通工具
     */
    custom?: string

    /**
     * 当前车牌
     */
    currentCarNumber?: string

    /**
     * 车牌号列表
     */
    carNumberList?: CarNumberItem[]
  }

  /**
   * 专业工具 对象项目
   */
  export interface ProfessionalToolItem {
    name: string
    selected: boolean
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
