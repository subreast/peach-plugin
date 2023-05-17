/*
* 此配置文件为系统使用，请勿修改，否则可能无法正常使用
*
* 如需自定义配置请复制修改上一级gpAdmin_default.js
*
* */
export const helpCfg = {
  title: '群管帮助',
  subTitle: '',
  columnCount: 3,
  colWidth: 265,
  theme: 'all',
  themeExclude: ['default'],
  style: {
    fontColor: '#ceb78b',
    descColor: '#eee',
    contBgColor: 'rgba(6, 21, 31, .5)',
    contBgBlur: 3,
    headerBgColor: 'rgba(6, 21, 31, .4)',
    rowBgColor1: 'rgba(6, 21, 31, .2)',
    rowBgColor2: 'rgba(6, 21, 31, .35)'
  }
}

export const helpList = [
  {
    group: '基础功能',
    list: [{
      title: '#踢 <@QQ>',
      desc: '把某某踢出群',
      icon: 4
    },
    {
      icon: 16,
      title: '#发通知 <消息>',
      desc: '发送@全体的通知'
    },
    {
      title: '#发群公告 <文字>',
      desc: '发送简易公告',
      icon: 16
    }, {
      title: '#查看群公告',
      desc: '查看现有公告',
      icon: 3
    },
    {
      title: '#删除群公告 <序号>',
      desc: '用查看公告获取序号',
      icon: 4
    },
    {
      icon: 5,
      title: '#允许|禁止匿名',
      desc: '群匿名设置'
    },
    {
      title: '#查看多久没发言的人',
      desc: '查看多少天|周|月没发言的人',
      icon: 15
    },
    {
      title: '#清理多久没发言的人',
      desc: '清理多少天|周|月没发言的人',
      icon: 14
    },
    {
      title: '#查看从未发言的人',
      desc: '查看进群后从未发言的人',
      icon: 1
    },
    {
      title: '#清理从未发言的人',
      desc: '清理进群后从未发言的人',
      icon: 5
    },
    {
      title: '#查看不活跃排行榜',
      desc: '后面可以加数字',
      icon: 16
    },
    {
      title: '#查看最近入群情况',
      desc: '后面可以加数字',
      icon: 4
    },
    {
      title: '#查看加群申请',
      desc: '查看本群的加群申请',
      icon: 2
    },
    {
      title: '#同意|拒绝加群申请<QQ>',
      desc: '处理本群的加群申请',
      icon: 19
    },
    {
      title: '#同意|拒绝全部加群申请',
      desc: '处理本群的全部加群申请',
      icon: 3
    },
    {
      title: '#我要自闭 <时间>',
      desc: '自闭一会',
      icon: 20
    }]
  },
  {
    group: '禁言功能',
    list: [
      {
        icon: 1,
        title: '#禁言 <@QQ> <时间>',
        desc: '禁言某某多少时间，时间有1天、二天、一周、一月，最多只能禁言30天'
      },
      {
        icon: 2,
        title: '#解禁 <@QQ>',
        desc: '解除某某禁言'
      },
      {
        title: '#<获取/查看>禁言列表',
        desc: '查看本群所有被禁言的人',
        icon: 8
      },
      {
        title: '#解除全部用户禁言',
        desc: '解除本群全部被禁言的人的禁言',
        icon: 6
      },
      {
        title: '#全体禁言|解禁',
        desc: '全体禁言|解除全体禁言',
        icon: 3
      },
      {
        title: '#定时(禁言|解禁)(00:00)',
        desc: '设置定时禁言或解禁任务',
        icon: 12
      },
      {
        title: '#定时禁言任务',
        desc: '查看定时禁言任务',
        icon: 10
      },
      {
        title: '#取消定时(禁言|解禁)',
        desc: '取消定时禁言任务',
        icon: 3
      }
    ]
  },
  {
    group: '群字符',
    list: [
      {
        title: '#开启|关闭幸运字符',
        desc: '开启或关闭群幸运字符功能',
        icon: 5
      },
      {
        title: '#抽幸运字符',
        desc: 'bot抽取字符',
        icon: 4
      },
      {
        title: '#幸运字符列表',
        desc: '查看现有字符',
        icon: 16
      },
      {
        title: '#替换幸运字符+(id)',
        desc: '用列表获取id',
        icon: 3
      },
    ]
  },
  {
    group: '群信息',
    list: [
      {
        icon: 2,
        title: '#群星级',
        desc: '查看群星级'
      },
      {
        title: '#群数据(7天)?',
        desc: '活跃数据等',
        icon: 7
      },
      {
        title: '#群发言榜单(7天)?',
        desc: '不加7天查看昨天的数据',
        icon: 16
      },
      {
        title: '#今天谁生日',
        desc: '今天可换为昨天或后天或日期',
        icon: 12
      }, {
        title: '#哪个叼毛是龙王',
        desc: '查看谁是龙王',
        icon: 6
      }, {
        title: '#今日打卡',
        desc: '查看今日打卡',
        icon: 5
      }
    ]
  },
  {
    group: '进群验证(更多设置请在config/groupverify.yaml进行设置)',
    list: [
      {
        title: '#开启验证',
        desc: '开启进群后验证',
        icon: 4
      },
      {
        title: '#关闭验证',
        desc: '关闭进群后验证',
        icon: 15
      },
      {
        title: '#重新验证 <@群员>',
        desc: '重新对某群员进行验证',
        icon: 1
      }, {
        title: '#绕过验证 <@群员>',
        desc: '绕过某群员的本次进群验证',
        icon: 3
      },
      {
        title: '#切换验证模式',
        desc: '更换答案匹配模式',
        icon: 2
      },
      {
        title: '#设置验证超时时间+(s)',
        desc: '进群不验证，多少秒后踢出',
        icon: 17
      }]
  },
  {
    group: '违禁词',
    list: [
      {
        title: '#新增(模糊|精确|正则)?<惩罚>?违禁词xxx',
        desc: '惩罚包括踢、禁、撤、踢撤、禁撤',
        icon: 7
      },
      {
        title: '#删除违禁词xxx',
        desc: '删除违禁词xxx',
        icon: 3
      },
      {
        title: '#查看违禁词xxx',
        desc: '查看违禁词xxx的详细说明',
        icon: 9
      },
      {
        title: '#违禁词列表',
        desc: '查看所有的违禁词信息',
        icon: 17
      },
      {
        title: '#设置违禁词禁言时间400',
        desc: '触发禁言违禁词的禁言时间，单位(s)',
        icon: 11
      }]
  },
  {
    group: '其它',
    list: [
      {
        title: '#开启/关闭加群通知',
        desc: '将加群申请发送至群，提醒管理员及时处理',
        icon: 2
      },
      {
        title: '#禁言<群号><@被禁言QQ><执行者QQ><时间(默认为分)>',
        desc: '可通过私聊机器人禁言某个群某个人',
        icon: 8
      },
      {
        title: '#解禁<群号><@被禁言QQ><执行者QQ>',
        desc: '可通过私聊机器人解禁某个群某个人',
        icon: 9
      },
      {
        title: '#全体禁言 <群号>',
        desc: '可通过私聊机器人全体禁言某个群',
        icon: 9
      },
      {
        title: '#踢<群号><@被踢QQ><执行者QQ>',
        desc: '可通过私聊机器人踢某个群某个人',
        icon: 19
      }]
  },
  {
    group: '机器人为群主时可用',
    list: [
      {
        title: '#设置管理 <@QQ>',
        desc: '增加管理',
        icon: 8
      },
      {
        title: '#取消管理 <@QQ> ',
        desc: '=-=',
        icon: 9
      },
      {
        title: '#申请头衔 <头衔>',
        desc: '群员自己设置',
        icon: 19
      },
      {
        title: '#修改头衔 <@QQ> <头衔>',
        desc: '主人给别人设置',
        icon: 10
      },
      {
        title: '#(增加|减少|查看)头衔屏蔽词',
        desc: '头衔屏蔽词',
        icon: 2
      },
      {
        title: '#切换头衔屏蔽词匹配模式',
        desc: '模糊匹配和精确匹配',
        icon: 13
      }]
  }
]

export const isSys = true
