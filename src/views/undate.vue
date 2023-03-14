<template>
  <div class="myDiv">
    <el-upload class="upload-demo" action="#" :on-change="uploadFile" :show-file-list="true" :file-list="fileList"
      :auto-upload="false" ref="uploadfile" :limit="1">
      <el-button size="small" type="primary" :loading="loadingFile">上传文件</el-button>
    </el-upload>
    <div class="test-videojs">
      <video id="videoPlayer" class="video-js" muted></video>
    </div>
  </div>
</template>

<script>
import Videojs from "video.js"; // 引入Videojs
import SparkMD5 from "spark-md5";
const chunkSize = 10 * 1024 * 100; //定义分片的大小 暂定为10M，方便测试
export default {
  name: "",
  components: {},
  props: {},
  data() {
    return {
      fileList: [],
      loadingFile: false,
      hash: '',
      nowPlayVideoUrl: "https://video.scllky.vip/20230306/ubtCmU8y/index.m3u8",
    };
  },
  mounted() {
    this.initVideo()
  },
  methods: {
    initVideo() {
      // 这些options属性也可直接设置在video标签上，见 muted
      let options = {
        autoplay: true, // 设置自动播放
        controls: true, // 显示播放的控件
        sources: [
          // 注意，如果是以option方式设置的src,是不能实现 换台的 (即使监听了nowPlayVideoUrl也没实现)
          {
            src: this.nowPlayVideoUrl,
            type: "application/x-mpegURL" // 告诉videojs,这是一个hls流
          }
        ]
      };
      // videojs的第一个参数表示的是，文档中video的id
      const myPlyer = Videojs("videoPlayer", options, function onPlayerReady() {
        //console.log("onPlayerReady 中的this指的是：", this);  这里的this是指Player,是由Videojs创建出来的实例
        console.log(myPlyer === this); // 这里返回的是true
      });
    },
    /**
     * 上传文件
     */
    async uploadFile(File) {
      this.loadingFile = false;
      var self = this;
      //获取用户选择的文件
      const file = File.raw;
      this.currentFile = file;
      //文件大小(大于100m再分片哦，否则直接走普通文件上传的逻辑就可以了，这里只实现分片上传逻辑)
      const fileSize = File.size;
      // 放入文件列表
      this.fileList = [{ name: File.name }];
      // 可以设置大于多少兆可以分片上传，否则走普通上传
      if (fileSize <= chunkSize) {
        console.log("上传的文件大于10m才能分片上传");
      }
      //计算当前选择文件需要的分片数量
      const chunkCount = Math.ceil(fileSize / chunkSize);
      console.log(
        "文件大小：",
        File.size / 1024 / 1024 + "Mb",
        "分片数：",
        chunkCount
      );
      //获取文件md5
      const fileMd5 = await this.getFileMd5(file, chunkCount);
      console.log("文件md5:", fileMd5);
      console.log("向后端请求本次分片上传初始化");
      const initUploadParams = {
        status: 'md5Check', //文件的md5
        md5: fileMd5, //文件名
        uploadkey: "FC61345491DE8CC0", //上传秘钥
      };
      this.api.uploads(initUploadParams).then((res) => {
        console.log(res);
      });
      // 调用后端检查文件上传情况接口
      // 获取后端返回的已上传分片数字的数组
      // var uploaded = res.data.uploaded;
      // 定义分片开始上传的序号
      // 由于是顺序上传，可以判断后端返回的分片数组的长度，为0则说明文件是第一次上传，分片开始序号从0开始
      // 如果分片数组的长度不为0，我们取最后一个序号作为开始序号
      // var num = uploaded.length == 0 ? 0 : uploaded[uploaded.length - 1];
      var num = 0;
      console.log('md5Check::', this.hash);
      // 循环调用上传
      for (var i = num; i < chunkCount; i++) {
        //分片开始位置
        let start = i * chunkSize;
        //分片结束位置
        let end = Math.min(fileSize, start + chunkSize);
        //取文件指定范围内的byte，从而得到分片数据
        let _chunkFile = File.raw.slice(start, end); // 每一个分片
        console.log("开始上传第" + i + "个分片");
        let formdata = new FormData();
        let userId = "FC61345491DE8CC0";
        formdata.append("userId", userId); // userId
        formdata.append("uniqueFileName", fileMd5); // 文件的md5值
        formdata.append("chunk", i + 1);
        formdata.append("file", _chunkFile);

        // 通过await实现顺序上传
        await this.getMethods(formdata);
      }
      //     // 文件上传完毕，请求后端合并文件并传入参数
      self.composeFile(file, fileMd5, File.name, chunkCount);
      //   }
      // );
    },
    /**
     * 上传文件方法
     * @param formdata 上传文件的参数
     */
    getMethods(formdata) {
      this.api.getUploads(formdata).then((res) => {
        console.log(res, "rrrrrrrr");
      });
    },
    /**
     * 获取文件MD5
     * @param file
     * @returns {Promise<unknown>}
     */
    getFileMd5(file, chunkCount) {
      return new Promise((resolve, reject) => {
        let blobSlice =
          File.prototype.slice ||
          File.prototype.mozSlice ||
          File.prototype.webkitSlice;
        let chunks = chunkCount;
        let currentChunk = 0;
        let spark = new SparkMD5.ArrayBuffer();
        let fileReader = new FileReader();
        fileReader.onload = function (e) {
          spark.append(e.target.result);
          this.hash = SparkMD5.ArrayBuffer.hash(e.target.result)
          console.log(this.hash,'this.hash');
          resolve(this.hash)
          currentChunk++;
          if (currentChunk < chunks) {
            loadNext();
          } else {
            let md5 = spark.end();
            resolve(md5);
          }
        };
        fileReader.onerror = function (e) {
          reject(e);
        };
        function loadNext() {
          let start = currentChunk * chunkSize;
          let end = start + chunkSize;
          if (end > file.size) {
            end = file.size;
          }
          fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
        }
        loadNext();
      });
    },
    /**
     * 请求后端合并文件
     * @param fileMd5 文件md5
     * @param fileName 文件名称
     * @param count 文件分片总数
     */
    composeFile(file, fileMd5, fileName, count) {
      /**
     * 请求后端合并文件
     * status 固定值chunksMerge
      md5 文件的md5值
      chunks 分片总数
      name 文件的md5值
      fileoldname 原始文件名（不带扩展名）
      ext 原始文件扩展名(不带.) 比如 mp4
      */
      console.log("开始请求后端合并文件");
      let arrStr = fileName.split(".");
      var data = {
        status: "chunksMerge",
        md5: fileMd5, //文件的md5
        name: fileMd5,
        chunks: count, //分片的总数量
        fileoldname: arrStr[0],
        ext: arrStr[1],
      };
      this.api.mergeUploads(data).then((res) => {
        if (res.data.url !== '') {
          res.data.url = this.nowPlayVideoUrl
          // this.initVideo();
        }
      });
    },
  },
};
</script>
<style scoped>
.upload-demo {
  width: 200px;
  height: 200px;
}

#videoPlayer {
  width: 500px;
  height: 300px;
  margin: 50px auto;
}
</style>