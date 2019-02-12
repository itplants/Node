#!/usr/local/bin/node


var startStopDaemon = require('start-stop-daemon');
require('date-utils');
var async = require('async');

// set camera No. from config file  
var camNo=0;
    
var EventEmitter = require('events').EventEmitter;
var sleep = require('sleep');

//
var camNum=0;// dev/video0
var itpNum=1;// start from 1,....,n

// 本番
var configFile='/home/coder/coder-dist/coder-base/config/saveITPController.txt'
// ---Lamp--- 7:0 18:2---Lamp--- 7:0 18:2---Pump--- 5:35 7:00 23:00,pumpWrokTime 42

var fs = require('fs');
var LEDstate=false;
var planterSchedule=[];
var command='';
         
function readConfigFile(file, f){
	
//console.log('readConfigFile');
var planterSchedule=[];

    fs.readFile(file, 'utf8', function (err, text) {
        if(err){
            console.log('fileRead Error:'+err);
            return 'ERROR';
        } else {

    // parse data
    // console.log('readConfigFile start ');
    // ---Lamp--- 7:0 18:2,---Duty--- 7:0 18:2,---Pump--- 5:35 90 6:00 30, pumpWrokTime 42,---H--- 30

    var data=String(text).split(',');
//console.log('read data=',data);
//console.log('data.length=',data.length);

        for(var i=0;i<data.length;i++){
            var arg=data[i];

//console.log('arg=|'+arg+'|'); 
            var arg0=String(arg).split(' ')[0];
//console.log('arg0=|'+arg0+'|'); 

            switch(arg0){
                case '---Lamp---':
                {
                // ---Lamp--- data 
                planterSchedule.push(arg);
//console.log('Lamp '+planterSchedule);
                break;
                }
                
                case '---Duty---':
                {
                 // ---Duty--- data
                planterSchedule.push(arg);
//console.log('Duty '+planterSchedule);
                break;
                }
                
                case '---Pump---':
                {
                 // ---Pump--- data
                planterSchedule.push(arg);
//console.log('Pump arg='+arg);
//console.log('Pump '+planterSchedule);
//console.log('XXXXXXXXXXXXXXXXX');
                break;
                }
                case 'pumpWrokTime':
                {
                planterSchedule.push(arg);
//console.log('pumpWrokTime '+planterSchedule);
		break;
                }
                case '---H---':
                {
                // ---H---- data 
                planterSchedule.push(arg);
//console.log('------- H '+planterSchedule);
                break;
                }

                }//end switch
            }// end i
//console.log('readConfigFile data='+planterSchedule);
//console.log('readConfigFile end ');
	if(f) f(err, planterSchedule);
        }// end else
    });
}


fs.watchFile(configFile, function (curr, prev) {
    // プロパティ丸ごと出力してもらう
    console.log('fs.watchFile configFile='+configFile);

    //
    readConfigFile(configFile, function (err, text) {
    if(err){
        console.log('!!!!  readConfigFile ERROR !!!!!');
        console.log('readConfigFile err '+err);
       // exit(0);
    } else {
//        console.log('readConfigFiletext='+text);
    if(text){
        command=makeCommand(String(text).split(','));
	if(command[command.length-1]==='') command.pop();
    	ITPsetting(command);
              }
         }// end else
    });// readConfigFile
});

function sendcom(arg){
var ev = new EventEmitter();
    
    var spawn = require('child_process').spawn;
console.log('function sendcom '+arg);

    var sendcomand = 
	    spawn('/home/coder/coder-dist/coder-base/sudo_scripts/sendcom',arg); 

//  for test
	sendcomand.stdout.on('data', function (data) {
//    console.log('sendcom: ' + data);
	ev.emit('done',data);
	});
	sendcomand.stderr.on('data', function (data) {
//    console.log('stderr: ' + data);
	});
	return ev;
}

function ITPsetting(arg){

var ev = new EventEmitter();
    
    var spawn = require('child_process').spawn;


console.log('ITPsetting /home/coder/coder-dist/coder-base/sudo_scripts/ITPsetting '+arg);

    if(arg === '') return; 

    var sendcomand = 
	    spawn('/home/coder/coder-dist/coder-base/sudo_scripts/ITPsetting',arg); 
//  for test
	sendcomand.stdout.on('data', function (data) {
    	console.log('sendcom: ' + data);
	ev.emit('done',data);
	});
	sendcomand.stderr.on('data', function (data) {
    		console.log('stderr: ' + data);
	});
	return ev;
}

function printProperties(obj) {
    var properties = '';
    for (var prop in obj){
        properties += prop + "=" + obj[prop] + "\n";
    }
    //alert(properties);
    console.log(properties);
}

 
 function getTimeDate(){
                         return timedate = new Date().toFormat('YYYYMMDDHH24MI');
/*
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
*/
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

function planterWork(command){
//    console.log("planterWork in  command="+command);
    ITPsetting(command);
}

process.on('SIGUSR2', function() {
console.log('Got SIGIUSR2.');
console.log('itplanterCOntrol Im fine.');
});

process.on('SIGUSR1', function() {
console.log('Got SIGIUSR1.');
  // mv dataFile to dataFile[_Date_]
  // and make new file
  var tmp=String(fileName).split('.');
  var newFileName=tmp[0]+tmp()+'.'+tmp[1];
  fs.rename(fileName, newFileName);
//console.log( fileName+'is renamed to '+newFileName);
});

// convert time 01:00 to cont time 60
function ct(t){
  hm=String(t).split(':');
  h=parseInt(hm[0]);
  m=parseInt(hm[1]);
  return 60*h+m;
}

function makeCommand(scheduleData){
////////////
//console.log('makeCommand scheduleData='+scheduleData);
 var command=[];
 command.push('-No');
 command.push('1');

// lamp
if( scheduleData[0] ){
var ldata=String(scheduleData[0]).split(' ');
for(i=1;i<ldata.length;i+=2){
 start=ct(ldata[i]);
 cont =ct(ldata[i+1]);
 command.push('-W'+parseInt(i/2)+','+String(start)+','+String(cont));
}
 command.push('-ln '+String(parseInt((ldata.length-1)/2)));
}

// duty
if( scheduleData[1] ){
ldata=String(scheduleData[1]).split(' ');
if(ldata[ldata.length-1]==='') ldata.pop();
//console.log('makeCommand ldata='+ldata);
for(i=1;i<ldata.length;i+=2){
 start=ct(ldata[i]);
 pwm=ldata[i+1];
//console.log('makeCommand start='+start+' pwm='+pwm);
 command.push('-D'+parseInt(i/2)+','+String(start)+','+String(pwm));
}
//console.log('makeCommand ldata='+ldata);
 command.push('-dn '+String(parseInt((ldata.length-1)/2)));
}

// pump
if( scheduleData[2] ){
ldata=String(scheduleData[2]).split(' ');
for(i=1;i<ldata.length;i++){
 start=ct(ldata[i]);
 command.push('-P'+parseInt(i/2)+','+String(start));
// console.log('command='+command);
	}
 command.push('-pn '+String(ldata.length-1));
}

// pumpWorkTime
if( scheduleData[3] ){
ldata=String(scheduleData[3]).split(' ');
//console.log('pumpWorkTime '+ldata);
for(i=1;i<ldata.length;i+=2){
 wtime=parseInt(ldata[i]);
 command.push('-pw '+String(wtime));
	}
}

// PWM
//console.log('scheduleData[3]='+scheduleData[4]);
if( scheduleData[4] ){
pwm=String(scheduleData[4]).split(' ')[1];
command.push('-H '+String(pwm));
}

  var t='';
  for(i=0;i<command.length;i++){
  t += command[i]+' ';
  }
  if(t[t.length-1]==='') t.pop();


//  console.log('/home/coder/coder-dist/coder-base/sudo_scripts/ITPsetting '+t);
  return String(t).split(' ');
}

startStopDaemon(function() { 
////
    var samplingTime=600; // default 10 min
    // print process.argv
    process.argv.forEach(function(val, index, array) {
//console.log(index + ': ' + val);
    if(index >= 2){
        if(val=='-n'){
            itpNum = process.argv[index+1]; // planter No.
        	}
        } 
        if(val=='-h'){
            console.log('Usage: '+process.argv[1]+' -n itplanterNo');
            console.log('When got USR1 signal then re file data.');
            process.exit(0);
            } 
        });
    
//console.log('dataCapture Start at ' + new Date() + '\n');
timedateFileName();
// main

readConfigFile(configFile, function (err, text) {
console.log('------ -readConfigFile '+text);

    if(err){
        console.log('readConfigFile err '+err);
    } else {
    //
    text=String(text);


//console.log('readConfigFile scheduleData '+scheduleData);
//console.log('readConfigFile scheduleData.length '+scheduleData.length);

        command=makeCommand(String(text).split(','));
	if(command[command.length-1]==='') command.pop();
    	ITPsetting(command);

      }
 });
});
