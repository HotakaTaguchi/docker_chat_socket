//自分自身の情報を入れる
const IAM = {
  token: null,  // トークン
  name: null    // 名前
};

//-------------------------------------
// STEP1. Socket.ioサーバへ接続
//-------------------------------------
const socket = io();

// 正常に接続したら
socket.on("connect", ()=>{
  socket.emit('msg update');
  // 表示を切り替える
  $("#nowconnecting").style.display = "none";   // 「接続中」を非表示
  $("#inputmyname").style.display = "block";    // 名前入力を表示
});

// トークンを発行されたら
socket.on("token", (data)=>{
  IAM.token = data.token;
});

//イベントとコールバックの定義
//過去ログ表示
socket.on('open', function(msg){
  const list = $("#msglist");
  const length = msg.length;

  if(length==0){
    return;
  }else{
    for(let i = 0; i < length; i++){
      const li = document.createElement("li");
      const cnt = list.childElementCount+1;
      li.innerHTML = `<span class="title">${cnt} 名前：<span class="msg-member">${msg[i].username}</span> ${msg[i].ondate}(${msg[i].onday}) ${msg[i].ontime} ID:${msg[i].userid}</span><br> ${msg[i].content} `;
      list.appendChild(li);
    }
  }
});

//-------------------------------------
// STEP2. 名前の入力
//-------------------------------------
/**
 * [イベント] 名前入力フォームが送信された
 */
$("#frm-myname").addEventListener("submit", (e)=>{
  // 規定の送信処理をキャンセル(画面遷移しないなど)
  e.preventDefault();

  // 入力内容を取得する
  const myname = $("#txt-myname");
  if( myname.value === "" ){
    myname.value = "名無し";
  }

  // 名前をセット
  $("#myname").innerHTML = myname.value;
  IAM.name = myname.value;

  // 表示を切り替える
  $("#inputmyname").style.display = "none";   // 名前入力を非表示
  $("#chat").style.display = "block";         // チャットを表示


});


//-------------------------------------
// STEP3. チャット開始
//-------------------------------------

const msg = $("#msg");
//テキストエリアの高さ自動調節
//textareaのデフォルトの要素の高さを取得
let clientHeight = msg.clientHeight;

//textareaのinputイベント
msg.addEventListener('input', ()=>{
    //textareaの要素の高さを設定（rows属性で行を指定するなら「px」ではなく「auto」で良いかも！）
    msg.style.height = clientHeight + 'px';
    //textareaの入力内容の高さを取得
    let scrollHeight = msg.scrollHeight;
    //textareaの高さに入力内容の高さを設定
    msg.style.height = scrollHeight + 'px';
});
/**
 * [イベント] 発言フォームが送信された
 */
$("#frm-post").addEventListener("submit", (e)=>{
  // 規定の送信処理をキャンセル(画面遷移しないなど)
  e.preventDefault();
  msg.style.height = '2em';

  // 入力内容を取得する
  if( msg.value === "" ){
    return(false);
  }

  const date1 = new Date();

  const date2 = 
				date1.getHours().toString().padStart(2,'0') + ":" + 
        date1.getMinutes().toString().padStart(2,'0') + ":" + 
        date1.getSeconds().toString().padStart(2,'0'); 
  
  const date3 = 
				date1.getFullYear() + "/" + 
        (date1.getMonth()+1).toString().padStart(2,'0') + "/" + 
        date1.getDate().toString().padStart(2,'0');
  const weeks = ["日","月","火","水","木","金","土"];
  const date4 = weeks[date1.getDay()];
  
  // Socket.ioサーバへ送信
  socket.emit("post", {
    time: date2,
    day: date4,
    date: date3,
    text: msg.value,
    token: IAM.token,
    name: IAM.name,
    id:null
  });

  // 発言フォームを空にする
  msg.value = "";
});

/**
 * [イベント] 誰かが発言した
 */
socket.on("member-post", (msg)=>{
  const is_me = (msg.token === IAM.token);
  addMessage(msg, is_me);
});


/**
 * 発言を表示する
 *
 * @param {object}  msg
 * @param {boolean} [is_me=false]
 * @return {void}
 */
function addMessage(msg, is_me=false){
  const list = $("#msglist");
  const li = document.createElement("li");
  const cnt = list.childElementCount+1;

  //------------------------
  // 自分の発言
  //------------------------
  if( is_me ){
    li.innerHTML = `<span class="title">${cnt} 名前：<span class="msg-me">${msg.name}</span> ${msg.date}(${msg.day}) ${msg.time} ID:${msg.id}</span><br> ${msg.text} `;
  }
  //------------------------
  // 自分以外の発言
  //------------------------
  else{
    li.innerHTML = `<span class="title">${cnt} 名前：<span class="msg-member">${msg.name}</span> ${msg.date}(${msg.day}) ${msg.time} ID:${msg.id}</span><br> ${msg.text} `;
  }

  // リストの最後に追加
  list.appendChild(li);
}