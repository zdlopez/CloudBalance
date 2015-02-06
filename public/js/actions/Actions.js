// app-actions.js
var AppDispatcher = require('../dispatcher/appDispatcher.js');
var AppConstants = require('../constants/appConstants.js');

var AppActions = {
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
  }


};

module.exports = AppActions;
