var pathToServerRoot = '../..';
var jwt = require('jwt-simple');
var jwtSecret = require(pathToServerRoot + '/secrets/jwt.secret');
var express = require('express');
var apiRouter = express.Router();
var dropboxAPI = require('../../externalAPI/dropbox/dropbox-api-v1.js');
var driveAPI = require('../../externalAPI/drive/drive-api-v2.js');
var downloadApi = require('../../externalAPI/download.js');
var fs = require('fs');
var path = require('path');

/**
drive api router is expecting a 'req.body.driveAccessToken' or a '
req.body.driveRefreshToken' to the '/driveFiles' route as specified in
externalApi/drive/drive-api-v2.js
*/
apiRouter.all('*', function(req, res, next) {
  req.tokens = {
    drive : jwt.decode(req.headers.drivetoken, jwtSecret.secret),
    dropbox : jwt.decode(req.headers.dropboxtoken, jwtSecret.secret)
  };
  next();
});

apiRouter.get('/getDropboxFiles', function(req, res) {
  var fileDirectories = {};

  dropboxAPI.getDelta('/', req.tokens.dropbox)
  .then(function(data) {
    fileDirectories.dropbox = data;

    res.set('Content-Type', 'application/json')
    .status(200).end(JSON.stringify(fileDirectories));
  });

});

//******************************************************************************** START
apiRouter.get('/getsomestuff', function(req, res) {
  var downloadFilePath = path.join(__dirname, 'GettingStarted.pdf');
  res.download(downloadFilePath, function(err){
      if(err){
        console.log('Error is: ',err);
      }else{
        console.log('No Error from res.download');
      }
    });
});

/****************************************************************************************
ROUTE: '/downloadFile' 
A call to this route will return the link to the file on Dropbox which can be appended
to an anchor tag on the front-end.  
****************************************************************************************/
apiRouter.get('/downloadFile', function(req, res){
  downloadApi.getDropboxFileUrl(req.headers.path, req.tokens.dropbox)
  .then(function(data) {
    console.log('#################', data);
    res.send(data);
  });
});

/****************************************************************************************
ROUTE: '/saveFileToServer' 
A call to this route will make a call to the 'saveDropboxFileToServer' function in the
'downloadApi' module which is responsible for saving the data on the local server. 
****************************************************************************************/
apiRouter.get('/saveFileToServer', function(req, res){
  downloadApi.saveDropboxFileToServer(req.headers.path, req.tokens.dropbox)
  .then(function(data) {
    // var downloadFilePath = path.join(__dirname, '../../' ,'katie.jpg');
    var downloadFilePath = path.join('https://localhost:8000/server/','katie.jpg');
    console.log('file path is ',downloadFilePath);
    res.send(downloadFilePath);
    /*res.download(downloadFilePath, function(err){
      if(err){
        console.log('Error is: ',err);
      }else{
        console.log('No Error from res.download');
      }
    });*/
    /*res.setHeader("Content-Disposition", 'attachment; filename="GettingStarted.pdf"');
    res.sendFile(path.join(__dirname, 'GettingStarted.pdf'), function(err){
      if(err){console.log('error is: ',err);}
        else{console.log('no error');}
    });*/
  });
});

//******************************************************************************** END


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

  dropboxAPI.getFileDirectories('/', -1, req.tokens.dropbox)
  .then(function(data) {
    fileDirectories.dropbox = data;
    unresolved--;
    if(unresolved === 0) {
      res.set('Content-Type', 'application/json')
      .status(200).end(JSON.stringify(fileDirectories));
    }
  });
  
});

apiRouter.get('/moveFiles', function(req,res) {
  //From Client:
    //fromService
    //fromLocation
    //toService
    //toLocation
    //fileID
    //fileLink: Optional for now. i assume the fileID is what we need to find the file, not hte fileLink.
  //server Actions:
    //lookup api object associated with fromService
    //download file, save in memory temporarily
    //lookup api object associated with toService
    //post the file to that service
    //on success, delete the file from it's original location.
      //this prevents us from deleting the file when we have network errors that interrupt saving it to the new location
    //on success from that, redirect to /1/getAllFiles

    //this is designed to be modular enough to allow us to move the file from the same service to itself.
    //it may be easier to build in some logic to see if fromService and toService are the same. if they are, we can then issue a move command to that api, rather than the steps outlined above.
    //however, MVP is whichever is easiest, and I have a feeling that the path outlined above is going to easiest since it will work for all cases.
  });

module.exports = apiRouter;
