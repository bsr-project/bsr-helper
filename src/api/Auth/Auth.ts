import Request from '@/base/Request'

export default class AuthApi extends Request {
  GetUserInfo() {
    return this.request({
      url: '/auth/user/info',
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
