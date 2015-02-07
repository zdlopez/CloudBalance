var https = require('https');
var bPromise = require('bluebird');
var fs = require('fs');
var bodyParser = require('body-parser');

var downloadApi = {};

downloadApi.getDropboxFileUrl = function (path, accessToken){
  var downloadHostUrl = 'api.dropbox.com';
  var downloadPathUrl = '/1/media/auto' + path;

  //GET request options
  options = {
    hostname: downloadHostUrl,
    path: downloadPathUrl,
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
    }
  };

  return new bPromise(function tokenRequest(resolve, reject){
    var req = https.request(options, function(response) {
      var body = '';
      response.on('data', function(data){
        body += data;
      })
      response.on('end', function(){
        body = JSON.parse(body);
        var url = body.url;
        resolve(url);
      })
    });
    req.end();
  });
};

downloadApi.saveDropboxFileToServer = function (path, accessToken){
  var fileName = path.slice(path.lastIndexOf('/') + 1);
  var downloadHostUrl = 'api-content.dropbox.com';
  var downloadPathUrl = '/1/files/auto' + path;

  //GET request options
  var options = {
    hostname: downloadHostUrl,
    path: downloadPathUrl,
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
    }
  };

  return new bPromise(function tokenRequest(resolve, reject){
    var req = https.request(options, function(response) {
      var data = '';
      response.setEncoding('binary');

      response.on('data', function (chunk) {
        data += chunk;
      });

      response.on('end', function () {
        data = new Buffer(data, 'binary');
        fs.writeFile(fileName, data, function(err){
          if(err){
            console.log('error writing file', err);
          }else{
            console.log('File has been written!!!');
          }
        });

        if(response.statusCode < 200 || response.statusCode >= 300) {
          reject(data);
        } else {
          var obj = {
            'fileName': fileName
          };
          resolve(obj);
        }
      });
    });

    req.end();
  });
};


module.exports = downloadApi;