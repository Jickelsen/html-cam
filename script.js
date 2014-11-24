var fileChooser = document.getElementsByTagName('input')[0];
var content = document.getElementById('content');

var maxSize = 1024;
var finalSize = 500;

if (typeof window.FileReader === 'undefined') {
    content.className = 'fail';
    content.innerHTML = 'File API &amp; FileReader API are not supported in your browser.  Try on a new-ish Android phone.';
}

fileChooser.onchange = function (e) {
    //e.preventDefault();

	var filterCanvas = document.createElement('canvas');
	var filterContext = filterCanvas.getContext('2d');

	var composeCanvas = document.createElement('canvas');
	var composeContext = composeCanvas.getContext('2d');

    var finalCanvas = document.createElement('canvas');
    var finalContext = finalCanvas.getContext('2d');

    var file = fileChooser.files[0],
        reader = new FileReader();

    reader.onerror = function (event) {
        content.innerHTML = "Error reading file";
    }

    reader.onload = function (event) {
        var img = new Image();

        // files from the Gallery need the URL adjusted
        if (event.target.result && event.target.result.match(/^data:base64/)) {
            img.src = event.target.result.replace(/^data:base64/, 'data:image/jpeg;base64');
        } else {
            img.src = event.target.result;
        }

		var w = img.width;
		var h = img.height;
		console.log(w);
        var ratio = w/h;
		var maxw;
		var maxh;
		var finalw;
		var finalh;

		if (ratio >= 1) {
			maxw =  maxSize;
			maxh = maxSize/ratio;
			finalw =  finalSize;
			finalh = finalSize/ratio;
		}
		else {
			maxw =  maxSize/ratio;
			maxh = maxSize;
			finalw =  finalSize/ratio;
			finalh = finalSize;
		}
		img.width = maxw;
		img.height = maxh;

        // Set the canvases to the correct size to keep max size and image aspect ratio
		filterCanvas.width = finalw;
		filterCanvas.height = finalh;
		composeCanvas.width = finalw;
		composeCanvas.height = finalh;
		finalCanvas.width = finalw;
		finalCanvas.height = finalh;

        scaleDraw(img, 0, 0, finalw, finalh, finalContext);

// 		chromaKey(filterCanvas, finalContext);

        // save canvas image as data url (png format by default)
        var dataURL = finalCanvas.toDataURL();

        // set canvasImg image src to dataURL
        // so it can be saved as an image
        document.getElementById('canvasImg').src = dataURL;
    };

    reader.readAsDataURL(file);

    return false;
}

function chromaKey (src, dest) {
	var w = src.width;
	var h = src.height;
	var can2 = document.createElement('canvas');
	can2.width = w;
	can2.height = h;
	var ctx2 = can2.getContext('2d');
	var w = src.width;
	var h = src.height;
    ctx2.drawImage(src,0,0, w, h);

    var imageData = ctx2.getImageData(0,0, w, h);

    var length = imageData.data.length;
        for (var i =0; i <length; i++){
            var r = imageData.data [i * 4 + 0];
               var g = imageData.data [i * 4 + 1];
           var b = imageData.data [i * 4 + 2];

        if(g > 130 && r < 80 && b < 80){
        imageData.data[i * 4 + 3] = 0;
        }
            }
    dest.putImageData(imageData, 0, 0);
    return
}

function scaleDraw(src, posx, posy, destWidth, destHeight, dest){
	var start = new Date().getTime();
	var w = src.width;
	var h = src.height;
	console.log(w);
	var can2 = document.createElement('canvas');
	can2.width = w;
	can2.height = h;
	var ctx2 = can2.getContext('2d');
	ctx2.drawImage(src, posx, posy, w, h);
	var scalingSteps = 0;
	var curWidth = w;
	var curHeight = h;

	var lastWidth = w;
	var lastHeight = h;

	var end = false;
	var scale=0.75;
	while(end==false){
		scalingSteps +=1;
		curWidth *= scale;
		curHeight *= scale;
		if(curWidth < destWidth){
			curWidth = destWidth;
			curHeight = destHeight;
			end=true;
			dest.drawImage(can2, 0, 0, Math.round(lastWidth), Math.round(lastHeight), 0, 0, Math.round(curWidth), Math.round(curHeight));
		}
		else {
			ctx2.drawImage(can2, 0, 0, Math.round(lastWidth), Math.round(lastHeight), 0, 0, Math.round(curWidth), Math.round(curHeight));
		}
		lastWidth = curWidth;
		lastHeight = curHeight;
	}
	var endTime =new Date().getTime();
  	console.log("execution time: "+ ( endTime - start) + "ms. scale per imageData: "+scale+ " scaling step count: "+scalingSteps)
};

