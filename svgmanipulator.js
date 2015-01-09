var SVG_NS = "http://www.w3.org/2000/svg";
var INKSCAPE_NS = "http://www.inkscape.org/namespaces/inkscape";


// Note: it seems like I'm forced to use namespaces the wrong way in 
//       order to get the correct output. Seems like an implementation 
//       problem


exports.processSvg = function(svgDocument) {

	var svg = svgDocument.documentElement;
	svg.setAttributeNS('http://www.w3.org/2000/xmlns/', "xmlns:inkscape", INKSCAPE_NS);
	
	var background = createLayer(svgDocument, "Background");
	var landMass = createLayer(svgDocument, "Land");
	
	var firstElement = null;
	var children = svg.childNodes;
	for (var i = 0; i < children.length; i++) {
		if (children[i].tagName == 'g') {
			firstElement = children[i];
			break;
		}
	}
	
	svg.insertBefore(background, firstElement);
	svg.insertBefore(landMass, firstElement);
	
}


var createLayer = function(svgDocument, name) {
	var layer = svgDocument.createElement("g");
	layer.setAttribute("inkscape:groupmode", "layer");
	layer.setAttribute("inkscape:label", "name");
	layer.setAttribute("id", "label" + name);
	return layer;
}