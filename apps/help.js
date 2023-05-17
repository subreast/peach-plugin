import plugin from '../../../lib/plugins/plugin.js'
import fs from 'fs'
import _ from 'lodash'
import { Data } from '../components/index.js'
import { puppeteer } from '../lib/index.js'
import notice_setting from './noticeAdmin.js'

const helpType = {
  群管: 'gpAdmin',
}

const plugin_name = "peach-plugin"
const helpBackground = `./plugins/${plugin_name}/resources/help/imgs/background/`


const helpReg = new RegExp(
  `^#?(桃子)?(${Object.keys(helpType).join('|')})?(帮助|菜单|功能)$`
)
export class _Help extends plugin {
  constructor() {
    super({
      name: '[peach-plugin]插件帮助',
      event: 'message',
      priority: 2000,
      rule: [
        {
          reg: helpReg,
          fnc: 'message'
        },
        {
          reg: '^#?通知(设置|帮助)$',
          fnc: 'Settings',
          permission: 'master'
        }
      ]
    })
  }

  async message() {
    return await help(this.e)
  }

  async Settings(e) {
    notice_setting.index_Settings(e)
  }

}

async function help(e) {
  let custom = {}
  const special = e.msg.match(helpReg)[2]

  let diyCfg, sysCfg
  if (special) {
    let gpAdminHelp = await Data.importCfg(helpType[special])
    diyCfg = gpAdminHelp.diyCfg
    sysCfg = gpAdminHelp.sysCfg
  } else {
    let indexHelp = await Data.importCfg('help')
    diyCfg = indexHelp.diyCfg
    sysCfg = indexHelp.sysCfg
  }

  let helpConfig = _.defaults(diyCfg.helpCfg || {}, custom.helpCfg, sysCfg.helpCfg)
  let helpList = diyCfg.helpList || custom.helpList || sysCfg.helpList
  let helpGroup = []

  _.forEach(helpList, (group) => {
    if (group.auth && group.auth === 'master' && !e.isMaster) {
      return true
    }

    _.forEach(group.list, (help) => {
      let icon = help.icon * 1
      if (!icon) {
        help.css = 'display:none'
      } else {
        let x = (icon - 1) % 10
        let y = (icon - x - 1) / 10
        help.css = `background-position:-${x * 50}px -${y * 50}px`
      }
    })

    helpGroup.push(group)
  })
  return await puppeteer.render('help/index', {
    helpCfg: helpConfig,
    helpGroup,
    background: await rodom(),
    colCount: 3,
    element: 'default'
  },{
      e,
      scale: 1.6
    })
}
// 随机底图
const rodom = async function () {
  let image = fs.readdirSync(helpBackground)
  let list_img = []
  for (let val of image) {
    list_img.push(val)
  }
  let imgs = list_img.length == 1 ? list_img[0] : list_img[_.random(0, list_img.length - 1)]
  return imgs
}
