import _ from 'lodash'
import { InformationReturnTypes } from '.'

const professionalToolsList = ['破拆斧', '冲锋舟', '绳索', '液压钳']

/**
 * 获取专业工具列表
 */
export default function getProfessionalToolsList() {
  const list: InformationReturnTypes.ProfessionalToolItem[] = []
  _.forEach(professionalToolsList, (toolName) => {
    list.push({
      name: toolName,
      selected: false
    })
  })

  return list
}
