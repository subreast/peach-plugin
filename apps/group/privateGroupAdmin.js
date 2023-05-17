import { GroupAdmin } from '../../model/index.js'
import { Time_unit } from '../../constants/other.js'
import { common } from '../../lib/index.js'

// 正则
const Numreg = '[一壹二两三四五六七八九十百千万亿\\d]+'
const TimeUnitReg = Object.keys(Time_unit).join('|')
const muteMemberReg = new RegExp(`^#?禁言\\s?(\\d+)\\s(\\d+)\\s(${Numreg})?(${TimeUnitReg})?$`)


export class _PrivateGroupAdmin extends plugin {
  constructor() {
    super({
      name: '[peach-plugin]私聊群管帮助',
      event: 'message',
      priority: 2000,
      rule: [
        {
          reg: muteMemberReg,
          fnc: 'muteMember'
        },
        {
          reg: '^#?解禁\\s?(\\d+)\\s(\\d+)$',
          fnc: 'nomuteMember'
        },
        {
          reg: '^#?全体(禁言|解禁)(\\d+)$',
          fnc: 'muteAll'
        },
        {
          reg: '^#?踢\\s?(\\d+)\\s(\\d+)$',
          fnc: 'kickMember'
        }
      ]
    })
  }

  async muteMember(e) {
    if (!e.isMaster) return false
    let regRet = e.msg.match(muteMemberReg)
    const time = common.translateChinaNum(regRet[3])
    let res = await new GroupAdmin(e).muteMember(regRet[1], regRet[2], e.user_id, time, regRet[4])
    e.reply(res)
  }

  async noMuteMember(e) {
    if (!e.isMaster) return false
    let regRet = e.msg.match(/^#解禁\s?(\d+)\s(\d+)$/)
    let res = await new GroupAdmin(e).muteMember(regRet[1], regRet[2], e.user_id, 0)
    e.reply(res)
  }

  async muteAll(e) {
    if (!e.isMaster) return false
    let regRet = e.msg.match(/全体(禁言|解禁)(\d+)/)
    let group = (e.bot ?? Bot).pickGroup(Number(regRet[2]))
    group.muteAll(regRet[1] == '禁言')
    e.reply(`✅ 已将群「${group.name}(${group.group_id})」${regRet[1] == '禁言' ? '开启' : '解除'}全体禁言`)
  }

  async kickMember(e) {
    if (!e.isMaster) return false
    let regRet = e.msg.match(/#踢\s?(\d+)\s(\d+)$/)
    let res = await GroupAdmin.kickMember(regRet[1], regRet[2], e.user_id)
    e.reply(res)
  }
}
