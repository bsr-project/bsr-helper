import { StorageItemType } from '@/enums/Storage'
import LocalStorageUtil from '@/utils/Storage'
import router from './index'

const whiteList = ['/login', '/about']

router.beforeEach(async (to, form, next) => {
  const token = LocalStorageUtil.Instance().get(StorageItemType.Token)

  // 有 token
  if (token) {
    // 进入 login 页面 跳转到首页
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      next()
    }
  } else {
    // 不验证 token
    if (~whiteList.indexOf(to.path)) {
      next()
    } else {
      // 没 token 跳转到 login
      next({ path: '/login' })
    }
  }
})
