var SerialPortFactory = require("serialport");  
var port = "/dev/ttyMFD1";  
var serialPort = new SerialPortFactory.SerialPort(port,  
    {  
/*
    baudrate: 115200,   
    dataBits: 8,   
    parity: 'none',   
    stopBits: 1,   
    flowControl: false,  
    parser: SerialPortFactory.parsers.readline()  
*/

    baudrate: 115200,   
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
      console.log('data received: ' + data);  
    });  
    serialPort.on('error', function(data) {  
      console.log('error received: ' + data);  
    });  
    //write data to serial port every second  
    var counter = 0;  
    setInterval(function () {  
	var sdata=String(counter);
      serialPort.write(sdata, function(err) {  
        if(err) {  
          console.log('err ' + err);  
        }else{  
          console.log('Writing data '+sdata);  
        }  
      });  
      counter++;  
      if(counter>100)  
        counter =0;  
    }, 100);  
  }  
});
