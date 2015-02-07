/**
 * @jsx React.DOM
 */
// So build process knows to convert from JSX to JS

$(document).ready(function() {
  // This file bootstraps the entire application.

  var APP = require('./components/app.js');
  var React = require('react');

  //checks if the user has logged in or not. if so, it renders our APP
  if( sessionStorage.getItem('dropboxToken') && sessionStorage.getItem('driveToken') ) {
    React.render(
      <APP />,
      document.getElementById('main')
    );
    
  } else {
    //if not, it redirects to /login where our login flow begins
    console.log('dropboxToken and driveToken have not been found and we are redirecting to /login');
    window.location = "/login";
  }

  $('#download').on('click', function(){
    //This AJAX request gets the url of the file
    $.ajax({
      url: 'api/1/downloadFile',
      headers: {
        'path': '/GTY_Super_Bowl_show6_ml_150201_16x9_992.jpg',
        'driveToken': sessionStorage.getItem('driveToken'),
        'dropboxToken' : sessionStorage.getItem('dropboxToken')
      },
      type: 'GET',
      success: function(data){
        console.log('file link is: ', data);
      }
    });

    //This AJAX request downloads the file to the server
    $.ajax({
      url: 'api/1/saveFileToServer',
      headers: {
        'path': '/GTY_Super_Bowl_show6_ml_150201_16x9_992.jpg',
        'driveToken': sessionStorage.getItem('driveToken'),
        'dropboxToken' : sessionStorage.getItem('dropboxToken')
      },
      type: 'GET',
      success: function(data){
        console.log('download file path is: ', data);
        // window.open('https://localhost:8000/api/1/getsomestuff');
      }
    });
  });
});
