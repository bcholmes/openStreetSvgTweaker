var fs = require('fs');
var DOMParser = require('xmldom').DOMParser;

var tweakFile = function(fileName) {
	if (fs.existsSync(fileName)) {
		console.log('tweaking file ' + fileName);
		
		var xml = fs.readFileSync(fileName, { "encoding": "UTF-8" });
//console.log('' + (typeof xml));		
		var document = new DOMParser().parseFromString(xml);
		
		console.log(document.toString());
		
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
