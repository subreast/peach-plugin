import _ from 'lodash'
import { GroupBannedWords } from '../../model/index.js'
import { common } from '../../lib/index.js'
import cfg from '../../../../lib/config/config.js'

export class _GroupBannedWords extends plugin {
  constructor() {
    super({
      name: '[peach-plugin]群违禁词',
      event: 'message.group',
      priority: 1,
      rule: [
        {
          reg: '^#?\\s*(添加|新增|增加)\\s*(模糊|精确|正则)?\\s*(踢|禁|撤|踢撤|禁撤)?\\s*违禁词.*$',
          fnc: 'add'
        },
        {
          reg: '^#?删除违禁词.*$',
          fnc: 'del'
        },
        {
          reg: '^#?查看违禁词.*$',
          fnc: 'query'
        },
        {
          reg: '',
          fnc: 'monitor',
          log: false
        },
        {
          reg: '^#?违禁词列表$',
          fnc: 'list'
        },
        {
          reg: '^#?设置违禁词禁言时间(\\d+)$',
          fnc: 'muteTime'
        },
        {
          reg: '^#?(增加|减少|查看)头衔屏蔽词.*$',
          fnc: 'ProhibitedTitle'
        },
        {
          reg: '^#?切换头衔屏蔽词匹配(模式)?$',
          fnc: 'ProhibitedTitlePattern'
        }
      ]

    })
  }

  /**监听 */
  async monitor(e) {
    if (!e.message || e.isMaster || e.member.is_owner || e.member.is_admin) {
      return false
    }
    const groupBannedWords = GroupBannedWords.initTextArr(e.group_id)
    if (_.isEmpty(groupBannedWords)) {
      return false
    }
    const KeyWord = e.toString()
      .replace(/#|＃/g, '')
      .replace(`{at:${Bot.uin}}`, '')
      .trim()
    const trimmedKeyWord = this.#trimAlias(KeyWord)
    let data = null
    for (const [k, v] of groupBannedWords) {
      if (k.test(trimmedKeyWord)) {
        data = v
        break
      }
    }
    if (!data) return false
    const muteTime = GroupBannedWords.getMuteTime(e.group_id)
    const punishments = {
      1: () => e.member.kick(),
      2: () => this.#mute(muteTime),
      3: () => e.recall(),
      4: () => {
        e.member.kick()
        e.recall()
      },
      5: () => {
        this.#mute(muteTime)
        e.recall()
      }
    }
    const groupPenaltyAction = {
      1: '踢出群聊',
      2: `禁言${muteTime}秒`,
      3: '撤回消息',
      4: '踢出群聊并撤回消息',
      5: `禁言${muteTime}秒并撤回消息`
    }
    if (punishments[data.penaltyType]) {
      punishments[data.penaltyType]()
      const keyWordTran = await GroupBannedWords.keyWordTran(data.rawItem)
      const senderCard = e.sender.card || e.sender.nickname
      e.reply([
        `触发违禁词：${keyWordTran.substr(0, 2) + '*'.repeat(keyWordTran.length - 2)}\n`,
        `触发者：${senderCard}(${e.user_id})\n`,
        `执行：${groupPenaltyAction[data.penaltyType]}`
      ])
    }
  }


  /** 禁言 */
  #mute(time) {
    const e = this.e
    if (e.anonymous) {
      e.group.muteAnony(e.anonymous.flag, time)
    } else {
      e.member.mute(time)
    }
  }

  /** 过滤别名 */
  #trimAlias(msg) {
    let groupCfg = this.e.runtime.cfg.getGroup(this.group_id)
    let alias = groupCfg.botAlias
    if (!Array.isArray(alias)) {
      alias = [alias]
    }
    for (let name of alias) {
      if (msg.startsWith(name)) {
        msg = _.trimStart(msg, name).trim()
      }
    }

    return msg
  }

  /**添加 */
  async add(e) {
    if (!common.checkPermission(e, 'admin', 'admin')) return false
    let word = this.#trimAlias(e.toString())
    // console.log(word)
    word = word.match(/^#?\s*(添加|新增|增加)\s*(模糊|精确|正则)?\s*(踢|禁|撤|踢撤|禁撤)?\s*违禁词(.*)$/)
    // console.log(word[1] + "/" + word[2] + "/" + word[3])
    if (!word[4]) return e.reply('需要添加的屏蔽词为空')
    // 校验正则
    if (word[2] === '正则') {
      try {
        global.eval(word[4])
      } catch {
        return e.reply('正则表达式错误')
      }
    }
    try {
      let res = GroupBannedWords.addBannedWords(
        e.group_id, word[4].trim(), word[2], word[3], e.user_id
      )
      e.reply([
        '✅ 成功添加违禁词\n',
        '违禁词：',
        await res.words,
        `\n匹配模式：${res.matchType}\n`,
        `处理方式：${res.penaltyType}`
      ])
    } catch (error) {
      e.reply(error.message)
    }
  }

  /**删除 */
  async del(e) {
    if (!common.checkPermission(e, 'admin', 'admin')) return false
    let word = this.#trimAlias(e.toString())
    word = word.replace(/#?删除违禁词/, '').trim()
    if (!word) return e.reply('需要删除的屏蔽词为空')
    try {
      let msg = await GroupBannedWords.delBannedWords(e.group_id, word)
      e.reply(['✅ 成功删除：', msg])
    } catch (error) {
      e.reply(error.message)
    }
  }

  /**查询 */
  async query(e) {
    let word = this.#trimAlias(e.toString())
    word = word.replace(/#?查看违禁词/, '').trim()
    if (!word) return e.reply('需要查询的屏蔽词为空')
    try {
      const { words, matchType, penaltyType, addedBy, date } = GroupBannedWords.queryBannedWords(e.group_id, word)
      e.reply([
        '✅ 查询违禁词\n',
        '违禁词：',
        await words,
        `\n匹配模式：${matchType}\n`,
        `处理方式：${penaltyType}\n`,
        `添加人：${addedBy ?? '未知'}\n`,
        `添加时间：${date ?? '未知'}`
      ])
    } catch (error) {
      e.reply(error.message)
    }
  }

  /**列表 */
  async list(e) {
    const groupBannedWords = GroupBannedWords.initTextArr(e.group_id)
    if (_.isEmpty(groupBannedWords)) {
      return e.reply('❎ 没有违禁词')
    }
    const msg = []
    for (const [, v] of groupBannedWords) {
      const { matchType, penaltyType, addedBy, date, rawItem } = v
      msg.push([
        '违禁词：',
        await GroupBannedWords.keyWordTran(rawItem),
        `\n匹配模式：${GroupBannedWords.matchTypeMap[matchType]}\n`,
        `处理方式：${GroupBannedWords.penaltyTypeMap[penaltyType]}\n`,
        `添加人：${addedBy ?? '未知'}\n`,
        `添加时间：${date ?? '未知'}`
      ])
    }
    common.getforwardMsg(e, msg)
  }

  /**设置禁言时间 */
  async muteTime(e) {
    let time = e.msg.match(/\d+/)[0]
    GroupBannedWords.setMuteTime(e.group_id, time)
    e.reply(`✅ 群${e.group_id}违禁词禁言时间已设置为${time}s`)
  }


  // 增删查头衔屏蔽词
  async ProhibitedTitle(e) {
    // 获取现有的头衔屏蔽词
    let shieldingWords = GroupBannedWords.getTitleBannedWords(e.group_id)
    // 判断是否需要查看头衔屏蔽词
    if (/查看/.test(e.msg)) {
      // 返回已有的头衔屏蔽词列表
      return e.reply(`现有的头衔屏蔽词如下：${shieldingWords.join('\n')}`)
    }

    // 获取用户输入的要增加或删除的屏蔽词
    let message = e.msg.replace(/#|(增加|减少)头衔屏蔽词/g, '').trim().split(',')
    // 判断用户是要增加还是删除屏蔽词
    let isAddition = /增加/.test(e.msg)
    let existingWords = []
    let newWords = []

    // 遍历用户输入的屏蔽词，区分已有和新的屏蔽词
    for (let word of message) {
      if (shieldingWords.includes(word)) {
        existingWords.push(word)
      } else {
        newWords.push(word)
      }
    }

    // 去重
    existingWords = _.compact(_.uniq(existingWords))
    newWords = _.compact(_.uniq(newWords))

    // 判断是要增加还是删除屏蔽词
    if (isAddition) {
      // 添加新的屏蔽词
      if (!_.isEmpty(newWords)) {
        GroupBannedWords.addTitleBannedWords(e.group_id, newWords)
        e.reply(`✅ 成功添加：${newWords.join(',')}`)
      }
      // 提示已有的屏蔽词
      if (!_.isEmpty(existingWords)) {
        e.reply(`❎ 以下词已存在：${existingWords.join(',')}`)
      }
    } else {
      // 删除已有的屏蔽词
      if (!_.isEmpty(existingWords)) {
        GroupBannedWords.delTitleBannedWords(e.group_id, existingWords)
        e.reply(`✅ 成功删除：${existingWords.join(',')}`)
      }
      // 提示不在屏蔽词中的词
      if (!_.isEmpty(newWords)) {
        e.reply(`❎ 以下词未在屏蔽词中：${newWords.join(',')}`)
      }
    }
  }

  // 修改头衔匹配模式
  async ProhibitedTitlePattern(e) {
    if (!common.checkPermission(e, 'admin', 'admin')) return false
    let res = GroupBannedWords.setTitleFilterModeChange(e.group_id)
    e.reply(`✅ 已修改匹配模式为${res ? '精确' : '模糊'}匹配`)
  }
}