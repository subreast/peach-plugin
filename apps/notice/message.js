import { common } from '../../lib/index.js'
import { Config } from '../../components/index.js'

Bot.on('message', async (e) => {

  const deltime = Config.getWhole.deltime// 删除缓存时间

  if (e.user_id == (e.bot ?? Bot).uin) return false// 判断是否为机器人消息
  if (Config.masterQQ.includes(e.user_id)) return false// 判断是否主人消息
  // 判断群聊还是私聊
  if (e.isGroup) {
    // 获取群撤回通知开关状态
    if (Config.getGroup(e.group_id).groupRecall) {
      logger.debug(`存储群消息${(e.group_id)}=> ${e.message_id}`)
      // 写入db
      await redis.set(
        `notice:messageGroup:${e.message_id}`,
        JSON.stringify(e.message),
        { EX: deltime }
      )
    }
  }
  else if (e.isPrivate) {
    // 获取私聊撤回通知开关状态
    if (Config.getWhole.PrivateRecall) {
      logger.debug(`存储私聊消息(${e.user_id})=> ${e.message_id}`)
      await redis.set(
        `notice:messagePrivate:${e.message_id}`,
        JSON.stringify(e.message),
        { EX: deltime }
      )
    }
  }

  // 消息通知
  let msg = null
  let forwardMsg = null
  if (e.message[0].type == 'flash' && e.message_type === 'group') {//群闪照
    // 获取群闪照通知单独开关状态
    if (!Config.getGroup(e.group_id).flashPhoto) return false
    logger.mark('群聊闪照')
    msg = [
      segment.image(`https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`), //群头像
      '[消息 - 闪照消息]\n',
      `发送人QQ：${e.user_id}\n`,
      `发送人昵称：${e.sender.nickname}\n`,
      `来源群号：${e.group_id}\n`,
      `来源群名：${e.group_name}\n`,
      `闪照链接:${e.message[0].url}`
    ]
  }
  else if (e.message[0].type == 'flash' && e.message_type === 'discuss' && Config.getWhole.flashPhoto) {//获取讨论组闪照
    logger.mark('讨论组闪照')
    msg = [
      segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`), //讨论组某成员头像，因为讨论组不好直接获取头像
      '[消息 - 闪照消息]\n',
      `发送人QQ：${e.user_id}\n`,
      `发送人昵称：${e.sender.nickname}\n`,
      `讨论组号：${e.discuss_id}\n`,
      `讨论组名：${e.discuss_name}\n`,
      `闪照链接:${e.message[0].url}`
    ]
  }
  else if (e.message[0].type == 'flash' && e.message_type === 'private' && Config.getWhole.flashPhoto) {//获取临时对话闪照
    logger.mark('临时对话闪照')
    msg = [
      segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
      '[消息 - 闪照消息]\n',
      `发送人QQ：${e.user_id}\n`,
      `发送人昵称：${e.sender.nickname}\n`,
      `闪照链接:${e.message[0].url}`
    ]
  }
  else if (e.message_type === 'private' && e.sub_type === 'friend') {//好友消息
    if (!Config.getWhole.privateMessage) return false
    // 特殊消息处理
    const arr = getMsgType(e.message)
    if (arr) {
      forwardMsg = arr.msg
      e.message = arr.type
    }
    logger.mark('好友消息')
    msg = [
      segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
      '[消息 - 好友消息]\n',
      `好友QQ：${e.user_id}\n`,
      `好友昵称：${e.sender.nickname}\n`,
      '消息内容：',
      ...e.message
    ]
    // 添加提示消息
    const key = `notice:privateMessage:${e.user_id}`
    if (!(await redis.get(key))) {
      await redis.set(key, '1', { EX: 600 })
      msg.push(
        '\n-------------\n',
        '引用该消息发送："回复 <内容>" 回复对方\n',
        `或发送："回复 ${e.user_id} <内容>" 回复对方`
      )
    }
  }
  else if (e.message_type === 'private' && e.sub_type === 'group') {//群临时消息
    if (!Config.getGroup(e.group_id).grouptemporaryMessage) return false
    // 特殊消息处理
    const arr = getMsgType(e.message)
    if (arr) {
      forwardMsg = arr.msg
      e.message = arr.type
    }
    logger.mark('群临时消息')
    // 发送的消息
    msg = [
      segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
      '[消息 - 群临时消息]\n',
      `来源群号：${e.sender.group_id}\n`,
      `发送人QQ：${e.user_id}\n`,
      '消息内容：',
      ...e.message
    ]
    // 添加提示消息
    const key = `notice:tempprivateMessage:${e.user_id}`
    if (!(await redis.get(key))) {
      await redis.set(key, '1', { EX: 600 })
      msg.push(
        '\n-------------\n',
        '可发送："加为好友" 添加对方为好友\n或发送："回复 <内容>" 回复对方'
      )
    }
  }
  else if (e.message_type === 'group') {
    if (!Config.getGroup(e.group_id).groupMessage) return false
    // 特殊消息处理
    const arr = getMsgType(e.message)
    if (arr) {
      forwardMsg = arr.msg
      e.message = arr.type
    }
    logger.mark('群聊消息')
    msg = [
      segment.image(`https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`),
      '[消息 - 群聊消息]\n',
      `来源群号：${e.group_id}\n`,
      `来源群名：${e.group_name}\n`,
      `发送人QQ：${e.user_id}\n`,
      `发送人昵称：${e.sender.nickname}\n`,
      '消息内容：',
      ...e.message
    ]
  } else if (e.message_type === 'discuss') {
    if (!Config.getGroup(e.group_id).groupMessage) return false
    logger.mark('讨论组消息')
    msg = [
      segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${e.user_id}`),
      '[消息 - 群聊消息]\n',
      `来源讨论组号：${e.discuss_id}\n`,
      `来源讨论组名：${e.discuss_name}\n`,
      `发送人QQ：${e.user_id}\n`,
      `发送人昵称：${e.sender.nickname}\n`,
      `消息内容：${e.raw_message}`
    ]
  } else {
    return false
  }
  // 发送消息
  await common.sendMasterMsg(msg)
  if (forwardMsg) await common.sendMasterMsg(forwardMsg)
})

// 特殊消息处理
function getMsgType(msg) {
  const msgType = {
    record: {
      msg: segment.record(msg[0].url),
      type: '[语音]'
    },
    video: {
      msg: segment.video(msg[0].file),
      type: '[视频]'
    },
    xml: {
      msg,
      type: '[合并消息]'
    }
  }
  return msgType[msg[0].type]
}
