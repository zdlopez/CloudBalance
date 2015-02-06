// app-actions.js
var AppDispatcher = require('../dispatcher/appDispatcher.js');
var AppConstants = require('../constants/appConstants.js');

var Actions = {
  // HAVE THESE ACTIONS ALIGN WITH CLIENT-SERVER API
  //FIX: modify to be 'move item'
  updateLevels: function(levels, cloudService) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.UPDATE_LEVELS,
      levels: levels,
      cloudService: cloudService
    })
  },

  enterFolder: function(folderName, cloudService) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.ENTER_FOLDER,
      folderName: folderName,
      cloudService: cloudService
    })
  },

  getAllFiles: function(cloudService) {
    console.log('getting all', cloudService);
    var urls = {
      'Dropbox': 'api/1/getDropboxFiles',
      'Google': 'api/1/getDriveFiles'
    }

    $.ajax({
      url: urls[cloudService],
      headers: {
        'driveToken': sessionStorage.getItem('driveToken'),
        'dropboxToken' : sessionStorage.getItem('dropboxToken')
      },
      dataType: 'json',
      type: 'GET',
      success: function(data) {
        AppDispatcher.handleViewAction({
          actionType: AppConstants.UPDATE_FILES,
          files: data,
          cloudService: cloudService
        })
      },
      error: function(xhr, status, err) {
        console.error('api/1/getAllFiles', status, err.toString());
      }
    });   
  },


  downloadFile: function(file, cloudService) {
    var urls = {
      'Dropbox': 'api/1/getDropboxFiles',
      'Google': 'api/1/getDriveFiles'
    }

    $.ajax({
      url: 'https://api-content.dropbox.com/1/files/auto' + file.meta.path,
      headers: {
        'Authorization': 'Bearer ' + 'ssB5i7ETx3oAAAAAAAAAOzlUBKDgrDpk6AlHIVBt_eKq0RU7aZXk1tHknsJjFA6u',
        'Content-Type': file.meta.mime_type
      },
      crossDomain: true,
      type: 'GET',
      success: function(response, status, xhr) {
        // check for a filename
        var filename = file.name;
        var disposition = xhr.getResponseHeader('Content-Disposition');
        if (disposition && disposition.indexOf('attachment') !== -1) {
            var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            var matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
        }


        var type = xhr.getResponseHeader('Content-Type');
        var blob = new Blob([response], { type: type });

        if (typeof window.navigator.msSaveBlob !== 'undefined') {
            // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
            window.navigator.msSaveBlob(blob, filename);
        } else {
            var URL = window.URL || window.webkitURL;
            var downloadUrl = URL.createObjectURL(blob);

            if (filename) {
                // use HTML5 a[download] attribute to specify filename
                var a = document.createElement("a");
                // safari doesn't support this yet
                if (typeof a.download === 'undefined') {
                    window.location = downloadUrl;
                } else {
                    a.href = downloadUrl;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                }
            } else {
                window.location = downloadUrl;
            }

            setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
        }
      },
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }
    });   
  },

  uploadFile: function(file, cloudService) {
    var data = new FormData();
    data.append(cloudService, file);

    $.ajax({
      url: 'api/1/uploadFile',
      type: 'POST',
      data: data,
      cache: false,
      dataType: 'text',
      processData: false, // don't process files
      contentType: false, // set to false as jQuery will tell the server its a query string request
      headers: {
        'driveToken': sessionStorage.getItem('driveToken'),
        'dropboxToken' : sessionStorage.getItem('dropboxToken')
      },
      success: function(data) {
        console.log(data);
        Actions.getAllFiles(cloudService);
      },
      error: function(data) {
        console.log('Error Uploading');
      }
    });
  }


};

module.exports = Actions;
