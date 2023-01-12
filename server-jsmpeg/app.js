const Stream = require("node-rtsp-stream");
const express = require("express");
const app = express();
// let router = express.Router();
// 设置rtsp视频流
// const rtsp_url = 'rtsp://192.168.1.10:554/stream1'

app.use(express.static(__dirname));

const rtsp_url =
  "rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4";
var streams = {};

app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  // res.header("Access-Control-Allow-Origin", '*');
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type,Content-Length, Authorization, Accept,X-Requested-With"
  );
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("X-Powered-By", " 3.2.1");
  if (req.method === "OPTIONS") res.send(200); /*让options请求快速返回*/
  else next();
});
//开启一路新视频
function setNew(id, rtsp) {
  var size = "1920*1080";
  return (streams[id] = new Stream({
    name: "sockets",
    // streamUrl: 'rtsp://admin:hiwei713@192.168.1.65:554/h264/ch33/main/av_stream',
    streamUrl: rtsp ? rtsp : rtsp_url,
    wsPort: `9981`,
    ffmpegOptions: {
      // 选项ffmpeg标志
      "-stats": "", // 没有必要值的选项使用空字符串
      "-r": 30, // 具有必需值的选项指定键后面的值<br>
      "-s": size,
      "-b:v": "4000k",
    },
  }));
}
// 关闭一路
function closeS(id) {
  if (streams[id]) {
    streams[id].wsServer.close();
    streams[id].mpeg1Muxer.stream.kill();
    streams[id] = null;
  }
}

app.get("/open", (req, res) => {
  if (!streams[req.query.id]) {
    streams[req.query.id] = setNew(
      req.query.id,
      req.query.rtsp ? req.query.rtsp : rtsp_url
    );
  }
  res.send("123");
});

app.get("/close", (req, res) => {
  //关闭已经开启的websocket
  if (req.query.id == "all") {
    // streams
    for (let i = 1; i < 8; i++) {
      console.log(streams[i]);
      if (streams[i]) {
        closeS(i);
      }
    }
  } else {
    closeS(req.query.id);
  }
  console.log("关闭");
  res.send("关闭成功");
});

app.listen(18100, function () {
  console.log("视频监听启动");
});
