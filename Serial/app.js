var serialport = require("serialport");
var SerialPort = serialport.SerialPort;

var sp = new SerialPort("/dev/ttyMFD1", { 
    baudrate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
    parser: serialport.parsers.readline("\n") 
}, false);

sp.open(function () {
    console.log('open /dev/ttyMFD1');

sp.on('data', function(data) {
        console.log('data received: ' + data);

    sp.write("Hi Mac, I am Edison\n", function(err, results) {
    console.log('say Hello from Edison');
        console.log('err |' + err+'|');
        console.log('results |' + results + '|');
    });

	});

sp.write("Hello from Edison\n", function(err, results) {
    console.log('say Hello from Edison');
        console.log('err |' + err+'|');
        console.log('results |' + results + '|');


    });

setInterval(function() {
sp.write("Hello from Edison\n", function(err, results) {
    console.log('say Hello from Edison');
        console.log('err |' + err+'|');
        console.log('results |' + results + '|');
    });
}, 5000);

});


