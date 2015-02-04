/**
 * @jsx React.DOM
 */
// So build process knows to convert from JSX to JS

$(document).ready(function() {

  var React = require('react');
  var App = require('./components/App.js');

  var render = function(cloudService) {
    React.render(
      <App cloudService={cloudService} />,
      document.getElementById(cloudService)
    );
  }

  render('Dropbox');
  render('Google');

  
});
