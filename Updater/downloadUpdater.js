var async = require('async');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;

function download(arg){
var ev = new EventEmitter();
    var spawn = require('child_process').spawn;
    var downloadjob = spawn('/usr/bin/wget',[arg]); 

	downloadjob.on('exit', function (data) {
	ev.emit('done',data);
	});

	downloadjob.stdout.on('data', function (data) {
	//console.log('downloadStdout: '+data);
	//if( data.indexOf('saved')>=0) ev.emit('done',data);
	});

	downloadjob.stderr.on('data', function (data) {
	//console.log('downloadError: '+arg);
	//console.log('downloadError: '+data);
	//ev.emit('done',data);
	});
	return ev;
}

function index_check(arg){
var ev = new EventEmitter();
    var spawn = require('child_process').spawn;
    var job =  spawn('/usr/bin/diff',['index.html','index.html-']); 

	job.stdout.on('data', function (data) {
//    console.log('job: ' + data);
    if(data != '') ev.emit('done',true);
	else ev.emit('done',false);
	});
	job.stderr.on('data', function (data) {
//    console.log('stderr: ' + data);
	ev.emit('done',data);
	});
	return ev;
};


function updater_download(file){
    var ev = new EventEmitter();
    var path = require("path"); 
    	if( !path.existsSync(cfile) ){
	var cfile = updaterName(file);
     	download([file,'-O '+updaterName(file)]).on('done',function(res) {
        ev.emit('done');
    	});
      	} else ev.emit('done');
    return ev;
};

function mv_updater(file){
var ev = new EventEmitter();
    var spawn = require('child_process').spawn;
    var job =  spawn('/home/pi/Node/Updater/mvfile',[file,'/mnt/updaters/'+file]); 
	job.stdout.on('data', function (data) {
//    console.log('job: ' + data);
	ev.emit('done',data);
	});
	job.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
	ev.emit('done',data);
	});
    return ev;
};
function mv_index(){
var ev = new EventEmitter();
    var spawn = require('child_process').spawn;
    var job =  spawn('/home/pi/Node/Updater/mvfile',['index.html','index.html-']); 
	job.stdout.on('data', function (data) {
//    console.log('job: ' + data);
	ev.emit('done',data);
	});
	job.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
	ev.emit('done',data);
	});
    return ev;
};

function updater_download(file){
    var ev = new EventEmitter();
    download(file).on('done',function(res) {
        ev.emit('done');
        }
    );
        return ev;
};

function HTTPupdaterName(file){                                                 
if(file.indexOf('http')>=0){                                                    
        var st=file.indexOf('http');                                            
        var ed=file.indexOf('taz');                                             
        var cfile=file.substr(st,ed-st+3);                                      
        return cfile;                                                           
        }                                                                       
};                                                                               
                                                                                
function updaterName(file){                                                     
if(file.indexOf('itelepass')>=0){                                               
        var st=file.indexOf('itelepass');                                       
        var ed=file.indexOf('taz');                                             
        var cfile=file.substr(st,ed-st+3);                                      
        return cfile;                                                           
        }                                                                       
};                                                                               

var list=[];

function find_latest(array){
//
//itelepass2update150212.taz
	var i=0, j=0;
	var late=[];
	for(i=0;i<array.length;i++){
           if(array[i].indexOf('updater')>=0){
              var st=array[i].indexOf('updater');
              var ed=array[i].indexOf('.taz');
        //    console.log(data[i]+' st '+st+' dt '+ed);
                late[i] = array[i].substr(st+7,ed-(st+7));
		}
	}
	var max=0;
	for(i=0;i<array.length;i++){
	if( late[i]){
	if( late[i] > max ){
		 max = late[i];
		j = i;
			}	
		}
	}
console.log('LatestUpdater '+array[j]);
	return array[j];// latest updater name
}

function index_download(){
    var ev = new EventEmitter();
//   download(['http://download.itplants.com/dl/updaters/index.html','-O index.html']).on('done',function(res) {
    download(['http://download.itplants.com/dl/updaters/index.html']).on('done',function(res) {
    //
    fs.readFile('index.html', 'utf8', function (err, text) {
        if(err){
            console.log('fileRead Error:'+err);
            return 'ERROR';
        } else {
            // parse data
            //    console.log('|'+text+'|');
            var data=text.split('\n');
            //    console.log(data);
            for(var i=0;i<data.length;i++){
		
                if(data[i].indexOf('http')>=0){
                    var st=data[i].indexOf('http');
                    var ed=data[i].indexOf('taz');
        //    console.log(data[i]+' st '+st+' dt '+ed);
                var file = data[i].substr(st,ed-st+3);
                list = file.split('\n');
            ev.emit('done');
                        }// 
                }// nex i
            }// else
        }// readFile
    )}
)
                return ev;
};

mv_index().on('done',function(){
// main
var chk = false;
        index_download().on('done',function(){
//        console.log('index_download done');
//        console.log('index_check');
	//
            chk = index_check(['index.html','index.html-']).on('done',function(){
//            console.log('index_check done');
            console.log('index_check '+chk);
	//
              if(chk){
		// if file is arry then search latest updater
		//
		var latest='';
		latest=find_latest(list); 
		updater_download(latest).on('done',function(){
			mv_updater(updaterName(latest)).on('done',function(){
    console.log('mv_updater done');
		            	});
		            });
                }
            });
        });
});

