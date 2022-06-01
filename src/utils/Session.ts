import _ from 'lodash'

import { SessionItemType } from '@/enums/Session'
import Singleton from '@/base/Singleton'

/**
 * 本地存储类封装
 */
export default class Session extends Singleton {
  /**
   * 保存数据
   * @param key
   * @param value
   */
  set<T>(key: SessionItemType, path: string | T, value?: T) {
    // 取出整个值
    let originValue = this.get<{ [key: string]: any } | null>(key)

    if (value) {
      // 三个参数都有的情况
      // 为空 或 不是 json 的处理
      if (originValue === null || !_.isObject(originValue)) {
        originValue = {}
      }

      originValue = {
        ...originValue,
        ...value
      }

      // 保存
      const saveValue = _.set(originValue, path as string, value)
      window.sessionStorage.setItem(
        this.getKeyString(key),
        JSON.stringify(saveValue)
      )

      return
    }

    // 没设置 value 相当于把 path 作为 value

    // 是字符串则直接保存
    if (_.isString(path)) {
      window.sessionStorage.setItem(this.getKeyString(key), path)
      return
    }

    // 是数组直接转 json 保存
    if (_.isArray(path)) {
      window.sessionStorage.setItem(
        this.getKeyString(key),
        JSON.stringify(path)
      )
      return
    }

    // 如果是对象 先解构已存储的值 再解构传入的值
    originValue = {
      ...originValue,
      ...path
    }

    // 转 json 字符串保存
    window.sessionStorage.setItem(
      this.getKeyString(key),
      JSON.stringify(originValue)
    )
  }

  /**
   * 获取数据
   * @param key
   * @param path
   * @returns
   */
  get<T>(key: SessionItemType, path?: string): T | null {
    const valueString = window.sessionStorage.getItem(this.getKeyString(key))
    // 空
    if (valueString === null) return null

    // 如果格式不是 {...} 直接返回这个字符串
    if (!this.isJson(valueString)) {
      // 有 path 返回 null 没有 返回字符串
      return valueString as any
    }

    // 最后尝试转为 json 根据 path 获取值
    const json = this.json2Object(valueString)

    return path ? _.get(json, path, null) : json
  }

  clear(key: SessionItemType) {
    window.sessionStorage.removeItem(this.getKeyString(key))
  }

  /**
   * 获取 key 的字符串
   */
  private getKeyString(key: SessionItemType) {
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
