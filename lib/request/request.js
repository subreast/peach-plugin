import fetch from 'node-fetch'
import { Config } from '../../components/index.js'
import { Agent } from 'https'
import { HttpsProxyAgent } from './httpsProxyAgentMod.js'
import _ from 'lodash'



const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36'

class HTTPResponseError extends Error {
  constructor(response) {
    super(`HTTP Error Response: ${response.status} ${response.statusText}`)
    this.response = response
  }
}

const checkStatus = response => {
  if (response.ok) {
    // response.status >= 200 && response.status < 300
    return response
  } else {
    throw new HTTPResponseError(response)
  }
}

export const qs = (obj) => {
  let res = ''
  for (const [k, v] of Object.entries(obj)) { res += `${k}=${encodeURIComponent(v)}&` }
  return res.slice(0, res.length - 1)
}

export default new class {
  /**
   * 发送HTTP GET请求并返回响应
   * @async
   * @function
   * @param {string} url - 请求的URL
   * @param {Object} [options={}] - 请求的配置项
   * @param {Object} [options.params] - 请求的参数
   * @param {Object} [options.headers] - 请求的HTTP头部
   * @param {boolean} [options.closeCheckStatus=false] - 是否关闭状态检查
   * @param {'buffer'|'json'|'text'|'arrayBuffer'|'formData'|'blob'}[options.statusCode] - 期望的返回数据，如果设置了该值，则返回响应数据的特定的方法（如json()、text()等）
   * @returns {Promise<Response|*>} - HTTP响应或响应数据
   * @throws {Error} - 如果请求失败，则抛出错误
   */
  async get(url, options = {}) {
    // 处理参数
    if (options.params) {
      url = url + '?' + qs(options.params)
    }
    logger.debug(`[peach-Plugin] GET请求：${decodeURI(url)}`)
    options.headers = {
      'User-Agent': CHROME_UA,
      ...options.headers
    }
    if (!options.agent) options.agent = this.getAgent()
    try {
      let res = await fetch(url, options)
      if (!options.closeCheckStatus) {
        res = checkStatus(res)
      }
      if (options.statusCode) {
        return res[options.statusCode]()
      }
      return res
    } catch (err) {
      logger.error(err)
      throw Error(
        `Request Get Error，${err.message.match(/reason:(.*)/i) || err.message}`
      )
    }
  }

  /**
   * 发送HTTP POST请求并返回响应
   * @async
   * @function
   * @param {string} url - 请求的URL
   * @param {import('node-fetch').RequestInit} [options={}] - 请求的配置项
   * @param {Object} [options.params] - 请求的参数
   * @param {Object} [options.headers] - 请求的HTTP头部
   * @param {Object} [options.data] - 请求的数据
   * @param {boolean} [options.closeCheckStatus=false] - 是否关闭状态检查
   * @param {'buffer'|'json'|'text'|'arrayBuffer'|'formData'|'blob'} [options.statusCode] - 期望的返回数据，如果设置了该值，则返回响应数据的特定的方法（如json()、text()等）
   * @returns {Promise<Response|*>} - HTTP响应或响应数据
   * @throws {Error} - 如果请求失败，则抛出错误
   */
  async post(url, options = {}) {
    options.method = 'POST'
    options.headers = {
      'User-Agent': CHROME_UA,
      'Content-Type': 'application/json',
      ...options.headers
    }
    if (options.params) {
      url = url + '?' + qs(options.params)
    }
    logger.debug(`[peach-Plugin] POST请求：${decodeURI(url)}`)
    if (options.data) {
      if (/json/.test(options.headers['Content-Type'])) {
        options.body = JSON.stringify(options.data)
      } else if (
        /x-www-form-urlencoded/.test(options.headers['Content-Type'])
      ) {
        options.body = qs(options.data)
      } else {
        options.body = options.data
      }
      delete options.data
    }
    if (!options.agent) options.agent = this.getAgent()
    try {
      let res = await fetch(url, options)
      if (!options.closeCheckStatus) {
        res = checkStatus(res)
      }
      if (options.statusCode) {
        return res[options.statusCode]()
      }
      return res
    } catch (err) {
      logger.error(err)
      throw Error(
        `Request Post Error，reason：${err.message.match(/reason:(.*)/)[1]}`
      )
    }
  }

  getAgent() {
    return false
  }

}()