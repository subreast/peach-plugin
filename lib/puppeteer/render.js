import fs from 'fs'
import { Config, Data, Version } from '../../components/index.js'
import puppeteer from '../../../../lib/puppeteer/puppeteer.js'

// const Path = process.cwd()
const Plugin_Name = 'peach-plugin'

export default new class {
  /**
     * @description: 渲染HTML
     * @param {String} path 文件路径
     * @param {Object} params 参数
     * @param {Object} cfg
     */
  async render(path, params, cfg) {
    let [app, tpl] = path.split('/')
    let { e } = cfg
    let layoutPath = process.cwd() + `/plugins/${Plugin_Name}/resources/common/layout/`
    let resPath = `../../../../../plugins/${Plugin_Name}/resources/`
    Data.createDir(`data/html/${Plugin_Name}/${app}/${tpl}`, 'root')
    let data = {
      ...params,
      _plugin: Plugin_Name,
      saveId: params.saveId || params.save_id || tpl,
      tplFile: `./plugins/${Plugin_Name}/resources/${app}/${tpl}.html`,
      _res_path: resPath,
      defaultLayout: layoutPath + 'default.html',
      elemLayout: layoutPath + 'elem.html',
      sys: {
        scale: this.scale(cfg.scale || 1),
        copyright: `Created By Yunzai<span class="version">${Version.yunzai}</span> & peach-plugin<span class="version">${Version.ver}</span>`
      },
      quality: 100
    }
    let base64 = await puppeteer.screenshot(`${Plugin_Name}/${app}/${tpl}`, data)
    let ret = true
    if (base64) {
      ret = await e.reply(base64)
    }
    return cfg.retMsgId ? ret : true
  }

  scale(pct = 1) {
    let scale = Config.getWhole.renderScale
    scale = Math.min(2, Math.max(0.5, scale / 100))
    pct = pct * scale
    return `style='transform:scale(${pct})'`
  }
}()
