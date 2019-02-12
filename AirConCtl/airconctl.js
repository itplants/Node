//
var startStopDaemon = require('start-stop-daemon');
require('date-utils');
var async = require('async');
var cronJob = require('cron').CronJob;

var EventEmitter = require('events').EventEmitter;

var logFile='/home/pi/Node/AirConCtl/log/airconctl.log'
//
// 本番
var configFile='/home/coder/coder-dist/coder-base/resources/airconctlSchedule.res';
var IRKitCMD='/home/pi/Node/AirConCtl/IRKitcmd';

var fs = require('fs');
var cronTime  = "* * * * * *";
         
function makeCronTimeHM(schedule){
//console.log('makeCronTimeHM:'+schedule);
            var hh=schedule.split(':')[0] | 0;
            var mm=schedule.split(':')[1] | 0;
            var h = '*';  var m='*';
            if(isNaN(hh)===false){
            if( hh <= 9 ) h= '0'+hh; else h= ''+hh;
            };
            if(isNaN(mm)===false){
            if( mm <= 9 ) m= '0'+mm; else m= ''+mm;
            };
            
            var crontimes = '00 '+m+' '+h+' * * *';
//console.log('cronTimeHM '+crontimes);
            return crontimes;
} 


function writeLogFile(file, log){
//console.log(' writeLogFile '+file+' |'+log+'|');	

    fs.appendFile(file, log, 'utf8', function (err) {
	if(err) console.log('Error '+err);
	});
}


var jobs=[]; // cron jobs
var cmd=[]; // cron jobs
var ct=[]; // cron jobs
var no=[]; // cron jobs

function readConfigFile(file){
//console.log('readConfigFile '+file);	
    fs.readFile(file, 'utf8', function (err, text) {
        if(err){
            console.log('fileRead Error:'+err);
            return 'ERROR';
        } else {

	var line=text.split('\n');
	var nline=line[0].split(' ')[1];
	for(var i=0;i<nline;i++) no[i]=i;

	async.each(no, function(i, callback){
    	var data=line[i+1].split(' ');
//	console.log('i='+i+' data1='+data[1]+' data2='+data[2] );
	data[2]=data[2]+'';
	data[2]=data[2].toUpperCase();
//	console.log('i='+i+' data1='+data[1]+' data2='+data[2] );
	var cmdb=data[2];
        var ctb = makeCronTimeHM(data[1]);
	cmd[i]=cmdb;
	ct[i]=ctb;
//	writeLogFile(logFile, 'jobtime='+ct[i]+' '+'cmd='+cmd[i]+'\n');
//	 console.log('jobtime='+ctb+' '+'cmd='+cmdb+'\n');
	if(jobs[i]) jobs[i].stop;

    	jobs[i]=new cronJob(
		ct[i],
	        function(){
                irkitWork(cmd[i]).on('done',function(res) {
			//writeLogFile(logFile, 'Done:'+getTimeDate()+' '+cmd[i]+'\n');
			//console.log('Done:'+getTimeDate()+' '+ct[i]+' '+cmd[i]+'\n');
                	});
	        }, null, true);
		//
	if(jobs[i]) jobs[i].start;
			writeLogFile(logFile, 'Set:'+getTimeDate()+' '+ct[i]+' '+cmd[i]+'\n');
			//console.log('Set:'+getTimeDate()+' '+ct[i]+' '+cmd[i]+'\n');
		});


		}
	});
}

function irkitWork(cmd){                                                         
var ev = new EventEmitter();                                                  
    var spawn = require('child_process').spawn;                        
    var irkit = spawn(IRKitCMD,[cmd]);
        irkit.stdout.on('data', function (data) {   
//console.log('irkitWork Done:'+getTimeDate()+' '+cmd+' data='+data+'\n');
//writeLogFile(logFile, 'irkitWork Done:'+getTimeDate()+' '+cmd+' data='+data+'\n');
        ev.emit('done',data);
        });                   
        irkit.stderr.on('data', function (data) {   
        });                         
        return ev;                              
}                                               
    

fs.watchFile(configFile, function (curr, prev) {
    // プロパティ丸ごと出力してもらう
    console.dir(curr);
    writeLogFile(logFile, 'Reload Settings.\n');
    //
    readConfigFile(configFile, function (err) {
    if(err){
        console.log('readConfigFile err '+err);
       // exit(0);
    } 
    });
});


function printProperties(obj) {
    var properties = '';
    for (var prop in obj){
        properties += prop + "=" + obj[prop] + "\n";
    }
    console.log(properties);
}

 
 function getTimeDate(){
                         var now = new Date();
                         // 
//                console.log('now = '+now);
                         var month=now.getMonth()+1;
                         if(month <= 9 ) month='0'+month;
                         var day=now.getDate()+0;
                         if(day <= 9 ) day='0'+day;
                         var hour=now.getHours()+0;
                         if(hour <= 9) hour='0'+hour;
                         var min=now.getMinutes()+0;
                         if(min <= 9) min='0'+min;
                         var sec=now.getSeconds()+0;
                         if(sec <= 9) sec='0'+sec;
                        
                        var timedate =  (now.getYear()+1900)+''+month +''+day+''+hour+''+min+''+sec;
//                        var timedate =  (now.getYear()+1900)+''+month +''+day+''+hour+''+min;
                        
//                console.log('timedate = '+timedate);
                        return timedate;
 }
 
function timedateFileName(){
        var date=new Date();
        var y=date.getYear();
        var m=date.getMonth()+1;
        var d=date.getDate();
        var H=date.getHours();
        var M=date.getMinutes();
        var S=date.getSeconds();
	if(y>100) y -= 100;
        if(y<=9) y='0'+y;
        if(m<=9) m='0'+m;
        if(d<=9) d='0'+d;
        if(H<=9) H='0'+H;
        if(M<=9) M='0'+M;
        if(S<=9) S='0'+S;
//console.log('filename='+'|Y|'+y+'|'+'|M|'+m+'|'+'|D|'+d+'|'+'|h|'+H+'|'+'|m|'+M+'|s|'+S+'|');
        var fn="/photo/"+y+m+d+H+M+S+'.jpg';
//console.log('timedateFileName:'+fn);
        return fn;
}
 


 
 
process.on('SIGUSR2', function() {
console.log('Got SIGIUSR2.');
console.log('airconctl Im fine.');
});

process.on('SIGUSR1', function() {
console.log('Got SIGIUSR1.');
  // mv dataFile to dataFile[_Date_]
  // and make new file
  var tmp=fileName.split('.');
  var newFileName=tmp[0]+tmp()+'.'+tmp[1];
  fs.rename(fileName, newFileName);
//console.log( fileName+'is renamed to '+newFileName);
});


function makeCronRepeatTime(sampling){// input is sec
        var sec, min, hour, day, month, year;
        var samplingTime = sampling;
          sec     = parseInt(samplingTime)  % 60;
          min     = parseInt(samplingTime   / (60) ) % (60);
          hour    = parseInt(samplingTime   / (60*60) ) % (24);
          day     = parseInt(samplingTime   / (60*60*24)) % (30);
          month   = parseInt(samplingTime   / (60*60*24*30)) % (12);
          year    = '*';
          
//           console.log('cronTime '+sec+' '+min+' '+hour+' '+day+' '+month+' '+year);   
        
            if(sec <= 9) sec='0'+sec;
            if(sec == 0) sec ='*';
            if(samplingTime < 60) sec = '*/'+sec; // every sec

            if(min <= 9) min='0'+min;
            if(samplingTime < (60))  min ='*';  
            if(samplingTime >= 60 && samplingTime< (60*60) ){
            sec = '00';
            min   = '*/'+min;
            } 

            if(hour == 0) hour ='0';  
            if(hour <= 9) hour='0'+hour;
            if(samplingTime <  (60*60))  hour ='*';  
            if(samplingTime >= (60*60) && samplingTime < (60*60*24)){
            sec = min = '00';
            hour   = '*/'+hour;
            }
            
            if(day <= 9) day='0'+day;
            if(day == 0) day ='*';
            if(samplingTime <  (60*60*24))  day ='*';  
            if(samplingTime >= (60*60*24) && samplingTime< (60*60*24*30)){
            sec = min = hour = '00';
            day   = '*/'+day;
            }
            
            if(month <= 9) month='0'+month;
            if(month == 0) month ='*';
            if(samplingTime <  (60*60*24*30))  month ='*';  
            if(samplingTime >= (60*60*24*30)  && samplingTime< (60*60*24*30*12)){
            sec = min = hour = '00';
            day = '01';
            month   = '*/'+month;
            }


            year ='*';
            var crontime = ''+sec+' '+min+' '+hour+' '+day+' '+month+' '+year;
            console.log('cronTime '+crontime);     
	    return crontime;
}

startStopDaemon(function() { 
console.log('\n\n============ startStopDaemon ==========\n');
	var msg=getTimeDate()+' startStopDaemon\n';
	console.log(msg);

	writeLogFile(logFile, msg);

////
    var samplingTime=600; // default 10 min
    // print process.argv
    process.argv.forEach(function(val, index, array) {
        if(val=='-h'){
            console.log('Usage: '+process.argv[1]);
            console.log('When got USR1 signal then re file data.');
            process.exit(0);
            } 
    });
    
console.log('dataCapture Start at ' + new Date() + '\n');
	timedateFileName();

    // IRKit 
    readConfigFile(configFile, function (err, text) {
    if(err){
        console.log('readConfigFile err '+err);
    		}
    });
 });

