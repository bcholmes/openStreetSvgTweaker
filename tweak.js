var fs = require('fs');
var xmldom = require('xmldom');
var DOMParser = xmldom.DOMParser;
var svgManipulator = require('./svgmanipulator');

var tweakFile = function(fileName, output) {
	if (fs.existsSync(fileName)) {
		console.log('tweaking file ' + fileName);
		
		var xml = fs.readFileSync(fileName, { "encoding": "UTF-8" });
		var document = new DOMParser().parseFromString(xml);
		
		svgManipulator.processSvg(document);
		
//		console.log(document.toString());

		var xs = new (xmldom.XMLSerializer)();
        var documentAsString = xs.serializeToString(document);		
		fs.writeFileSync(output, documentAsString);
		
	} else {
		console.log('file ' + fileName + ' does not exist');
	}	
};

var argv = require('minimist')(process.argv.slice(2));
console.dir(argv);

var output = argv["o"];
if (!output) {
	output = "/tmp/sample.svg";
}

var happened = false;
argv["_"].forEach(function (val, index, array) {
	tweakFile(val, output);
	happened = true;
});	

if (!happened) {
	console.log('No files specified.');
}
