/*
    Patinとの通信
    
    UART1からコマンドを受け取る。
    
    コマンドを解釈（分解）する。
    
    電文内容をsendcomに送り、結果を得る。
    
    返信用コマンドを作成する。
    
    UART1に出力する。
    
    sendcom以外の命令
    バッテリー残容量の通知（Full, Normal, Empty）
    処理 
    Full時、PWM90％点灯
    Normal時、PWMを50％に落とす。
    Empty時、LED消灯、ポンプを動作させない。
    
    省エネ処理
    ポンプ動作時にはLEDを消灯する(栽培プログラムでも設定できる)。
    
    2015年6月
    株式会社アイティプランツ
    
    copyright itplants,ltd. 2015
    
*/

var headStart=0x01; // ヘッディングスタート
var toID=0x02; 　   // 送信元ID
var fromID=0x03;    // 発信元ID

var maxSize=260;// 4 + 255 + 1
// Uint8Array オブジェクトを作成する
var buffer=new Uint8Array(maxSize);

/*
// Uinit8Arrayには、文字コードが入らないので、ASCIIコードで入れる
var c='H50';　//  文字列電文
buffer[0]=c.charCodeAt(0);
console.log('0 '+buffer[0]);
// Uinit8Arrayには、ASCIIコードで入っているので、文字コードに戻す
var cc=String.fromCharCode(buffer[0]);
*/


// CheckCharを生成する
function genChekChar(){
    var	check=0;
    var len = buffer[3];
    //
    var i=0;
    for(i=0; i<len; i++ ){
		check ^= buffer[1 + i];	
	}
	// チェックキャラクタ
	buffer[len+4] = check;    
}

// checkCharを検証する
function checkChekChar(){
    var	check=0;
    var len = buffer[3];
    //
    var i=0;
    for(i=0; i<len; i++ ){
		check ^= buffer[1 + i];	
	}
	// チェックキャラクタ
	if(buffer[len+4] == check ){
	    // OK
	    return true;
	} else {
	    // NG
	    return false;
	}  
}

function setSoh(v){
// 送信先アドレス設定
buffer[0]=v;
}

function getSoh(){
// 送信先アドレス取得
return buffer[0];
}

function setDaddr(v){
// 送信先アドレス設定
buffer[1]=v;
}

function getDaddr(){
// 送信先アドレス取得
return buffer[1];
}

function setSaddr(v){
// 発信元アドレス設定
buffer[2]=v;
}

function getSaddr(){
 // 発信元アドレス取得
return buffer[2];
}

function setLen(v){
// Trailer部長さ設定
buffer[3]=v;
}

function getLen(){
// Trailer部長さ取得
return buffer[3];
}

// 文字列電文内容を入れる
function setData(s){
    var len=s.length;
//          console.log('len='+len);
    setLen(len);
    for(var i=0;i<len;i++){
//          console.log('setData '+s.charCodeAt(i));
        buffer[4+i]=s.charCodeAt(i);
    } 
//          console.log('setData end');
}

// 文字列電文内容を得る
function getData(){
var data='';
for(var i=0;i<getLen();i++){
//          console.log('getData '+String.fromCharCode(buffer[4+i]));
    data+=String.fromCharCode(buffer[4+i]);
}
return data;
}

// ジャストサイズのバッファにする
function makePacket(){
    return new Uint8Array(buffer,getLen()+5);
}


//
setSoh(headStart);
var Soh=getSoh();
console.log('Soh '+Soh);
setDaddr(toID);// 送信先アドレス設定
setSaddr(fromID);// 発信元アドレス設定

// for TEST
var com='H50,102,123';// 電文内容

console.log('set string '+com);
setData(com);// 電文内容設定
console.log('get string '+getData());

var Check=new Uint8Array(buffer,4+getLen(),1);
Check = genChekChar();

console.log('Check '+checkChekChar());

var EventEmitter = require('events').EventEmitter;
var async = require('async');
var camNum=0;// dev/video0
var itpNum=1;// start from 1,....,n

// for Patin communication 

// sendCom
function sendcom(num, arg){
var ev = new EventEmitter();
    var spawn = require('child_process').spawn;
    var sendcomand = 
// 本番
    spawn('/home/coder/coder-dist/coder-base/sudo_scripts/sendcom',[num,'-e',arg]); 
//  for test
//      spawn('cat',['file-'+arg]); 
	sendcomand.stdout.on('data', function (data) {
//    console.log('sendcom: ' + data);
	ev.emit('done',data);
	});
	sendcomand.stderr.on('data', function (data) {
//    console.log('stderr: ' + data);
	});
	return ev;
}

//
function sendComWork(com){ 
    var EventEmitter = require('events').EventEmitter;
    var ev = new EventEmitter();
async.series([
    function (callback) {
        sendcom(itpNum,com).on('done',function(res) {
	if(res){
//console.log('|'+res+'|');
//console.log('length.|'+res.length+'|');    
        var res2=res+'';
//console.log('res2 |'+res2+'|');
        var tmp=res2.split('\n');
	}
        var temp= tmp[1].split(' ')[1];
        ev.emit('done',temp);
        return temp;
        });
    },
        ], function (err, results) {
            if (err) {
                 console.log('series err. ' + err);
               throw err;
            }
    });
     return ev;
}

// UART1
var SerialPortFactory = require("serialport");  
var port = "/dev/cu.usbserial-FTF4SGRS"

function uart_write_data(){
	uart_write(makePacket());
}

function data_read(data){
	// copy data
	buffer.writeUInt8(data);

	// check
	if( checkChekChar() === false ){
	// data Error
	console.log("UART read Data Error");
	return;
	}

	// command sendCom
	var com=getData();
	
	//
	console.log('getData '+com);
	
	// send Data to sendcom	
	// get Responce from sendcom
    var res=sendComWork(com);
    
	// sendData
    //
    setSoh(headStart);
    // 送信先、発信元のIDが逆転する
    setDaddr(fromID);// 送信先アドレス設定
    setSaddr(toID);// 発信元アドレス設定

    console.log('setString '+res);
    setData(res);// 電文内容設定
    console.log('getString '+getData());
    genChekChar();

    // send to Patin
	uart_write_data();
}

var serialPort = new SerialPortFactory.SerialPort(port,  
{  
    //baudrate: 115200,   
    baudrate: 9600,   
    dataBits: 8,   
    parity: 'none',   
    stopBits: 1,   
    flowControl: false 
}, false);  

console.log("Open port: "+ port);  
serialPort.open(function (error) {  
  if (error) {  
    console.log('Failed to open: '+error);  
  } else {  
    console.log('open');  

    serialPort.on('data', function(data) {  
// parse data
	data_read(data);
    });  

// UART ERROR
    serialPort.on('error', function(data) {  
      console.log('error received: ' + data);  
    });  

//  Germから自発的に知らせることはあるのか？
//  定期的に水位センサーを調べてEmptyを通知する？
//  

  }  
});


function uart_write(data){
    //write data to serial port
      serialPort.write(data, function(err) {  
        if(err) {  
          console.log('err ' + err);  
        }else{  
          console.log('Writing data '+data);  
        }  
      });  
};


