import plugin from '../../../lib/plugins/plugin.js'
import fs from 'fs'
import lodash from 'lodash'
import { Config } from '../components/index.js'
import { puppeteer } from '../lib/index.js'


const plugin_name = "peach-plugin"
const noticeSetting_background = `./plugins/${plugin_name}/resources/help/imgs/background/`

/** 系统设置项 */
const OtherCfgType = {
  全部消息通知: 'noticeAll',
  通知发送给全部主人: 'notificationsAll',
  默认状态: 'state',
  状态任务: 'statusTask'  // 给有问题的用户关闭定时器
}
const NoticeCfgType = {
  好友消息: 'privateMessage',
  群消息: 'groupMessage',
  群临时消息: 'grouptemporaryMessage',
  群撤回: 'groupRecall',
  好友撤回: 'PrivateRecall',
  // 申请通知
  好友申请: 'friendRequest',
  加群申请: 'addGroupApplication',
  群邀请: 'groupInviteRequest',
  // 信息变动
  群管理变动: 'groupAdminChange',
  // 列表变动
  好友列表变动: 'friendNumberChange',
  群聊列表变动: 'groupNumberChange',
  群成员变动: 'groupMemberNumberChange',
  // 其他通知
  闪照: 'flashPhoto',
  禁言: 'botBeenBanned',
  好友输入: 'input',
  陌生人点赞: 'Strangers_love',
}
/** 分开开关和数字 */
const SwitchCfgType = {
  ...OtherCfgType, ...NoticeCfgType,
}
const NumberCfgType = {
  渲染精度: {
    key: 'renderScale',
    limit: '50-200'
  },
  删除缓存时间: {
    key: 'deltime',
    limit: '>120'
  }
}

/** 支持单独设置的项 */
const aloneKeys = [
  '群消息', '群临时消息', '群撤回', '群邀请', '群管理变动', '群聊列表变动', '群成员变动', '加群通知', '禁言', '闪照']

const SwitchCfgReg = new RegExp(`^#?(单独)?(开启|关闭)(${Object.keys(SwitchCfgType).join('|')})(通知)?$`)
const NumberCfgReg = new RegExp(`^#?设置(${Object.keys(NumberCfgType).join('|')})(\\d+)秒?$`)



export class _NoticeAdmin extends plugin {
  constructor() {
    super({
      name: '[peach-plugin]通知设置',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: '^#?(开启|关闭|启用|禁用)全部消息通知$',
          fnc: 'SetAllNotice',
          permission: 'master'
        },
        {
          reg: SwitchCfgReg,
          fnc: 'ConfigSwitch',
          permission: 'master'
        },
        {
          reg: NumberCfgReg,
          fnc: 'ConfigNumber',
          permission: 'master'
        }
      ]
    })
  }

  // 更改配置
  async ConfigSwitch(e) {
    // 解析消息
    let regRet = SwitchCfgReg.exec(e.msg)
    let key = regRet[3]
    let is = regRet[2] == '开启'
    if (!is) {
      Config.modify('whole', "noticeAll", is)
    }
    // 单独设置
    if (regRet[1]) {
      if (!aloneKeys.includes(key)) return e.reply('❎ 该设置项不支持单独设置')
      if (!e.group_id) return e.reply('❎ 请在要单独设置的群聊发送单独设置命令')
      let isdel = regRet[2] == '关闭' //是否在单独设置的文件中删除该群配置
      Config.aloneModify(e.group_id, SwitchCfgType[key], is, isdel)
    } else {
      let _key = SwitchCfgType[key]
      Config.modify(_key?.name ?? 'whole', _key?.key ?? _key, is)

    }
    index_Settings(e)
  }

  // 修改数字设置
  async ConfigNumber(e) {
    let regRet = e.msg.match(NumberCfgReg)
    let type = NumberCfgType[regRet[1]]
    let number = checkNumberValue(regRet[2], type.limit)
    Config.modify(type.name ?? 'whole', type.key, number)
    index_Settings(e)
  }

  // 开启全部通知设置 
  async SetAllNotice(e) {
    let yes = (/启用|开启/).test(e.msg)
    //console.log("正在执行命令：" + (yes ? '开启全部通知' : '关闭全部通知'));
    for (let i in NoticeCfgType) {
      Config.modify('whole', NoticeCfgType[i], yes)
    }
    Config.modify('whole', "noticeAll", yes)
    index_Settings(e)
  }

}

// 渲染发送图片
/**
 * 
 * @param {*} e 
 * @returns 获取到各个通知的开关状态，如果存在单独设置就设置单独设置的值
 */
async function index_Settings(e) {
  let data = {}
  const special = ['deltime', 'renderScale']
  let _cfg = Config.getGroup(e.group_id)//得到group_id的专属设置和全局设置
  for (let key in _cfg) {
    if (special.includes(key)) {//如果是删除缓存时间或者渲染精度的数值值，就转为数字类型
      data[key] = Number(Config.getWhole[key])
    } else {
      let groupCfg = Config.getConfig('group')[e.group_id]
      let isAlone = groupCfg ? groupCfg[key] : undefined
      data[key] = getStatus(_cfg[key], isAlone)
    }
  }
  // 渲染图像
  return await puppeteer.render('help/notice_index', {
    ...data,
    background: await rodom()
  }, {
    e,
    scale: 1.0
  })

}
// 随机底图
const rodom = async function () {
  let image = fs.readdirSync(noticeSetting_background)
  let listImg = []
  for (let val of image) {
    listImg.push(val)
  }
  let imgs = listImg.length == 1 ? listImg[0] : listImg[lodash.random(0, listImg.length - 1)]
  return imgs
}

/**
 * 
 * @param {*} rote  控制是开启还是关闭
 * @param {*} alone 控制是否显示群单独（从群配置中有相关群的设置就显示群单独否则不显示）
 * @returns badge = '群单独' | ''
 */
const getStatus = function (rote, alone) {
  let badge = alone != undefined ? '<span class="badge";>群单独</span>' : ''
  if (rote) {
    return badge + '<div class="cfg-status" >已开启</div>'
  } else {
    return badge + '<div class="cfg-status status-off">已关闭</div>'
  }
}

/**
 * 检查一个数值是否满足给定的限制条件，并返回经过验证的数值。
 *
 * @param {number} value - 要检查的数值。
 * @param {string} limit - 要检查的限制条件。
 *   限制条件可以是以下格式之一：
 *   - "X-Y" 形式的范围限制条件，其中 X 和 Y 是表示下限和上限的数字。
 *   - "<X" 或 ">X" 形式的比较限制条件，其中 X 是表示限制值的数字。
 * @returns {number} 经过验证的数值。如果给定的值超出了限制条件，则返回限制条件对应的最大值或最小值，否则返回原值。
 */
function checkNumberValue(value, limit) {
  // 检查是否存在限制条件
  if (!limit) {
    return value
  }
  // 解析限制条件
  const [symbol, limitValue] = limit.match(/^([<>])?(.+)$/).slice(1)
  const parsedLimitValue = parseFloat(limitValue)

  // 检查比较限制条件
  if ((symbol === '<' && value > parsedLimitValue) || (symbol === '>' && value < parsedLimitValue)) {
    return parsedLimitValue
  }

  // 检查范围限制条件
  if (!isNaN(value)) {
    const [lowerLimit, upperLimit] = limit.split('-').map(parseFloat)
    const clampedValue = Math.min(Math.max(value, lowerLimit || -Infinity), upperLimit || Infinity)
    return clampedValue
  }

  // 如果不符合以上任何条件，则返回原值
  return parseFloat(value)
}
export default { index_Settings }
