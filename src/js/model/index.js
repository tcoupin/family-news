
var Files = require('./files');
var Folders = require('./folders');
var Videos = require('./videos');
var Images = require('./images');
var Messages = require('./messages');


// SETUP Dependencies
/*
Folders => images
		=> videos
		=> messages
*/
Folders._setImages(Images);
Folders._setVideos(Videos);
Folders._setMessages(Messages);
/*
Videos  => folders
		=> files
*/
Videos._setFolders(Folders);
/*
Images  => folders
		=> files
*/
Images._setFolders(Folders);

module.exports = {
	files: Files,
	folders: Folders,
	images: Images,
	users: require('./users'),
	videos: Videos,
	messages: Messages
}