import _ from 'lodash'

import { StorageItemType } from '@/enums/Storage'

/**
 * 本地存储类封装
 */
export default class Storage {
  private static _instance?: Storage

  static get Instance() {
    if (!this._instance) {
      this._instance = new Storage()
    }

    return this._instance
  }

  /**
   * 保存数据
   * @param key
   * @param value
   */
  set<T>(key: StorageItemType, value: T) {
    localStorage.setItem(
      this.getKeyString(key),
      (_.isObject(value) ? JSON.stringify(value) : value) as string
    )
  }

  /**
   * 获取数据
   * @param key
   * @param path
   * @returns
   */
  get<T>(key: StorageItemType, path?: string): T | null {
    const storage = localStorage.getItem(this.getKeyString(key))
    if (storage === null) return null

    // 没 path 返回全部内容
    if (!path) {
      return this.json2Object(storage) || storage
    }

    // 有 path 则根据 path 查找目标 value
    const value = _.get(this.json2Object(storage), path, null)
    // 如果是对象返回对象
    return this.json2Object(value) || value
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
}
