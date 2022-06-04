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

  SignIn(data: any) {
    return this.request({
      url: '/join-mission/sign-in',
      method: 'POST',
      data
    })
  }

  SignOut(data: any) {
    return this.request({
      url: '/join-mission/sign-out',
      method: 'POST',
      data
    })
  }
}
