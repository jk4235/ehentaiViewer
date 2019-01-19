import request from '@/utils/request'

export function getInitData (params) {
  return request({
    url: '/',
    headers: {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
    },
    method: 'get',
    params
  })
}
