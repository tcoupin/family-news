if (conf.data_path == undefined){
	// use mongodb as default storage engine
	module.exports = require('./files_gridfs.js')(conf.mongodb);
} else if (conf.data_path.indexOf('/') == 0){
	module.exports = require('./files_fs.js')(conf.data_path);
} else if (conf.data_path.indexOf('mongodb://') == 0){
	module.exports = require('./files_gridfs.js')(conf.data_path);
} else {
	return null;
}