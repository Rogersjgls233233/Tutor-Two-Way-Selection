var express = require('express');
var path = require('path');

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var student = require('./routes/student');
var teacher = require('./routes/teacher');
var admin = require('./routes/admin');
var app = express();
var cors = require('cors');
app.use(cors());
var fs = require('fs');
var multer = require('multer'); //引入multer
var upload = multer({
  dest: 'uploads/',
}); //设置上传文件存储地址
// view engine setup
app.listen('8080');
// uncomment after placing your favicon in /public
app.use('/', express.static('./dist'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/student', student);
app.use('/teacher', teacher);
app.use('/admin', admin);
// catch 404 and forward to error handler
app.use('/downloadFile', (req, res, next) => {
  var filename = req.query.filename;
  var file = 'uploads/' + filename;
  res.writeHead(200, {
    'Content-Type': 'application/octet-stream', //告诉浏览器这是一个二进制文件
    'Content-Disposition': 'attachment; filename=' + encodeURI(filename), //告诉浏览器这是一个需要下载的文件
  }); //设置响应头
  var readStream = fs.createReadStream(file); //得到文件输入流

  readStream.on('data', (chunk) => {
    res.write(chunk, 'binary'); //文档内容以二进制的格式写到response的输出流
  });
  readStream.on('end', () => {
    res.end();
  });
});
app.use('/onlineRead', (req, res, next) => {
  var urlarr = req.url.split('/');
  var filename = urlarr[urlarr.length - 1];
  var file = 'uploads/' + filename;
  var stats = fs.statSync(file);
  if (stats.isFile())
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename=' + filename,
      'Content-Length': stats.size,
    });
  fs.createReadStream(file).pipe(res);
});

app.use('/uploadFile', upload.single('file'), (req, res, next) => {
  var ret = {};
  ret['code'] = 20000;
  var file = req.file;
  console.log(file);
  if (file) {
    var fileNameArr = file.originalname.split('.');
    var suffix = fileNameArr[fileNameArr.length - 1];
    console.log(fileNameArr);
    console.log(suffix);

    //文件重命名
    fs.renameSync(
      'uploads/' + file.filename,
      `uploads/${file.filename}.${suffix}`
    );
    file['newfilename'] = `${file.filename}.${suffix}`;
  }
  ret['file'] = file;
  //console.log(ret);
  res.send(ret);
});

app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

module.exports = app;
