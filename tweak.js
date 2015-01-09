var fs = require('fs');
var xmldom = require('xmldom');
var DOMParser = xmldom.DOMParser;
var svgManipulator = require('./svgmanipulator');

var tweakFile = function(fileName) {
	if (fs.existsSync(fileName)) {
		console.log('tweaking file ' + fileName);
		
		var xml = fs.readFileSync(fileName, { "encoding": "UTF-8" });
		var document = new DOMParser().parseFromString(xml);
		
		svgManipulator.processSvg(document);
		
//		console.log(document.toString());

		var xs = new (xmldom.XMLSerializer)();
        var documentAsString = xs.serializeToString(document);		
		fs.writeFileSync("/tmp/sample.svg", documentAsString);
		
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
