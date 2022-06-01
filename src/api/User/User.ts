import Request from '@/base/Request'

export default class UserApi extends Request {
  GetInfo(id: number) {
    return this.request({
      url: `/user/${id}`,
      method: 'GET'
    })
  }
}
