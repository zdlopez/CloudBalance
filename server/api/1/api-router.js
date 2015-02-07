var pathToServerRoot = '../..';
var jwt = require('jwt-simple');
var jwtSecret = require(pathToServerRoot + '/secrets/jwt.secret');
var express = require('express');
var apiRouter = express.Router();
var dropboxAPI = require('../../externalAPI/dropbox/dropbox-api-v1.js');
var driveAPI = require('../../externalAPI/drive/drive-api-v2.js');
var formidable = require('formidable');

/**
drive api router is expecting a 'req.body.driveAccessToken' or a '
req.body.driveRefreshToken' to the '/driveFiles' route as specified in
externalApi/drive/drive-api-v2.js
*/
apiRouter.all('*', function(req, res, next) {
  req.headers.drivetoken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.InlhMjkuRWdIZC1waTF0dWtFNllrZmdMSUtXcHdzdVVRandhTmhNXzhwZ0hVTjlKQi1pcEpNVGNLbWZsMXhFWjJMYjYxSUxNS2JHNXN5ZDVtRUh3Ig.WcCf7Oij67Gt0lWzH25j_1q1dQjOAwQzSUyzRVE89LI";
  req.headers.dropboxtoken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.InMtR2MyTzBDTDVzQUFBQUFBQUFBRkxOaHQyajJBYm9SdW4zejB5aXNMWXJkSWFkQkFsYjdzOHh4VUN6Y3FKMXci.erC034OKhXGnOHQebLZhr7MQTTzl7TQNAh5H8-xDLW8";
  req.tokens = {
    
    drive : jwt.decode(req.headers.drivetoken, jwtSecret.secret),
    dropbox : jwt.decode(req.headers.dropboxtoken, jwtSecret.secret)
  };
  next();
});



apiRouter.get('/getDropboxFiles', function(req, res) {
  var fileDirectories = {};

  console.log("TOKEN", req.tokens.dropbox);

  dropboxAPI.getDelta('/', req.tokens.dropbox)
  .then(function(data) {
    fileDirectories = data;

    res.set('Content-Type', 'application/json')
    .status(200).end(JSON.stringify(fileDirectories));
  });

});

apiRouter.get('/getDriveFiles', function(req, res) {
  var fileDirectories = {};


  driveAPI.getDriveFiles(req.tokens.drive)
    .then(function(data) {
      fileDirectories = data;
      res.set('Content-Type', 'application/json')
      .status(200).end(JSON.stringify(fileDirectories));
      }
    );

});


apiRouter.get('/getAllFiles', function(req,res) {
  var fileDirectories = {};
  var unresolved = 2;

  driveAPI.getDriveFiles(req.tokens.drive)
    .then(function(data) {
      fileDirectories.google = data;
      unresolved--;
      if(unresolved === 0) {
        res.set('Content-Type', 'application/json')
        .status(200).end(JSON.stringify(fileDirectories));
      }
    });

  dropboxAPI.getDelta('/', req.tokens.dropbox)
  .then(function(data) {
    fileDirectories.dropbox = data;
    unresolved--;
    if(unresolved === 0) {
      res.set('Content-Type', 'application/json')
      .status(200).end(JSON.stringify(fileDirectories));
    }
  });
  
});

apiRouter.get('/moveToDrive', function(req, res){
  //download from dropbox to server

  //upload to drive
  driveAPI.uploadFileServer(req.tokens.drive, filename, type, size )
  .then(function(data){
    //console.log('winner', data);
    res.writeHead(201, {'Content-Type': 'text/html'});
    res.write('Moved to Drive');
    res.end();
  })

});

apiRouter.get('/moveToDropbox', function(req, res){
  //download from drive to server

  //upload to drive
  dropboxAPI.uploadFileServer(req.tokens.dropbox, filename, type, size )
  .then(function(data){
    //console.log('winner', data);
    res.writeHead(201, {'Content-Type': 'text/html'});
    res.write('Moved to Dropbox');
    res.end();
  })

});

apiRouter.get('/moveFiles', function(req,res) {
  console.log('im here');
  // dropboxAPI.uploadFileServer(req.tokens.dropbox, null, null )
  // .then(function(data){
  //   console.log('winner', data);
  // })
  driveAPI.uploadFileServer(req.tokens.drive, null, null )
  .then(function(data){
    console.log('winner', data);
  })
});

apiRouter.post('/uploadFile', function(req, res) {

  // formidable to parse multi-part form
  var form = new formidable.IncomingForm();

  form.parse(req, function(err, fields, files) {
    if (err) {
      throw err;
    }

    // route to right cloud service api
    if (Object.keys(files)[0] === 'Dropbox') { // send data to dropbox api
      dropboxAPI.uploadFile(req.tokens.dropbox, files, 'Dropbox')
      .then(function (data) {
        res.writeHead(201, {'Content-Type': 'text/html'});
        res.write('Received Upload');
        res.end();
      });
    } else { // send data to google api
      driveAPI.uploadFile(req.tokens.drive, files, 'Google')
      .then(function (data) {
        res.writeHead(201, {'Content-Type': 'text/html'});
        res.write('Received Upload');
        res.end();
      });
    }

  });
  
  // form.on('end', function() {
  //   // response to client
  //   res.writeHead(201, {'Content-Type': 'text/html'});
  //   res.write('Received Upload');
  //   res.end();
  // });

});

module.exports = apiRouter;
