export enum SelectTimeType {
  START,
  END
}

export enum AddressType {
  /**
   * 出发地
   */
  DEPARTURE,

  /**
   * 目的地
   */
  DESTINATION
}

/**
 * 交通工具
 */
export enum VehicleType {
  Custom = 1 << 0,
  Drive = 1 << 1,
  Bike = 1 << 2,
  Walk = 1 << 3,
  Metro = 1 << 4,
  Bus = 1 << 5
}

/**
 * 输出文本类型
 */
export const OutputTextType = {
  /**
   * 出发
   */
  StartOff: '出发',

  /**
   * 到家
   */
  GoBackHome: '到家'
}
