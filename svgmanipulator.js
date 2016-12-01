var SVG_NS = "http://www.w3.org/2000/svg";
var INKSCAPE_NS = "http://www.inkscape.org/namespaces/inkscape";


// Note: it seems like I'm forced to use namespaces the wrong way in 
//       order to get the correct output. Seems like an implementation 
//       problem


exports.processSvg = function(svgDocument, bw) {

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
	svg.insertBefore(createLayer(svgDocument, "Features", layers), firstElement);
	svg.insertBefore(createLayer(svgDocument, "BusinessArea", layers), firstElement);
	svg.insertBefore(createLayer(svgDocument, "GreenSpace", layers), firstElement);
	svg.insertBefore(createLayer(svgDocument, "Wooded", layers), firstElement);
	svg.insertBefore(createLayer(svgDocument, "Water", layers), firstElement);
	svg.insertBefore(createLayer(svgDocument, "Roads", layers), firstElement);
	svg.insertBefore(createLayer(svgDocument, "Survey Line", layers), firstElement);
	svg.insertBefore(createLayer(svgDocument, "Borders", layers), firstElement);
	svg.insertBefore(createLayer(svgDocument, "Road Labels", layers), firstElement);
	svg.insertBefore(createLayer(svgDocument, "Text", layers), firstElement);
	
	moveAllChildren(firstElement, layers, bw);
}


var moveAllChildren = function(node, layers, bw) {

	var isFirstChild = true;
	while (node.childNodes.length > 0) {
		var child = node.childNodes[0];

		node.removeChild(child);
		if (!child.tagName) {
		} else if (isFirstChild) {
			var layer = findLayer(node, 'Background', layers);
			layer.appendChild(child);
			isFirstChild = false;
		} else if (isWaterColour(child)) {
			var layer = findLayer(node, 'Water', layers);
			layer.appendChild(convertColor(child, bw));
		} else if (isRoadLabelText(child)) {
			var layer = findLayer(node, 'RoadLabels', layers);
			layer.appendChild(child);
		} else if (child.tagName == 'g' && isGreyText(child)) {
			var layer = findLayer(node, 'SurveyLine', layers);
			layer.appendChild(child);
		} else if (child.tagName == 'g') {
			var layer = findLayer(node, 'Text', layers);
			layer.appendChild(child);
		} else if (isBorderColour(child)) {
			var layer = findLayer(node, 'Borders', layers);
			layer.appendChild(convertColor(child, bw));
		} else if (isSurveyLine(child)) {
			var layer = findLayer(node, 'SurveyLine', layers);
			layer.appendChild(child);
		} else if (child.tagName == 'path' && isNoFill(child) && isLineCapRound(child)) {
			var layer = findLayer(node, 'Roads', layers);
			layer.appendChild(child);
		} else if (child.tagName == 'path' && isNoFill(child) && isWhiteStrokeText(child)) {
			var layer = findLayer(node, 'Text', layers);
			layer.appendChild(child);
		} else if (isRoadLabelLozenge(child) || isRoadLabelLozengeColor(child)) {
			var layer = findLayer(node, 'RoadLabels', layers);
			
			var siblings = findSiblingElements(child, 3);
			node.removeChild(siblings[1]);
			node.removeChild(siblings[2]);
			
			layer.appendChild(child);
			layer.appendChild(siblings[1]);
			layer.appendChild(siblings[2]);
		} else if (isBusinessAreaColour(child)) {
			var layer = findLayer(node, 'BusinessArea', layers);
			layer.appendChild(convertColor(child, bw));
		} else if (isParkColour(child)) {
			var layer = findLayer(node, 'GreenSpace', layers);
			layer.appendChild(convertColor(child, bw));
		} else if (isWoodedColour(child)) {
			var layer = findLayer(node, 'Wooded', layers);
			layer.appendChild(convertColor(child, bw));
		} else if (isLandColour(child)) {
			var layer = findLayer(node, 'Land', layers);
			layer.appendChild(convertColor(child, bw));
		} else {
			var layer = findLayer(node, 'Features', layers);
			layer.appendChild(convertColor(child, bw));
		}
	}

	var parent = node.parentNode;
	parent.removeChild(node);
}

var convertColor = function(element, bw) {
	if (bw) {
		var style = element.getAttribute("style");
		// land
		style = style.replace('fill:rgb(94.901961%,93.72549%,91.372549%)', 'fill:#ffffff');
		// border
		style = style.replace('stroke:rgb(67.45098%,27.45098%,67.45098%)', 'stroke:#222222');
		// water
		style = style.replace('stroke:rgb(70.980392%,81.568627%,81.568627%)', 'stroke:#999999');
		// park
		style = style.replace("fill:rgb(78.431373%,98.039216%,80%)", 'fill:#f0f0f0');

		element.setAttribute("style", style);
	}
	return element;
}

var isRoadLabelText = function(child) {
	return child.tagName == 'g' && isWhiteText(child);
}

var findSiblingElements = function(element, count) {
	var siblings = [];
	siblings.push(element);
	var latest = element;
	while (siblings.length < count && latest.nextSibling) {
		if (latest.nextSibling.tagName) {
			siblings.push(latest.nextSibling);
		}
		latest = latest.nextSibling;
	}
	return siblings;		
}

var isRoadLabelLozengeColor = function(element) {
	var style = element.getAttribute("style");
	return style != null && (style.indexOf("fill:rgb(93.333333%,93.72549%,84.313725%)") >= 0
		|| style.indexOf("fill:rgb(92.54902%,80.392157%,81.960784%)") >= 0
		|| style.indexOf("fill:rgb(95.294118%,89.019608%,81.176471%)") >= 0);
}
var isRoadLabelLozengeTrivialCheck = function(child) {
	return child.tagName == 'path' && isNonZeroFillRule(child);
}
var isRoadLabelLozenge = function(child) {
	if (isRoadLabelLozengeTrivialCheck(child)) {
		var siblings = findSiblingElements(child, 4);
		if (siblings.length < 4) {
			return false;
		} else {
			return isRoadLabelLozengeTrivialCheck(siblings[0]) && 
				isRoadLabelLozengeTrivialCheck(siblings[1]) &&
				isRoadLabelLozengeTrivialCheck(siblings[2]) &&
				isRoadLabelText(siblings[3]);
		}
	} else {
		return false;
	}
}

var isSurveyLine = function(child) {
	return child.tagName == 'path' && isNoFill(child) && isDashedLine(child);
}

var isWhiteText = function(element) {
	var style = element.getAttribute("style");
	return style != null && style.indexOf("fill:rgb(100%,100%,100%)") >= 0;
}

var isWhiteStrokeText = function(element) {
	var style = element.getAttribute("style");
	return style != null && style.indexOf("stroke:rgb(100%,100%,100%);") >= 0
		&& style.indexOf("stroke-miterlimit:10") >= 0;
}

var isGreyText = function(element) {
	var style = element.getAttribute("style");
	return style != null && style.indexOf("rgb(26.666667%,26.666667%,26.666667%)") >= 0;
}

var isLandColour = function(element) {
	var style = element.getAttribute("style");
	return style != null && style.indexOf("fill:rgb(94.901961%,93.72549%,91.372549%)") >= 0;
}

var isWaterColour = function(element) {
	var style = element.getAttribute("style");
	return style != null && style.indexOf("stroke:rgb(70.980392%,81.568627%,81.568627%)") >= 0;
}

var isBusinessAreaColour = function(element) {
	var style = element.getAttribute("style");
	return style != null && style.indexOf("fill:rgb(92.156863%,85.882353%,90.980392%)") >= 0;
}

var isBorderColour  = function(element) {
	var style = element.getAttribute("style");
	return style != null && style.indexOf("stroke:rgb(67.45098%,27.45098%,67.45098%)") >= 0;
}

var isParkColour = function(element) {
	var style = element.getAttribute("style");
	return style != null && (style.indexOf("fill:rgb(70.980392%,89.019608%,70.980392%)") >= 0
		|| style.indexOf("fill:rgb(78.431373%,98.039216%,80%)") >= 0);
}

var isWoodedColour = function(element) {
	var style = element.getAttribute("style");
	return style != null && style.indexOf("fill:rgb(67.843137%,81.960784%,61.960784%)") >= 0;
}

var isDashedLine = function(element) {
	var style = element.getAttribute("style");
	return style != null && style.indexOf("stroke-dasharray:") >= 0;
}

var isNonZeroFillRule = function(element) {
	var style = element.getAttribute("style");
	return style != null && style.indexOf("stroke:none;fill-rule:nonzero;") >= 0;
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
	layer.setAttribute("id", "layer" + name.replace(' ', '', 'g'));
	layers.push(layer);
	return layer;
}