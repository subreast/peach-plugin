import plugin from '../../../lib/plugins/plugin.js'
import { update } from '../../other/update.js'
import { Version } from '../components/index.js'
import { puppeteer } from '../lib/index.js'

const Plugin_Name = "peach-plugin"


export class _Version extends plugin {
  constructor() {
    super({
      name: '[peach-plugin]版本信息',
      event: 'message',
      priority: 400,
      rule: [
        {
          reg: '^#?桃子(插件)?版本$',
          fnc: 'version'
        },
        {
          reg: '^#?桃子(插件)?更新日志$',
          fnc: 'updateLog'
        }
      ]
    })
    this.key = 'restart'
  }

  async version() {
    return versionInfo(this.e)
  }

  async updateLog() {
    // eslint-disable-next-line new-cap
    let Update_Plugin = new update()
    Update_Plugin.e = this.e
    Update_Plugin.reply = this.reply

    if (Update_Plugin.getPlugin(Plugin_Name)) {
      this.e.reply(await Update_Plugin.getLog(Plugin_Name))
    }
    return true
  }
}

async function versionInfo(e) {
  return await puppeteer.render(
    'version/version-info',
    {
      currentVersion: Version.ver,
      changelogs: Version.logs,
      elem: 'cryo'
    },
    { e, scale: 1.4 }
  )
}
