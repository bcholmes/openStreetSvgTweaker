var fs = require('fs');

var tweakFile = function(fileName) {
	if (fs.existsSync(fileName)) {
		console.log('tweaking file ' + fileName);
	} else {
		console.log('file ' + fileName + ' does not exist');
	}	
};

var happened = false;
process.argv.forEach(function (val, index, array) {
	if (index > 1) {
		tweakFile(val);
		happened = true;
	}
});	

if (!happened) {
	console.log('No files specified.');
}
