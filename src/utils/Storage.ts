import _ from 'lodash'

import { StorageItemType } from '@/enums/Storage'
import Singleton from '@/base/Singleton'

/**
 * 本地存储类封装
 */
export default class Storage extends Singleton {
  /**
   * 保存数据
   * @param key
   * @param value
   */
  set<T>(key: StorageItemType, path: string | T, value?: T) {
    if (value) {
      // 三个参数都有的情况
      // 取出整个值
      let originValue = this.get<{ [key: string]: any } | null>(key)
      // 为空 或 不是 json 的处理
      if (originValue === null || !_.isObject(originValue)) {
        originValue = {}
      }
      console.log(originValue)
      // 保存
      const saveValue = _.set(originValue, path as string, value)
      window.localStorage.setItem(
        this.getKeyString(key),
        JSON.stringify(saveValue)
      )
    } else {
      // 没设置 value 相当于把 path 作为 value
      window.localStorage.setItem(this.getKeyString(key), JSON.stringify(path))
    }
  }

  /**
   * 获取数据
   * @param key
   * @param path
   * @returns
   */
  get<T>(key: StorageItemType, path?: string): T | null {
    const valueString = window.localStorage.getItem(this.getKeyString(key))
    // 空
    if (valueString === null) return null

    // 如果格式不是 {...} 直接返回这个字符串
    if (!this.isJson(valueString)) {
      // 有 path 返回 null 没有 返回字符串
      return null
    }

    // 最后尝试转为 json 根据 path 获取值
    const json = this.json2Object(valueString)

    return path ? _.get(json, path, null) : json
  }

  clear(key: StorageItemType) {
    localStorage.removeItem(this.getKeyString(key))
  }

  /**
   * 获取 key 的字符串
   */
  private getKeyString(key: StorageItemType) {
    return `key_${key}`
  }

  private json2Object(string: string) {
    try {
      return JSON.parse(string)
    } catch (e) {
      return null
    }
  }

  private isJson(str: string) {
    return /^({.*}|\[.*\])$/.test(str)
  }
}
