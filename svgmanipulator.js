var SVG_NS = "http://www.w3.org/2000/svg";
var INKSCAPE_NS = "http://www.inkscape.org/namespaces/inkscape";


// Note: it seems like I'm forced to use namespaces the wrong way in 
//       order to get the correct output. Seems like an implementation 
//       problem


exports.processSvg = function(svgDocument) {

	var svg = svgDocument.documentElement;
	svg.setAttributeNS('http://www.w3.org/2000/xmlns/', "xmlns:inkscape", INKSCAPE_NS);
	
	var firstElement = null;
	var children = svg.childNodes;
	for (var i = 0; i < children.length; i++) {
		if (children[i].tagName == 'g') {
			firstElement = children[i];
			break;
		}
	}
	
	var layers = [];
	
	svg.insertBefore(createLayer(svgDocument, "Background", layers), firstElement);
	svg.insertBefore(createLayer(svgDocument, "Land", layers), firstElement);
	svg.insertBefore(createLayer(svgDocument, "Roads", layers), firstElement);
	svg.insertBefore(createLayer(svgDocument, "Features", layers), firstElement);
	svg.insertBefore(createLayer(svgDocument, "RoadLabels", layers), firstElement);
	svg.insertBefore(createLayer(svgDocument, "Text", layers), firstElement);
	
	moveAllChildren(firstElement, layers);
}


var moveAllChildren = function(node, layers) {

	var isFirstChild = true;
	while (node.childNodes.length > 0) {
		var child = node.childNodes[0];

		node.removeChild(child);
		if (!child.tagName) {
		} else if (isFirstChild) {
			var layer = findLayer(node, 'Background', layers);
			layer.appendChild(child);
			isFirstChild = false;
		} else if (child.tagName == 'g' && isWhiteText(child)) {
			var layer = findLayer(node, 'RoadLabels', layers);
			layer.appendChild(child);
		} else if (child.tagName == 'g') {
			var layer = findLayer(node, 'Text', layers);
			layer.appendChild(child);
		} else if (child.tagName == 'path' && isNoFill(child) && isLineCapRound(child)) {
			var layer = findLayer(node, 'Roads', layers);
			layer.appendChild(child);
		} else if (isLandColour(child)) {
			var layer = findLayer(node, 'Land', layers);
			layer.appendChild(child);
		} else {
			var layer = findLayer(node, 'Features', layers);
			layer.appendChild(child);
		}
	}

}

var isWhiteText = function(element) {
	var style = element.getAttribute("style");
	return style != null && style.indexOf("100%,100%,100%") >= 0;
}

var isLandColour = function(element) {
	var style = element.getAttribute("style");
	return style != null && style.indexOf("fill:rgb(94.901961%,93.72549%,91.372549%)") >= 0;
}

var isLineCapRound = function(element) {
	var style = element.getAttribute("style");
	return style != null && style.indexOf("stroke-linecap:round") >= 0;
}

var isNoFill = function(element) {
	var style = element.getAttribute("style");
	return style != null && style.indexOf("fill:none") >= 0;
}


var findLayer = function(element, layerName, layers) {
	var result = null;
	layers.forEach(function(layer) {
		if (layer.getAttribute('id') == ("layer" + layerName)) {
			result = layer;
		}
	});
	return result;
}

var createLayer = function(svgDocument, name, layers) {
	var layer = svgDocument.createElement("g");
	layer.setAttribute("inkscape:groupmode", "layer");
	layer.setAttribute("inkscape:label", name);
	layer.setAttribute("id", "layer" + name);
	layers.push(layer);
	return layer;
}