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

.user-popup {
  border-radius: 10px;
  width: 80%;

  .van-cell-group {
    margin: 0;
  }
}
</style>


<template>
  <div id="app">
    <div id="nav">
      <template v-if="token">
        <span class="username" @click="showUserPopup = true">{{ realname }}</span>
        <router-link to="/">主页</router-link>
      </template>
      <template v-else>
        <router-link to="/login">登录</router-link>
      </template>
      <router-link to="/about">关于</router-link>
    </div>
    <router-view />

    <van-popup v-model="showUserPopup" class="user-popup">
      <van-cell-group inset>
        <van-cell title="编辑用户信息" is-link @click="userInfoPopup.visible = true, showUserPopup = false" />
        <van-cell is-link @click="Logout">
          <template #title>
            <span style="color: #f00;">退出登录</span>
          </template>
        </van-cell>
      </van-cell-group>
    </van-popup>

    <UserInfoFormPopup :visible.sync="userInfoPopup.visible"></UserInfoFormPopup>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

import { Dialog, Popup, Cell, CellGroup } from 'vant'

import { IUserInfo, UserModule } from '@/store/modules/User'
import UserApi from './api/User/User'
import Session from './utils/Session'
import { SessionItemType } from './enums/Session'

import UserInfoFormPopup from './components/App/UserInfoFormPopup.vue'

@Component({
  name: 'App',
  components: {
    UserInfoFormPopup,
    ...[
      Popup, Cell, CellGroup
    ].reduce((components, component) => {
      components[component.name] = component
      return components
    }, {} as Record<string, any>)
  }
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

  showUserPopup = false

  userInfoPopup = {
    visible: false
  }

  async created() {

    // 获取用户详细信息 因为是存在 session storage 的，所以有可能需要从接口获取
    let sessionUserInfo = Session.Instance().get<IUserInfo>(SessionItemType.UserInfo)

    // 如果没有 session user info && 有 token
    if (!sessionUserInfo && this.token) {
      // 请求接口获取用户信息
      sessionUserInfo = await UserApi.Instance().GetInfo(this.user.id)
      // 存入 session storage
      Session.Instance().set(SessionItemType.UserInfo, sessionUserInfo)
      // 存入 vuex
      UserModule.SetUserInfo(sessionUserInfo!)
    }

  }

  /**
   * 退出
   */
  Logout() {
    Dialog.confirm({
      title: '确认退出',
      message: '您确认要退出吗？'
    }).then(() => {
      this.showUserPopup = false
      UserModule.ClearToken()
      this.$router.push('/login')
    })
  }
}
</script>