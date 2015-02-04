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
  }

};

module.exports = AppActions;
