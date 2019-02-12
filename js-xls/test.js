var fs = require('fs');
var CronJob=null;
var job=new Array();
var csvArray = new Array();

function makeJobs(array){
var n=array.length;
var CronJob = require('cron').CronJob;

for(var i=1;i<n;i++){
var time=array[i][0].split(':');
var ctime = '00 '+time[0]+' '+time[1]+' * * *';
console.log('time='+ctime);

job[i] = new CronJob({
  cronTime: ctime,
  onTick: function() {
	console.log('do job');
  },
  start: false,
});

	job[i].start();
	}
}


fs.readFile('./controlTable.csv', 'utf8', function (err, text) {
	if( err ) console.log(err);
    	else {
	//console.log(text);
	createArray(text);
	makeJobs(csvArray);
	}
});

function createArray(csvData) {
    var tempArray = csvData.split("\n");
    for(var i = 0; i<tempArray.length;i++){
    csvArray[i] = tempArray[i].split(",");
    }
//    console.log(csvArray);

// title
    console.log(csvArray[0]);
// data[0]
    console.log(csvArray[1]);
// time[0]
    console.log(csvArray[1][0]);
}
