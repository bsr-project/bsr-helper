import Request from '@/base/Request'

export default class UserApi extends Request {
  GetInfo() {
    return this.request({
      url: `/user/info`,
      method: 'GET'
    })
  }

  UpdateUserInfo(data: any) {
    return this.request({
      url: `/user`,
      method: 'PATCH',
      data
    })
  }
}
