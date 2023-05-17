import Ver from './components/Version.js'
import chalk from 'chalk'
import Data from './components/Data.js'
import fs from 'fs'

const Plugin_Name ="peach-plugin"

logger.info(chalk.rgb(253, 235, 255)('-------ヾ(￣▽￣)o-------'))
logger.info(chalk.rgb(134, 142, 204)(`桃子插件${Ver.ver}初始化~`))
logger.info(chalk.rgb(253, 235, 255)('-------------------------'))

if (!global.segment) {
  try {
    global.segment = (await import('oicq')).segment
  } catch (err) {
    global.segment = (await import('icqq')).segment
  }
}

// 加载监听事件
const eventsPath = `./plugins/${Plugin_Name}/apps/notice`
const notice = fs.readdirSync(eventsPath)
  .filter(file => file.endsWith('.js'))
for (const File of notice) {
  try {
    logger.debug(`[${Plugin_Name}] 加载监听事件：${File}`)
    await import(`./apps/notice/${File}`)
  } catch (e) {
    logger.error(`[${Plugin_Name}] 监听事件错误：${File}`)
    logger.error(e)
  }
}

const appsPath = `./plugins/${Plugin_Name}/apps`
const jsFiles = Data.readDirRecursive(appsPath, 'js', 'notice')

let ret = jsFiles.map(file => {
  return import(`./apps/${file}`)
})

ret = await Promise.allSettled(ret)

let apps = {}
for (let i in jsFiles) {
  let name = jsFiles[i].replace('.js', '')

  if (ret[i].status != 'fulfilled') {
    logger.error(`载入插件错误：${logger.red(name)}`)
    logger.error(ret[i].reason)
    continue
  }
  apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
}

export { apps }