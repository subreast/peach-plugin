/*
* 此配置文件为系统使用，请勿修改，否则可能无法正常使用
*
* 如需自定义配置请复制修改上一级help_default.js
*
* */

export const helpCfg = {
  title: '桃子帮助',
  subTitle: 'Yunzai-Bot & peach-plugin',
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
    group: 'Bot相关',
    auth: 'master',
    list: [
      {
        icon: 1,
        title: '#发好友[空格]<QQ>[空格]<消息>',
        desc: '不用登陆Bot的QQ，就可以给好友发送消息'
      },
      {
        icon: 2,
        title: '#发群聊[空格]<群号>[空格]<消息>',
        desc: '不用登陆Bot的QQ，就可以给群聊发送消息'
      },
      {
        icon: 3,
        title: '#修改头像',
        desc: '不用登陆Bot的QQ，就可以修改QQ头像'
      },
      {
        icon: 4,
        title: '#修改状态[空格]<状态> ',
        desc: '不用登陆Bot的QQ，就可以修改在线状态'
      },
      {
        icon: 5,
        title: '#修改昵称[空格]<昵称> ',
        desc: '不用登陆Bot的QQ，就可以修改QQ昵称'
      },
      {
        icon: 6,
        title: '#修改签名[空格]<签名> ',
        desc: '不用登陆Bot的QQ，就可以修改QQ签名'
      },
      {
        title: '#修改性别[空格]<性别> ',
        desc: '不用登陆Bot的QQ，就可以修改性别',
        icon: 7
      },
      {
        title: '#修改群名片[空格]<名片> ',
        desc: '不用登陆Bot的QQ，就可以修改群内的昵称',
        icon: 8
      },
      {
        title: '#修改群昵称[空格]<昵称>',
        desc: '修改群聊名字，Bot须为管理员或群主',
        icon: 9
      },
      {
        title: '#修改群头像',
        desc: '修改群聊头像，Bot须为管理员或群主',
        icon: 10
      },
      {
        title: '#删除好友[空格]<QQ> ',
        desc: '不用登陆Bot的QQ，就可以删除QQ好友',
        icon: 11
      },
      {
        title: '#退群[空格]<群号> ',
        desc: '不用登陆Bot的QQ，就可以退群',
        icon: 12
      },
      {
        title: '#获取群列表',
        desc: '不用登陆Bot的QQ，就可以获取Bot的所有群',
        icon: 13
      },
      {
        title: '#获取好友列表',
        desc: '不用登陆Bot的QQ，就可以获取Bot的所有好友',
        icon: 14
      },
      {
        title: '#取说说列表[空格]<页数>(可省略) ',
        desc: '不用登陆Bot的QQ，就可以获取Bot的说说列表',
        icon: 15
      },
      {
        title: '#发说说[空格]<内容> ',
        desc: '不用登陆Bot的QQ，就可以获取Bot的说说列表',
        icon: 16
      },
      {
        title: '#删除说说[空格]<序号>',
        desc: '用命令:[#获取说说列表]获取序号',
        icon: 17
      },
      {
        title: '#清空说说',
        desc: '清空所有发表的说说',
        icon: 18
      },
      {
        title: '#清空留言',
        desc: '一清空所有留言',
        icon: 19
      }, {
        title: '#开启|关闭戳一戳',
        desc: '开启或关闭Bot戳一戳功能',
        icon: 5
      }, {
        title: '#同意|拒绝全部好友申请',
        desc: '同意或拒绝所有的好友申请',
        icon: 6
      }, {
        title: '#查看好友申请',
        desc: '查看所有的好友申请',
        icon: 1
      },
      {
        title: '同意|拒绝好友申请[空格]<QQ>',
        desc: '同意或拒绝好友申请',
        icon: 18
      },
      {
        title: '#查看群邀请',
        desc: '查看所有的群邀请',
        icon: 3
      },
      {
        title: '#同意|拒绝全部群邀请',
        desc: '同意或拒绝全部群邀请',
        icon: 15
      },
      {
        title: '#同意|拒绝群邀请[空格]<群号>',
        desc: '单独同意或拒绝某个群',
        icon: 7
      },
      {
        title: '#查看全部请求',
        desc: '查看所有的好友申请和群邀请',
        icon: 20
      },
      {
        title: '#(开启|关闭)好友添加',
        desc: '是否开启好友添加',
        icon: 7
      },
      {
        title: '#更改好友申请方式[0123]',
        desc: '参数0为帮助',
        icon: 12
      }
    ]
  },
  {
    group: '更多功能',
    auth: 'master',
    list: [
      {
        icon: 8,
        title: '#通知设置',
        desc: '查看通知相关的设置'
      },
      {
        icon: 3,
        title: '#群管帮助',
        desc: '查看群操作相关功能的帮助'
      }
    ]
  },
  {
    group: '设置，版本相关',
    auth: 'master',
    list: [
      {
        icon: 15,
        title: '#桃子版本',
        desc: '查看所有的版本详细'
      },
      {
        icon: 1,
        title: '#桃子(强制)更新',
        desc: '更新插件到最新版本'
      },
      {
        icon: 12,
        title: '#桃子更新日志',
        desc: '查看插件更新日志'
      },
      {
        icon: 8,
        title: '#桃子状态(pro)?',
        desc: '查看系统状态'
      }
    ]
  }
]

export const isSys = true
