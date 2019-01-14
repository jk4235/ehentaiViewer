import axios from 'axios'
import { Message } from 'element-ui'
import { BASE_API } from '../../../config'

axios.defaults.withCredentials = true
axios.defaults.adapter = require('axios/lib/adapters/http')
// 创建axios实例
const service = axios.create({
  baseURL: BASE_API // api的base_url
  // timeout: 5000 // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
  config => {
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// respone拦截器
service.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.response.data,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
