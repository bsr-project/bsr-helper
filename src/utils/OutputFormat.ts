import _ from 'lodash'

import Singleton from '@/base/Singleton'

import { OutputTextType, VehicleType } from '@/enums/InformationReturn'
import { OutputFormatType } from '@/enums/OutputFormat'

import { InformationReturnTypes } from '@/views/InformationReturn'

import { hasFlag } from '@/enums'

/**
 * 输出格式类封装
 */
export default class OutputFormat extends Singleton {
  /**
   * 出发
   * @param options
   * @returns
   */
  startOff(options: OutputFormatOptions) {
    return [
      '【信息回传】',
      // 时间
      options.time,
      // 人员
      options.personnelList.map((personnel) => personnel.name).join('、'),

      // 特定交通工具下 顺序变一下
      ...(hasFlag(options.vehicleType, VehicleType.Drive)
        ? [
            // 交通工具
            options.vehicle,
            // 人数
            `${options.personnelList.length}人`
          ]
        : [
            // 人数
            `${options.personnelList.length}人`,
            // 交通工具
            options.vehicle
          ]),

      // 携带工具
      options.professionalToolsList.length > 0
        ? `携带${options.professionalToolsList
            .map((item) => item.name)
            .join('、')}`
        : '',

      '从',

      // 出发地
      options.departure,

      '出发前往',

      // 目的地
      options.destination,

      '参加',

      options.mission
    ].join('')
  }

  /**
   * 回家
   * @param options
   * @returns
   */
  goBackHome(options: OutputFormatOptions) {
    return [
      '【信息回传】',
      // 时间
      options.time,
      // 人员
      options.personnelList.map((personnel) => personnel.name).join('、'),

      // 特定交通工具下 顺序变一下
      ...(hasFlag(options.vehicleType, VehicleType.Drive)
        ? [
            // 交通工具
            options.vehicle,
            // 人数
            `${options.personnelList.length}人`
          ]
        : [
            // 人数
            `${options.personnelList.length}人`,
            // 交通工具
            options.vehicle
          ]),

      // 携带工具
      options.professionalToolsList.length > 0
        ? `携带${options.professionalToolsList
            .map((item) => item.name)
            .join('、')}`
        : '',

      '完成',

      options.mission,

      '从',

      options.departure,

      '出发并安全到家'
    ].join('')
  }
}

interface OutputFormatOptions {
  time: string
  departure: string
  destination: string
  personnelList: InformationReturnTypes.PersonnelList[]
  vehicle: string
  vehicleType: VehicleType
  professionalToolsList: InformationReturnTypes.ProfessionalToolItem[]
  mission: string
}
