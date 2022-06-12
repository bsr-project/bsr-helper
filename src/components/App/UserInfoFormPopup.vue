<style lang="scss" scoped>
.user-info-container {
  padding: 20px;
}
</style>

<template>
  <van-popup v-model="showPopup" round :close-on-click-overlay="false" position="bottom" :style="{ height: '300px' }">
    <div class="user-info-container flex-BC">
      <span style="color: #999;" @click="$emit('update:visible', false)">取消</span>
      <span style="color: #0193dc;" @click="submit">提交</span>
    </div>
    <div>
      <van-field v-model="query.realname" label="姓名" placeholder="请填写姓名" />
      <van-field v-model="query.bsr_code" label="蓝天编号" placeholder="请填写蓝天编号" />
      <van-field v-model="query.car_number" label="车牌号" placeholder="请填写车牌号" />
      <van-field v-model="query.mobile" label="手机号" placeholder="请填写手机号" />
      <van-field v-model="query.password" label="密码" type="password" placeholder="密码（不修改请留空）" />
    </div>
  </van-popup>
</template>

<script lang="ts">
import _ from 'lodash'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

import { Popup, Button, Field, Notify } from 'vant'
import { SessionItemType } from '@/enums/Session'
import { IUserInfo, UserModule } from '@/store/modules/User'
import Session from '@/utils/Session'

import UserApi from '@/api/User/User'

@Component({
  name: 'UserInfoFormPopup',
  components: {
    ...[
      Popup,
      Button,
      Field
    ].reduce((components, component) => {
      components[component.name] = component
      return components
    }, {} as Record<string, any>)
  }
})
export default class UserInfoFormPopup extends Vue {

  @Prop({ required: true, type: Boolean }) visible!: boolean

  showPopup = this.visible

  query = {
    realname: '',
    bsr_code: '',
    car_number: '',
    mobile: '',
    password: ''
  }

  userInfo: IUserInfo | null = null

  @Watch('visible')
  visibleChanged() {
    this.showPopup = this.visible

    if (this.visible) {
      this.userInfo = Session.Instance().get<IUserInfo>(SessionItemType.UserInfo)

      if (this.userInfo) {
        this.query.realname = this.userInfo.realname || ''
        this.query.bsr_code = this.userInfo.bsr_code || ''
        this.query.car_number = this.userInfo.car_number || ''
        this.query.mobile = this.userInfo.mobile || ''
      }
    } else {
      this.query = {
        realname: '',
        bsr_code: '',
        car_number: '',
        mobile: '',
        password: ''
      }
    }

  }



  async submit() {
    await UserApi.Instance().UpdateUserInfo(this.query)

    const userInfo = _.assign(this.userInfo, this.query)

    Session.Instance().set(SessionItemType.UserInfo, userInfo)
    UserModule.SetUserInfo(userInfo)

    Notify({
      type: 'success',
      message: '更新成功'
    })

    this.$emit('update:visible', false)
  }
}
</script>