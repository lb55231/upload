import request from '@/utils/request'
const base = 'https://video-upload.scllky.vip'
export default {
  // 检查文件是否存在
  uploads: function (para) {
    return request({
      // status 固定值 md5Check
      // md5 md5值
      // uploadkey 上传秘钥
      url: base + '/uploads?status=' + para.status + '&uploadkey=' + para.uploadkey + '&md5=' + para.md5,
      method: 'get',
      data: para
    })
  },
  // 上传分片
  getUploads: function (para) {
    return request({
      url: base + '/uploads',
      method: 'post',
      data: para
    })
  },
  // 合并分片
  mergeUploads: function (para) {
    return request({
      // status 固定值chunksMerge
      // md5 文件的md5值
      // chunks 分片总数
      // name 文件的md5值
      // fileoldname 原始文件名（不带扩展名）
      // ext 原始文件扩展名(不带.) 比如 mp4
      url: base + '/uploads?status=' + para.status + '&md5=' + para.md5 + '&chunks=' + para.chunks + '&name=' + para.name + '&fileoldname=' + para.fileoldname + '&ext=' + para.ext,
      method: 'get',
      data: para
    })
  },
}