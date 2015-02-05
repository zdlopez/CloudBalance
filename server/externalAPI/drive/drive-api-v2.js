var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var secrets = require('../../secrets/drive.secret');
var Promise = require('bluebird');
var drive = google.drive('v2');
var oauth2Client = new OAuth2(secrets.CLIENT_ID, secrets.CLIENT_SECRET, secrets.REDIRECT_URL);

google.options({ auth: oauth2Client });

var getRoot = Promise.promisify(drive.about.get); //result.rootFolderId
var getFile = Promise.promisify(drive.files.get);
var getChildren = Promise.promisify(drive.children.list);
var getFileList = Promise.promisify(drive.files.list);



module.exports.getDriveFiles = function(accessToken) {

	oauth2Client.setCredentials({
	  access_token: accessToken
	});

	var list = [];
	var allFiles = {};


	var addFileToList = function(file) { //takes in an object with an 'id' property
		var fileId = file.fileID;
		getChildren({folderId: fileId})
		.then(function(results) {
			if (list.length === 0) {list.push(file);}
			var children = results[0].items;
			file.children = [];
			children.forEach(function(child) {
				var childID = child.id;
				file.children.push(allFiles[childID]);
			});
			return file.children;
		})
		.then(function(children) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i];
				addFileToList(child);
			}
		});
	};

	var parseFiles = function(filesArr){
		var fileHash = {};
		var structureHash = {};
		var myfiles = [];
		var level = myfiles;
		var dirLevel = filesArr[filesArr.length -1].parents[0].id;

		//reverse order to start with nested directories
		for (var i = filesArr.length - 1; i >= 0; i--){
			var gFile = filesArr[i];
			var file = {};

			//if it is a dir, add to fileHash
			if(gFile.mimeType === 'application/vnd.google-apps.folder'){
				fileHash[gFile.id] = '/' + gFile.title;
				if(!gFile.parents[0].isRoot){
					fileHash[gFile.id] = fileHash[gFile.parents[0].id] + '/' + gFile.title;
				}
				file.files = [];
				structureHash[fileHash[gFile.id]] = myfiles.length;
			}

			file.name = gFile.title;
			file.meta = {};
			file.meta.gId =  gFile.id;
			file.meta.rev = gFile.headRevisionId;
			file.meta.thumb_exists = true;

			file.meta.path = gFile.parents[0].isRoot ? '/' + file.name : fileHash[gFile.parents[0].id] + '/' + file.name;
			file.meta.is_dir = gFile.mimeType === 'application/vnd.google-apps.folder' ? true : false;
			file.meta.icon = gFile.thumbnailLink;
			file.meta.read_only = !gFile.editable;
			file.meta.modifier = null;
			file.meta.bytes = gFile.fileSize;
			file.meta.modified = gFile.modifiedDate;
			file.meta.size = gFile.fileSize;

			file.root = 'drive';
			file.mimeType = gFile.mimeType;
			file.revision = gFile.version;

			//push files in sequence
			myfiles.push(file);

		}

		//iterate through sequential files, placing them back into proper directory depth structure
		var result = [];
		for(var j = 0; j < myfiles.length; j++){
			var folder = myfiles[j].meta.path.replace('/' + myfiles[j].name, '');
			var res = structureHash[folder];
			if(res !== undefined){
				myfiles[res].files.push(myfiles[j]);
			} else {
				result.push(myfiles[j]);
			}
		}

		return result;
	}

	return getFileList() 
	.then(function(result) {
		var myGFiles = parseFiles(result[0].items);
		//console.log('postParse is', myGFiles);
		//need to pass myGFiles to appropriate place
		return myGFiles;
	});

}
