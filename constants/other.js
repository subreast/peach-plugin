/** 时间单位 */
export const Time_unit = {
  //毫秒
  毫秒: 0.001,
  //秒
  秒: 1,
  S: 1,
  SECOND: 1,
  //分钟
  分: 60,
  分钟: 60,
  M: 60,
  MIN: 60,
  MINUTE: 60,
  //小时
  时: 3600,
  小时: 3600,
  H: 3600,
  HOUR: 3600,
  //天
  天: 86400,
  日: 86400,
  D: 86400,
  DAY: 86400,
  //周
  周: 604800,
  W: 604800,
  WEEK: 604800,
  //月
  月: 2592000,
  MONTH: 2592000,
  //年
  年: 31536000,
  Y: 31536000,
  YEAR: 31536000

}

/** 登录设备 */
export const platform = {
  1: 'Android_Phone',
  2: 'APad',
  3: 'Android_Watch',
  4: 'MacOS',
  5: 'IPad',
  6: 'Old_Android'
}

/** 在线状态 */
export const status = {
  31: '离开',
  50: '忙碌',
  70: '请勿打扰',
  41: '隐身',
  11: '我在线上',
  60: 'Q我吧'
}

/**性别 */
export const gender = {
  0: '无',
  1: '男',
  2: '女'
}

/** 权限 */
export const ROLE_MAP = {
  admin: '群管理',
  owner: '群主',
  member: '群员'
}
