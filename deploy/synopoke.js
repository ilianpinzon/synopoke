﻿var childProcess = require('child_process');
var fs = require('fs');
var http = require('http');

var LatestEpisodePath = '/root/latest_episode';

var host = process.argv[2];
var port = process.argv[3];
var apiKey = process.argv[4];
var restartAfter = parseInt(process.argv[5]);

function index(episodes) {
    if (episodes != null && episodes.length > 0) {
        var episodesNum = episodes.length;
        for (var i = 0; i < episodesNum; ++i) {
            childProcess.execFile('/usr/syno/bin/synoindex', ['-a', episodes[i].data.importedPath]);
            console.log('indexing ' + episodes[i].data.importedPath);
        }

        fs.writeFile(LatestEpisodePath, episodes[0].date);
    }

    start(restartAfter);
}

function findLastValidEpisode(episodes, until) {
    var i = episodes.length - 1;

    if (i >= 0) {
        for (i; i >= 0; --i) {
            if (new Date(episodes[i].date) > until) {
                return i;
            }
        }
    }

    return -1;
}

function indexCompletedImpl(episodes, page, until) {
    var request = http.request({
        host: host,
        port: port,
        path: '/api/History?&pageSize=1&sortKey=date&sortDir=desc&filterKey=eventType&filterValue=3' + '&page=' + page + '&apiKey=' + apiKey
    }, function (response) {
        var rawData = '';

        response.on('data', function (chunk) {
            rawData += chunk;
        });

        response.on('end', function () {
            var response = JSON.parse(rawData);

            var lastValidIndex = findLastValidEpisode(response.records, until);
            if (lastValidIndex >= 0) {
                var validSlice = response.records.slice(0, lastValidIndex + 1);

                var sliceNum = validSlice.length;
                for (var i = 0; i < sliceNum; ++i) {
                    episodes.push(validSlice[i]);
                }

                indexCompletedImpl(episodes, page + 1, until);
                return;
            }

            index(episodes);
        });
    });

    request.end();
}

function indexCompleted(until) {
    var episodes = [];
    indexCompletedImpl(episodes, 1, until);
}

if (!(host && port && apiKey) || isNaN(restartAfter)) {
    console.log("Usage: node synopoke.js <host> <port> <apiKey> <restartAfter>");
    process.exit(1);
}

function start(timeout) {
    setTimeout(function () {
        fs.readFile(LatestEpisodePath, 'utf8', function (err, data) {
            if (err) {
                console.log('Unable to load ' + LatestEpisodePath);
                console.log('Scanning for downloads within today...');

                var today = new Date();
                today.setHours(0, 0, 0, 0);
                indexCompleted(today);
            } else {
                var latestEpisode = new Date(data);

                if (isNaN(latestEpisode.getTime())) {
                    console.log(LatestEpisodePath + ' has invalid data');
                    console.log('Scanning for downloads within today...');

                    var today = new Date();
                    today.setHours(0, 0, 0, 0);
                    indexCompleted(today);
                } else {
                    console.log('Scanning for downloads until ' + latestEpisode.toString());
                    indexCompleted(latestEpisode);
                }
            }
        });
    }, timeout);
}

process.on('uncaughtException', function (err) {
    console.log('Ooops, that didn\'t work:');
    console.log(err);
    console.log('Restarting in ' + restartAfter + 'ms...');
    start(restartAfter);
});

start(0);
//# sourceMappingURL=synopoke.js.map
