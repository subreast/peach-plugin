import os from 'os'
import lodash from 'lodash'
import fs from 'fs'
import { common } from '../lib/index.js'
import { Config, Data } from '../components/index.js'

export default new class OSUtils {
  constructor() {
    this.si = null
    // 是否可以获取gpu
    this.isGPU = false
    // 网络
    this._network = null
    // 读写速率
    this._fsStats = null

    this.chartData = {
      network: {
        // 上行
        upload: [],
        // 下行
        download: []
      },
      fsStats: {
        // 读
        readSpeed: [],
        // 写
        writeSpeed: []
      },
      // cpu
      cpu: [],
      // 内存
      ram: [],
      // 主题
      echarts_theme: Data.readJSON('resources/state/theme_westeros.json')
    }
    this.init()
  }

  set network(value) {
    if (lodash.isNumber(value[0]?.tx_sec) && lodash.isNumber(value[0]?.rx_sec)) {
      this._network = value
      this.addData(this.chartData.network.upload, [Date.now(), value[0].tx_sec])
      this.addData(this.chartData.network.download, [Date.now(), value[0].rx_sec])
    }
  }

  get network() {
    return this._network
  }

  set fsStats(value) {
    if (lodash.isNumber(value?.wx_sec) && lodash.isNumber(value?.rx_sec)) {
      this._fsStats = value
      this.addData(this.chartData.fsStats.writeSpeed, [Date.now(), value.wx_sec])
      this.addData(this.chartData.fsStats.readSpeed, [Date.now(), value.rx_sec])
    }
  }

  get fsStats() {
    return this._fsStats
  }

  async initDependence() {
    try {
      this.si = await import('systeminformation')
      return this.si
    } catch (error) {
      if (error.stack?.includes('Cannot find package')) {
        logger.warn(`peach-plugin 缺少依赖将无法使用 ${logger.yellow('桃子状态')}`)
        logger.warn(`如需使用请运行：${logger.red('pnpm add systeminformation -w')}`)
        logger.warn('---------------------------')
        logger.debug(decodeURI(error.stack))
      } else {
        logger.error(`peach-plugin载入依赖错误：${logger.red('systeminformation')}`)
        logger.error(decodeURI(error.stack))
      }
    }
  }

  async init() {
    if (!await this.initDependence()) return
    // 初始化GPU获取
    if ((await this.si.graphics()).controllers.find(item => item.memoryUsed && item.memoryFree && item.utilizationGpu)) {
      this.isGPU = true
    }
    // 给有问题的用户关闭定时器
    if (!Config.getWhole.statusTask) return
    // 网速
    const networkTimer = setInterval(async () => {
      this.network = await this.fetchDataWithRetry(this.si.networkStats, networkTimer)
    }, 5000)
    // 磁盘写入速度
    const fsStatsTimer = setInterval(async () => {
      this.fsStats = await this.fetchDataWithRetry(this.si.fsStats, fsStatsTimer)
    }, 5000)
    const memTimer = setInterval(async () => {
      let { active } = await this.fetchDataWithRetry(
        this.si.mem, memTimer
      )
      if (lodash.isNumber(active)) {
        this.addData(this.chartData.ram, [Date.now(), active])
      }
    }, 5000)
    const cpuTimer = setInterval(async () => {
      let { currentLoad } = await this.fetchDataWithRetry(
        this.si.currentLoad, cpuTimer
      )
      if (lodash.isNumber(currentLoad)) {
        this.addData(this.chartData.cpu, [Date.now(), currentLoad])
      }
    }, 5000)
  }

  /**
   * 向数组中添加数据，如果数组长度超过允许的最大值，则删除最早添加的数据
   *
   * @param {Array} arr - 要添加数据的数组
   * @param {*} data - 要添加的新数据
   * @param {number} [maxLen=50] - 数组允许的最大长度，默认值为50
   * @returns {void}
   */
  addData(arr, data, maxLen = 50) {
    if (data === null || data === undefined) return
    // 如果数组长度超过允许的最大值，删除第一个元素
    if (arr.length >= maxLen) {
      lodash.pullAt(arr, 0)
    }
    // 添加新数据
    arr.push(data)
  }

  /**
  * 重试获取数据，直到成功或达到最大重试次数。
  * @param {Function} fetchFunc 获取数据的函数，返回一个Promise对象。
  * @param {Number} [timerId] 定时器的id，用于在获取数据失败时停止定时器
  * @param {Number} [maxRetryCount=3] 最大重试次数。
  * @param {Number} [retryInterval=1000] 两次重试之间的等待时间，单位为毫秒。。
  * @return {Promise} 获取到的数据。如果达到最大重试次数且获取失败，则返回null。
  */
  async fetchDataWithRetry(fetchFunc, timerId, maxRetryCount = 3, retryInterval = 1000) {
    let retryCount = 0
    let data = null
    while (retryCount <= maxRetryCount) {
      data = await fetchFunc()
      if (!lodash.isEmpty(data)) {
        break
      }
      retryCount++
      if (retryCount > maxRetryCount && timerId) {
        logger.debug(`获取${fetchFunc.name}数据失败，停止定时器`)
        clearInterval(timerId)
        break
      }
      await new Promise(resolve => setTimeout(resolve, retryInterval))
    }
    return data
  }

  /**
  * 将文件大小从字节转化为可读性更好的格式，例如B、KB、MB、GB、TB。
  *
  * @param {number} size - 带转化的字节数。
  * @param {boolean} [isByte=true] - 如果为 true，则最终的文件大小显示保留 B 的后缀.
  * @param {boolean} [isSuffix=true] - 如果为 true，则在所得到的大小后面加上 kb、mb、gb、tb 等后缀.
  * @returns {string} 文件大小格式转换后的字符串.
  */
  getFileSize(size, isByte = true, isSuffix = true) { // 把字节转换成正常文件大小
    if (size == null || size == undefined) return 0
    let num = 1024.00 // byte
    if (isByte && size < num) {
      return size.toFixed(2) + 'B'
    }
    if (size < Math.pow(num, 2)) {
      return (size / num).toFixed(2) + `K${isSuffix ? 'b' : ''}`
    } // kb
    if (size < Math.pow(num, 3)) {
      return (size / Math.pow(num, 2)).toFixed(2) + `M${isSuffix ? 'b' : ''}`
    } // M
    if (size < Math.pow(num, 4)) {
      return (size / Math.pow(num, 3)).toFixed(2) + 'G'
    } // G
    return (size / Math.pow(num, 4)).toFixed(2) + 'T' // T
  }

  /**
    * @description: 圆形进度条渲染
    * @param {Number} res 百分比小数
    * @return {*} css样式
  */
  Circle(res) {
    let num = (res * 360).toFixed(0)
    let color = '#90ee90'
    if (res >= 0.9) {
      color = '#d73403'
    } else if (res >= 0.8) {
      color = '#ffa500'
    }
    let leftCircle = `style="transform:rotate(-180deg);background:${color};"`
    let rightCircle = `style="transform:rotate(360deg);background:${color};"`
    if (num > 180) {
      leftCircle = `style="transform:rotate(${num}deg);background:${color};"`
    } else {
      rightCircle = `style="transform:rotate(-${180 - num}deg);background:${color};"`
    }
    return { leftCircle, rightCircle }
  }

  /** 获取nodejs内存情况 */
  getNodeInfo() {
    let memory = process.memoryUsage()
    // 总共
    let rss = this.getFileSize(memory.rss)
    // 堆
    let heapTotal = this.getFileSize(memory.heapTotal)
    // 栈
    let heapUsed = this.getFileSize(memory.heapUsed)
    // 占用率
    let occupy = (memory.rss / (os.totalmem() - os.freemem())).toFixed(2)
    return {
      ...this.Circle(occupy),
      inner: parseInt(occupy * 100) + '%',
      title: 'Node',
      info: [
        `总 ${rss}`,
        `堆 ${heapTotal}`,
        `栈 ${heapUsed}`
      ]
    }
  }

  /** 获取当前内存占用 */
  getMemUsage() {
    // 内存使用率
    let MemUsage = (1 - os.freemem() / os.totalmem()).toFixed(2)
    // 空闲内存
    let freemem = this.getFileSize(os.freemem())
    // 总共内存
    let totalmem = this.getFileSize(os.totalmem())
    // 使用内存
    let Usingmemory = this.getFileSize((os.totalmem() - os.freemem()))

    return {
      ...this.Circle(MemUsage),
      inner: parseInt(MemUsage * 100) + '%',
      title: 'RAM',
      info: [
        `总共 ${totalmem}`,
        `已用 ${Usingmemory}`,
        `空闲 ${freemem}`
      ]
    }
  }

  /** 获取CPU占用 */
  async getCpuInfo(arch) {
    // cpu使用率
    let cpu_info = (await this.si.currentLoad())?.currentLoad
    if (cpu_info == null || cpu_info == undefined) return false
    // 核心
    let hx = os.cpus()
    // cpu制造者
    let cpumodel = hx[0]?.model.slice(0, hx[0]?.model.indexOf(' ')) || ''
    // 最大MHZ
    let maxspeed = await this.si.cpuCurrentSpeed()

    return {
      ...this.Circle(cpu_info / 100),
      inner: `${parseInt(cpu_info)}%`,
      title: 'CPU',
      info: [
        `${cpumodel} ${hx.length}核 ${arch}`,
        `平均${maxspeed.avg}GHz`,
        `最大${maxspeed.max}GHz`
      ]

    }
  }

  /** 获取GPU占用 */
  async getGPU() {
    if (!this.isGPU) return false
    try {
      let graphics = (await this.si.graphics()).controllers.find(item => item.memoryUsed && item.memoryFree && item.utilizationGpu)
      let { vendor, temperatureGpu, utilizationGpu, memoryTotal, memoryUsed, powerDraw } = graphics
      temperatureGpu = temperatureGpu ? temperatureGpu + '℃' : ''
      powerDraw = powerDraw ? powerDraw + 'W' : ''
      return {
        ...this.Circle(utilizationGpu / 100),
        inner: parseInt(utilizationGpu) + '%',
        title: 'GPU',
        info: [
          `${vendor} ${temperatureGpu} ${powerDraw}`,
          `总共 ${(memoryTotal / 1024).toFixed(2)}G`,
          `已用 ${(memoryUsed / 1024).toFixed(2)}G`
        ]
      }
    } catch (e) {
      console.log(e)
      return false
    }
  }

  /**
   * @description: 获取硬盘
   * @return {*}
   */
  async getfsSize() {
    // 去重
    let HardDisk = lodash.uniqWith(await this.si.fsSize(),
      (a, b) => a.used === b.used && a.size === b.size && a.use === b.use && a.available === b.available)
    // 过滤
    HardDisk = HardDisk.filter(item => item.size && item.used && item.available && item.use)
    // 为空返回false
    if (lodash.isEmpty(HardDisk)) return false
    // 数值转换
    return HardDisk.map(item => {
      item.used = this.getFileSize(item.used)
      item.size = this.getFileSize(item.size)
      item.use = Math.ceil(item.use)
      item.color = '#90ee90'
      if (item.use >= 90) {
        item.color = '#d73403'
      } else if (item.use >= 70) {
        item.color = '#ffa500'
      }
      return item
    })
  }

  /** 获取FastFetch */
  async getFastFetch(e) {
    if (process.platform == 'win32' && !/pro/.test(e.msg)) return ''
    let ret = await common.execSync('bash plugins/peach-plugin/resources/state/state.sh')
    if (ret.error) {
      e.reply(`❎ 请检查是否使用git bash启动Yunzai-bot\n错误信息：${ret.stderr}`)
      return ''
    }
    return ret.stdout.trim()
  }

  // 获取读取速率
  get DiskSpeed() {
    if (!this.fsStats || this.fsStats.rx_sec == null || this.fsStats.wx_sec == null) return false
    return {
      rx_sec: this.getFileSize(this.fsStats.rx_sec, false, false),
      wx_sec: this.getFileSize(this.fsStats.wx_sec, false, false)
    }
  }

  /**
   * @description: 获取网速
   * @return {*}
   */
  get getnetwork() {
    let network = {}
    try { network = lodash.cloneDeep(this.network)[0] } catch { return false }
    if (network.rx_sec == null || network.tx_sec == null) return false
    network.rx_sec = this.getFileSize(network.rx_sec, false, false)
    network.tx_sec = this.getFileSize(network.tx_sec, false, false)
    return network
  }

  /**
 * @description: 取插件包
 * @return {*} 插件包数量
 */
  get numberOfPlugIns() {
    let str = './plugins'
    let arr = fs.readdirSync(str)
    let plugin = []
    arr.forEach((val) => {
      let ph = fs.statSync(str + '/' + val)
      if (ph.isDirectory()) {
        plugin.push(val)
      }
    })
    let del = ['example', 'genshin', 'other', 'system', 'bin']
    plugin = plugin.filter(item => !del.includes(item))

    return {
      plugins: plugin?.length || 0,
      js: fs.readdirSync('./plugins/example')?.filter(item => item.includes('.js'))?.length || 0
    }
  }
}()
