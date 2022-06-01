import Request from '@/base/Request'

export default class AuthApi extends Request {
  /**
   * 获取基础用户信息
   *
   * - id
   * - name
   */
  GetUserInfo() {
    return this.request({
      url: '/auth/user/info',
      method: 'GET'
    })
  }

  GetInfo(id: number) {
    return this.request({
      url: `/user/${id}`,
      method: 'GET'
    })
  }

  Login(data: { username: string; password: string }) {
    return this.request({
      url: '/auth/user/login',
      method: 'POST',
      data
    })
  }
}
