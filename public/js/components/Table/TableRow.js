var React = require('react');
var fileUtil = require('../../utils/fileUtil.js');
var FileType = require('../File/FileType.js');
var FileSize = require('../File/FileSize.js');
var Modified = require('../File/Modified.js');
var Actions = require('../../actions/Actions');

var IntlMixin     = ReactIntl.IntlMixin;
var FormattedDate = ReactIntl.FormattedDate;

module.exports = React.createClass({

  mixins: [IntlMixin],

  handleClick: function(event) {
    event.preventDefault();
    if (this.props.file.meta.is_dir) {
      Actions.enterFolder(this.props.file.name, this.props.cloudService);
    } else {
      console.log('FILE');
    }
  },

  render: function() {
    var file = this.props.file;
    var icon = 'img/icons/' + fileUtil.icon(file);
    return (
        <tr>
          <td>
            <a href={'#'} onClick={this.handleClick}>
              <img src={ icon } className={'icon'} />
              { file.name } 
            </a>
          </td>
          <FileType file={file} />
          <FileSize file={file} />
          <Modified file={file} />
        </tr>
    );
  }

});
