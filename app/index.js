const crypto = require('crypto');
const express = require('express');
const app = express();
const mysql = require('mysql2');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const xssFilters = require('xss-filters');


app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


//ここからsocket.io
io.on('connection', function(socket){
   //---------------------------------
  // ログイン
  //---------------------------------
  (()=>{
    // トークンを作成
    const token = makeToken(socket.id);

    // 本人にトークンを送付
    io.to(socket.id).emit("token", {token:token});
  })();
  
  //データベースにある過去のメッセージを送信
  socket.on('msg update', function(){

    const connection = mysql.createConnection({
      host: 'db',
      user : 'docker',
      password:'pass',
      database:'testdb',
    });
    
    connection.connect(function (err) {
        if (err) {
          console.log('error connecting: ' + err.stack);
          return;
        }
        console.log('success');
    });
  
    connection.query("select * from chat" ,function
    (error,results,fields){
      if (error) {console.log('err: ' + error); }
      socket.emit('open', results);
    });
    connection.end();
  });
  
  //メッセージが送られてきたことを確認し、データベースに格納後全員にメッセージを送信
  socket.on('post', function(msg){
    msg.id=socket.id;
    msg.text= xssFilters.inHTMLData(msg.text)
    io.emit('member-post', msg);

    const connection = mysql.createConnection({
      host: 'db',
      user : 'docker',
      password:'pass',
      database:'testdb',
    });
    
    connection.connect(function (err) {
        if (err) {
          console.log('error connecting: ' + err.stack);
          return;
        }
        console.log('success');
    });
    connection.query("insert into chat(username,userid,ondate,onday,ontime,content) VALUES(?,?,?,?,?,?)",[msg.name,msg.id,msg.date,msg.day,msg.time,msg.text],function
    (error,results,fields){
      if (error) {console.log('err: ' + error); }
    });
    connection.end();
  });
});
//socket.ioここまで

//ポート
http.listen(port, function(){
  console.log('listening on *:' + port);
});


/**
 * socket.io用のトークンを作成する
 *
 * @param  {string} id - socket.id
 * @return {string}
 */
 function makeToken(id){
  const str = "aqwsedrftgyhujiko" + id;
  return( crypto.createHash("sha1").update(str).digest('hex') );
}
