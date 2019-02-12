#!/usr/bin/env node
var fs   = require('fs');
var http = require('http');
var md   = require('markdown');

var fs = require('fs');
// リクエストの処理
    fs.readFile('http://download.itplants.com/dl/updaters/index.html', 'UTF-8',
        function(err, html) {
            console.log(html);
        });
