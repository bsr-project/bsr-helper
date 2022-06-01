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

export interface IUserState {
  token: string | null
  name: string | null
}

@Module({ dynamic: true, store, name: 'user' })
class User extends VuexModule implements IUserState {
  token = LocalStorageUtil.Instance().get<string>(StorageItemType.Token)
  name = LocalStorageUtil.Instance().get<string>(StorageItemType.UserName)

  @Mutation
  private SET_TOKEN(token: string) {
    this.token = token
    LocalStorageUtil.Instance().set(StorageItemType.Token, token)
  }

  @Mutation
  private SET_NAME(name: string) {
    this.name = name
    LocalStorageUtil.Instance().set(StorageItemType.UserName, name)
  }

  @Action
  public async Login(data: { username: string; password: string }) {
    data.username = data.username.trim()
    const res = await AuthApi.Instance().Login(data)

    const username = _.get(res, 'username')
    const access_token = _.get(res, 'access_token')

    if (!access_token) {
      Notify({
        type: 'danger',
        message: res.message
      })
      return Promise.reject(new Error('登录失败'))
    }

    this.SET_NAME(username)
    this.SET_TOKEN(access_token)

    router.push('/')

    return Promise.resolve(res)
  }

  @Action
  public ClearToken() {
    this.SET_NAME('')
    this.SET_TOKEN('')
  }
}

export const UserModule = getModule(User)
