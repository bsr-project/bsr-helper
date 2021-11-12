import _ from 'lodash'

import Singleton from '@/base/Singleton'

import { OutputTextType, VehicleType } from '@/enums/InformationReturn'
import { OutputFormatType } from '@/enums/OutputFormat'

import { hasFlag } from '@/enums'

/**
 * 输出格式类封装
 */
export default class OutputFormat extends Singleton {
  startOff(options: OutputFormatOptions.StartOffOptions) {
    return [
      '【信息回传】',

      // 人员
      `{${OutputFormatType.Personnel}}`,

      // 特定交通工具下 顺序变一下
      ...(hasFlag(options.vehicle, VehicleType.Drive)
        ? [
            // 交通工具
            `{${OutputFormatType.Vehicle}}`,
            // 人数
            `{${OutputFormatType.NumberOfPersonnel}}`
          ]
        : [
            // 人数
            `{${OutputFormatType.NumberOfPersonnel}}`,
            // 交通工具
            `{${OutputFormatType.Vehicle}}`
          ]),

      `{${OutputFormatType.ProfessionalTool}}`
    ].join('')
  }

  goBackHome() {}
}

namespace OutputFormatOptions {
  export interface StartOffOptions {
    vehicle: VehicleType
  }
}
