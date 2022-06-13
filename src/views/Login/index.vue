<template>
  <van-form @submit="submit">
    <van-field v-model="query.username" name="用户名" label="用户名" placeholder="用户名" />
    <van-field v-model="query.password" type="password" name="密码" label="密码" placeholder="密码" />
    <div style="margin: 16px;">
      <van-button round block type="info" native-type="submit">提交</van-button>
    </div>
  </van-form>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Form, Field, Button } from 'vant'
import { UserModule } from '@/store/modules/User'

@Component({
  name: 'Login',
  components: [Form, Field, Button].reduce((components, component) => {
    components[component.name] = component
    return components
  }, {} as Record<string, any>)
})
export default class Login extends Vue {
  query = {
    username: '',
    password: ''
  }

  submit() {
    UserModule.Login(this.query)
  }
}
</script>