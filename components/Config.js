import YAML from 'yaml'
import chokidar from 'chokidar'
import fs from 'node:fs'
import cfg from '../../../lib/config/config.js'
import YamlReader from './YamlReader.js'


const Path = process.cwd()
const Plugin_Name = 'peach-plugin'
const Plugin_Path = `${Path}/plugins/${Plugin_Name}`


class Config {
  constructor() {
    this.config = {}
    /** 监听文件 */
    this.watcher = { config: {} }

    this.initCfg()
  }


  /**
   * 初始化配置
   * ${path}${file}：/config/config/
   * ${pathDef}${file}：/config/default_config/
   */
  initCfg() {
    let path = `${Plugin_Path}/config/config/`
    let pathDef = `${Plugin_Path}/config/default_config/`
    const files = fs.readdirSync(pathDef).filter(file => file.endsWith('.yaml'))
    for (let file of files) {
      if (!fs.existsSync(`${path}${file}`)) {
        fs.copyFileSync(`${pathDef}${file}`, `${path}${file}`) // 从config/default_config/复制文件到/config/config/
      }
      this.watch(`${path}${file}`, file.replace('.yaml', ''), 'config')
    }
  }

  /**
   * 获取群配置
   * @param {*} groupId 群号，默认为空，则是全局配置
   * @returns 存在groupID的单独设置，返回全局配置和单独群设置
   */
  getGroup(groupId = '') {
    let config = this.getConfig('whole')
    let group = this.getConfig('group')
    if (group[groupId]) {
      return { ...config, ...group[groupId] }
    }
    return { ...config }
  }

  /**
   * 
   * 获取全部主人的QQ
   * @returns 从bot配置文件中返回
   */
  get masterQQ() {
    return cfg.masterQQ
  }

  /**  */
  /**
   * 获取全局设置，即'whole'文件中的配置
   */
  get getWhole() {
    return this.getDefOrConfig('whole')
  }

  /** 默认配置和用户配置 */
  /**
   * this
   * @param {*} name 要获取的配置文件名
   * @returns 文件中全部的key值
   */
  getDefOrConfig(name) {
    let config = this.getConfig(name)
    return { ...config }
  }

  /** 进群验证配置 */
  get groupverify() {
    return this.getDefOrConfig('groupverify')
  }

  /** 头衔屏蔽词 */
  get groupTitle() {
    return this.getDefOrConfig('groupTitle')
  }

  /** 加群通知 */
  get groupAdd() {
    return this.getDefOrConfig('groupAdd')
  }

  /** 用户配置 */
  getConfig(name) {
    return this.getYaml('config', name)
  }

  /**
   * 获取配置yaml
   * @param type 用户配置-config
   * @param name 名称
   */
  getYaml(type, name) {
    let file = `${Plugin_Path}/config/${type}/${name}.yaml`
    let key = `${type}.${name}`

    if (this.config[key]) return this.config[key]

    this.config[key] = YAML.parse(
      fs.readFileSync(file, 'utf8')
    )

    this.watch(file, name, type)

    return this.config[key]
  }

  /** 监听配置文件 */
  watch(file, name, type = 'config') {
    let key = `${type}.${name}`

    if (this.watcher[key]) return

    const watcher = chokidar.watch(file)
    watcher.on('change', path => {
      delete this.config[key]
      if (typeof Bot == 'undefined') return
      logger.mark(`[修改配置文件][${type}][${name}]`)
      if (this[`change_${name}`]) {
        this[`change_${name}`]()
      }
    })

    this.watcher[key] = watcher
  }

  /**
   * @description: 修改设置
   * @param {String} name 文件名
   * @param {String} key 修改的key值
   * @param {String|Number} value 修改的value值
   * @param {'config'|'default_config'} type 配置文件或默认
   */
  modify(name, key, value, type = 'config') {
    let path = `${Plugin_Path}/config/${type}/${name}.yaml`
    new YamlReader(path).set(key, value)
    delete this.config[`${type}.${name}`]
  }

  /**
   * @description: 群单独设置
   * @param {String|Number} groupId 群号
   * @param {String} key 设置项
   * @param {unknown} value
   */
  aloneModify(groupId, key, value, isDel) {
    let path = `${Plugin_Path}/config/config/group.yaml`
    let yaml = new YamlReader(path)
    let groupCfg = yaml.jsonData[groupId] ?? {}
    isDel ? delete groupCfg[key] : groupCfg[key] = value
    yaml.set(groupId, groupCfg)
    delete this.config['config.group']
  }

  /**
   * @description: 修改配置数组
   * @param {String} name 文件名
   * @param {String|Number} key key值
   * @param {String|Number} value value
   * @param {'add'|'del'} category 类别 add or del
   * @param {'config'|'default_config'} type 配置文件或默认
   */
  modifyarr(name, key, value, category = 'add', type = 'config') {
    let path = `${Plugin_Path}/config/${type}/${name}.yaml`
    let yaml = new YamlReader(path)
    if (category == 'add') {
      yaml.addIn(key, value)
    } else {
      let index = yaml.jsonData[key].indexOf(value)
      yaml.delete(`${key}.${index}`)
    }
  }

}
export default new Config()
