import Request from '@/base/Request'

export default class MissionApi extends Request {
  /**
   * 获取所有有效的任务
   */
  GetActiveList() {
    return this.request({
      url: '/mission/active',
      method: 'GET'
    })
  }
}
