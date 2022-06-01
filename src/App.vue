<style lang="scss">
#app {
  color: #2c3e50;
  overflow: hidden;
}

#nav {
  position: relative;

  padding: 20px;
  text-align: center;
  background-image: linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%);

  a {
    font-weight: bold;
    color: #2c3e50;
    font-size: 20px;

    &+a {
      margin-left: 20px;
    }

    &.router-link-exact-active {
      color: #42b983;
    }
  }

  .username {
    position: absolute;
    top: 50%;
    right: 20px;

    transform: translateY(-50%);
  }
}
</style>


<template>
  <div id="app">
    <div id="nav">
      <template v-if="token">
        <span class="username" @click="Logout">{{ realname }}</span>
        <router-link to="/">主页</router-link>
      </template>
      <template v-else>
        <router-link to="/login">登录</router-link>
      </template>
      <router-link to="/about">关于</router-link>
    </div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

import { Dialog } from 'vant'

import { UserModule } from '@/store/modules/User'
import UserApi from './api/User/User'
import Session from './utils/Session'
import { SessionItemType } from './enums/Session'

@Component({
  name: 'App'
})
export default class App extends Vue {
  get token() {
    return UserModule.token
  }

  get user() {
    return UserModule.user ? UserModule.user : { id: -1, name: '' }
  }

  get realname() {
    return UserModule.userInfo ? UserModule.userInfo.realname : ''
  }

  /**
   * 退出
   */
  Logout() {
    Dialog.confirm({
      title: '确认退出',
      message: '您确认要退出吗？'
    }).then(() => {
      UserModule.ClearToken()
      this.$router.push('/login')
    })
  }

  async created() {

    // 获取用户详细信息 因为是存在 session storage 的，所以有可能需要从接口获取
    const sessionUserInfo = Session.Instance().get(SessionItemType.UserInfo)

    // 如果没有 session user info && 有 token
    if (!sessionUserInfo && this.token) {
      // 请求接口获取用户信息
      const response = await UserApi.Instance().GetInfo(this.user.id)
      // 存入 session storage
      Session.Instance().set(SessionItemType.UserInfo, response)
      // 存入 vuex
      UserModule.SetUserInfo(response)
    }

  }
}
</script>