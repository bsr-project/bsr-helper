import {
  VuexModule,
  Module,
  Action,
  Mutation,
  getModule
} from 'vuex-module-decorators'

import store from '@/store'
import LocalStorageUtil from '@/utils/Storage'
import { StorageItemType } from '@/enums/Storage'
import AuthApi from '@/api/Auth/Auth'
import _ from 'lodash'
import router from '@/router'

import { Notify } from 'vant'
import Session from '@/utils/Session'
import { SessionItemType } from '@/enums/Session'
import UserApi from '@/api/User/User'

/**
 * 基础用户信息
 */
export interface IUser {
  id: number
  name: string
}

/**
 * 用户信息
 */
export interface IUserInfo extends IUser {
  realname: string | null
  mobile: string | null
  bsr_code: string | null
  car_number: string | null
}

export interface IUserState {
  token: string | null
  user: IUser | null
  userInfo: IUserInfo | null
}

@Module({ dynamic: true, store, name: 'user' })
class User extends VuexModule implements IUserState {
  token = LocalStorageUtil.Instance().get<string>(StorageItemType.Token)
  user = LocalStorageUtil.Instance().get<IUser>(StorageItemType.UserInfo)

  userInfo = Session.Instance().get<IUserInfo>(SessionItemType.UserInfo)

  @Mutation
  private SET_TOKEN(token: string) {
    this.token = token
    LocalStorageUtil.Instance().set(StorageItemType.Token, token)
  }

  @Mutation
  private SET_USER(user: IUser | null) {
    this.user = user
    LocalStorageUtil.Instance().set(StorageItemType.UserInfo, user)
  }

  @Mutation
  private SET_USER_INFO(userInfo: IUserInfo | null) {
    this.userInfo = userInfo
    LocalStorageUtil.Instance().set(StorageItemType.UserInfo, userInfo)
  }

  @Action({ commit: 'SET_USER_INFO' })
  public async SetUserInfo(userInfo: IUserInfo) {
    return userInfo
  }

  @Action
  public async Login(data: {
    username: string
    password: string
  }): Promise<IUser> {
    data.username = data.username.trim()
    const loginResponse = await AuthApi.Instance().Login(data)

    const id = _.get(loginResponse, 'id')
    const name = _.get(loginResponse, 'name')
    const access_token = _.get(loginResponse, 'access_token')

    if (!access_token) {
      Notify({
        type: 'danger',
        message: loginResponse.message
      })
      return Promise.reject(new Error('登录失败'))
    }

    this.SET_USER({
      id,
      name
    })

    this.SET_TOKEN(access_token)

    // 获取详情
    const userInfoResponse = await UserApi.Instance().GetInfo(id)
    Session.Instance().set(SessionItemType.UserInfo, userInfoResponse)
    this.SET_USER_INFO(userInfoResponse)

    router.push('/')

    return Promise.resolve(loginResponse)
  }

  @Action
  public ClearToken() {
    this.SET_USER_INFO(null)
    this.SET_TOKEN('')

    // 清除 session storage
    Session.Instance().clear(SessionItemType.UserInfo)
  }
}

export const UserModule = getModule(User)
