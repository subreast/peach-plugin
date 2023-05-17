import _ from 'lodash'
import fs from 'fs'
import path from 'path'

const _path = process.cwd()
const plugin = 'peach-plugin'

/**
 * 它接受一个名为 "root" 的参数，如果没有传入参数，则默认为空字符串。
 * 函数的主要功能是根据传入的 "root" 参数值来确定文件路径。
 * @param {*} root 如果 "root" 的值为 "root" 或 "yunzai"，则将路径设置为一个名为 "_path" 的变量值加上一个斜杠。
 * 如果 "root" 的值为空，则将路径设置为一个名为 "_path" 的变量值加上一个名为 "plugin" 的变量值和一个斜杠。
 * @returns 确定好的文件路径。
 */
const getRoot = (root = '') => {
  if (root === 'root' || root === 'yunzai') {
    root = `${_path}/`
  } else if (!root) {
    root = `${_path}/plugins/${plugin}/`
  }
  return root
}

let Data = {

  /**
   * 根据指定的path依次检查与创建目录
   * @param {*} path path参数表示要创建的文件夹路径
   * @param {*} root root参数表示根目录，如果不指定，则默认为当前工作目录。
   * @param {*} includeFile includeFile参数表示是否包含文件。如果为false，则只创建文件夹，如果为true，什么都不做
   */
  createDir(path = '', root = '', includeFile = false) {
    root = getRoot(root)
    let pathList = path.split('/')
    let nowPath = root
    pathList.forEach((name, idx) => {
      name = name.trim()
      if (!includeFile && idx <= pathList.length - 1) {
        nowPath += name + '/'
        if (name) {
          if (!fs.existsSync(nowPath)) {
            fs.mkdirSync(nowPath)
          }
        }
      }
    })
  },

  /** 读取json */
  readJSON(file = '', root = '') {
    root = getRoot(root)
    if (fs.existsSync(`${root}/${file}`)) {
      try {
        return JSON.parse(fs.readFileSync(`${root}/${file}`, 'utf8'))
      } catch (e) {
        console.log(e)
      }
    }
    return {}
  },

  /**
   * 写JSON
   * @param {.JSON} file 文件名
   * @param {*} data 写入的数据
   * @param {*} root 路径
   * @param {*} space 
   * @returns 
   */
  writeJSON(file, data, root = '', space = '\t') {
    // 检查并创建目录
    Data.createDir(file, root, true)
    root = getRoot(root)
    try {
      fs.writeFileSync(`${root}/${file}`, JSON.stringify(data, null, space))
      return true
    } catch (err) {
      logger.error(err)
      return false
    }
  },

  async getCacheJSON(key) {
    try {
      let txt = await redis.get(key)
      if (txt) {
        return JSON.parse(txt)
      }
    } catch (e) {
      console.log(e)
    }
    return {}
  },

  async setCacheJSON(key, data, EX = 3600 * 24 * 90) {
    await redis.set(key, JSON.stringify(data), { EX })
  },

  async importModule(file, root = '') {
    root = getRoot(root)
    if (!/\.js$/.test(file)) {
      file = file + '.js'
    }
    if (fs.existsSync(`${root}/${file}`)) {
      try {
        let data = await import(`file://${root}/${file}?t=${new Date() * 1}`)
        return data || {}
      } catch (e) {
        console.log(e)
      }
    }
    return {}
  },

  async importDefault(file, root) {
    let ret = await Data.importModule(file, root)
    return ret.default || {}
  },

  async import(name) {
    return await Data.importModule(`components/optional-lib/${name}.js`)
  },

  async importCfg(key) {
    let sysCfg = await Data.importModule(`config/system/${key}_system.js`) //读取系统的数据
    let diyCfg = await Data.importModule(`config/${key}.js`)  //读取自定义的数据
    if (diyCfg.isSys) {
      console.error(`peach-plugin: config/${key}.js无效，已忽略`)
      console.error(`如需自定义配置请复制config/${key}_default.js并修改文件名为${key}.js`)
      diyCfg = {}
    }
    return {
      sysCfg,
      diyCfg
    }
  },

  /*
  * 返回一个从 target 中选中的属性的对象
  *
  * keyList : 获取字段列表，逗号分割字符串
  *   key1, key2, toKey1:fromKey1, toKey2:fromObj.key
  *
  * defaultData: 当某个字段为空时会选取defaultData的对应内容
  * toKeyPrefix：返回数据的字段前缀，默认为空。defaultData中的键值无需包含toKeyPrefix
  *
  * */
  getData(target, keyList = '', cfg = {}) {
    target = target || {}
    let defaultData = cfg.defaultData || {}
    let ret = {}
    // 分割逗号
    if (typeof (keyList) === 'string') {
      keyList = keyList.split(',')
    }

    _.forEach(keyList, (keyCfg) => {
      // 处理通过:指定 toKey & fromKey
      let _keyCfg = keyCfg.split(':')
      let keyTo = _keyCfg[0].trim()
      let keyFrom = (_keyCfg[1] || _keyCfg[0]).trim()
      let keyRet = keyTo
      if (cfg.lowerFirstKey) {
        keyRet = _.lowerFirst(keyRet)
      }
      if (cfg.keyPrefix) {
        keyRet = cfg.keyPrefix + keyRet
      }
      // 通过Data.getVal获取数据
      ret[keyRet] = Data.getVal(target, keyFrom, defaultData[keyTo], cfg)
    })
    return ret
  },

  getVal(target, keyFrom, defaultValue) {
    return _.get(target, keyFrom, defaultValue)
  },

  // 异步池，聚合请求
  async asyncPool(poolLimit, array, iteratorFn) {
    const ret = [] // 存储所有的异步任务
    const executing = [] // 存储正在执行的异步任务
    for (const item of array) {
      // 调用iteratorFn函数创建异步任务
      const p = Promise.resolve().then(() => iteratorFn(item, array))
      // 保存新的异步任务
      ret.push(p)

      // 当poolLimit值小于或等于总任务个数时，进行并发控制
      if (poolLimit <= array.length) {
        // 当任务完成后，从正在执行的任务数组中移除已完成的任务
        const e = p.then(() => executing.splice(executing.indexOf(e), 1))
        executing.push(e) // 保存正在执行的异步任务
        if (executing.length >= poolLimit) {
          // 等待较快的任务执行完成
          await Promise.race(executing)
        }
      }
    }
    return Promise.all(ret)
  },

  // sleep
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  },

  // 获取默认值
  def() {
    for (let idx in arguments) {
      if (!_.isUndefined(arguments[idx])) {
        return arguments[idx]
      }
    }
  },

  // 循环字符串回调
  eachStr: (arr, fn) => {
    if (_.isString(arr)) {
      arr = arr.replace(/\s*(;|；|、|，)\s*/, ',')
      arr = arr.split(',')
    } else if (_.isNumber(arr)) {
      arr = [arr.toString()]
    }
    _.forEach(arr, (str, idx) => {
      if (!_.isUndefined(str)) {
        fn(str.trim ? str.trim() : str, idx)
      }
    })
  },

  regRet(reg, txt, idx) {
    if (reg && txt) {
      let ret = reg.exec(txt)
      if (ret && ret[idx]) {
        return ret[idx]
      }
    }
    return false
  },
  /** 读取文件夹和子文件夹指定后缀文件名 */
  readDirRecursive(directory, extension, excludeDir) {
    let files = fs.readdirSync(directory)

    let jsFiles = files.filter(file => path.extname(file) === `.${extension}`)

    files.filter(file => fs.statSync(path.join(directory, file)).isDirectory())
      .forEach(subdirectory => {
        if (subdirectory === excludeDir) {
          return
        }

        const subdirectoryPath = path.join(directory, subdirectory)
        jsFiles.push(...Data.readDirRecursive(subdirectoryPath, extension, excludeDir)
          .map(fileName => path.join(subdirectory, fileName)))
      })

    return jsFiles
  }
}

export default Data