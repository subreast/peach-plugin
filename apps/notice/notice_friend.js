import { common } from '../../lib/index.js'
import { Config } from '../../components/index.js'

Bot.on('notice.friend', async (e) => {

  let msg
  let forwardMsg
  switch (e.sub_type) {
    case 'increase': {
      if (!Config.getWhole.friendNumberChange) return false
      logger.mark('新增好友')
      msg = [
        segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
        '[通知 - 新增好友]\n',
        `好友QQ：${e.user_id}\n`,
        `好友昵称：${e.nickname}`
      ]
      break
    }
    case 'decrease': {
      if (!Config.getWhole.friendNumberChange) return false
      logger.mark('好友被删除')
      msg = [
        segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
        '[通知 - 好友被删除]\n',
        `好友QQ：${e.user_id}\n`,
        `好友昵称：${e.nickname}`
      ]
      break
    }
    case 'recall': {
      if (!Config.getWhole.PrivateRecall) return false
      if (e.user_id == (e.bot ?? Bot).uin) return false
      // 主人撤回
      if (Config.masterQQ.includes(e.user_id)) return false
      logger.mark('好友撤回')
      // 读取
      let res = JSON.parse(
        await redis.get(`notice:messagePrivate:${e.message_id}`)
      )
      if (!res) return false //无消息
      const arr = getMsgType(res)
      if (arr) {
        forwardMsg = arr.msg()
        res = arr.type
      }

      // 消息
      msg = [
        segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
        '[消息 - 好友撤回消息]\n',
        `好友QQ：${e.user_id}\n`,
        `撤回时间：${common.formatDate(e.time)}\n`,
        '撤回消息：',
        ...res
      ]
      break
    }
    case 'poke': {
      if (!Config.getWhole.privateMessage) return false
      logger.mark('好友戳一戳')
      msg = [
        segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
        '[消息 - 戳一戳]\n',
        `来源QQ：${e.user_id}`
      ]
      break
    }
    default:
      return false
  }
  await common.sendMasterMsg(msg)
  if (forwardMsg) await common.sendMasterMsg(forwardMsg)
}
)


// 特殊消息处理
function getMsgType(msg) {
  const msgType = {
    flash: {
      msg: () => false,
      type: ['[闪照]\n', '撤回闪照：', segment.image(msg[0].url)]
    },
    record: {
      msg: () => segment.record(msg[0].url),
      type: '[语音]'
    },
    video: {
      msg: () => segment.video(msg[0].file),
      type: '[视频]'
    },
    xml: {
      msg: () => msg,
      type: '[合并消息]'
    }
  }
  return msgType[msg[0].type]
}
