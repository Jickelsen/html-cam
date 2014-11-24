var fileChooser = document.getElementsByTagName('input')[0];
var content = document.getElementById('content');
var filterCanvas = document.getElementById('filterCanvas');
var filterContext = filterCanvas.getContext('2d');
var composeCanvas = document.getElementById('composeCanvas');
var composeContext = composeCanvas.getContext('2d');

var destW = 500;

if (typeof window.FileReader === 'undefined') {
    content.className = 'fail';
    content.innerHTML = 'File API &amp; FileReader API are not supported in your browser.  Try on a new-ish Android phone.';
}

fileChooser.onchange = function (e) {
    //e.preventDefault();

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

//         // Guess photo orientation based on device orientation, works when taking picture, fails when loading from gallery
//         if (navigator.userAgent.match(/mobile/i) && window.orientation === 0) {
//             img.height = 250;
//             img.className = 'rotate';
//         } else {
//             img.width = 400;
//         }

//         content.innerHTML = '';
//         content.appendChild(img);



        scaleDraw(img, 0, 0, composeCanvas.width, composeCanvas.height, composeCanvas, composeContext);
        // save canvas image as data url (png format by default)
        var dataURL = composeCanvas.toDataURL();

        // set canvasImg image src to dataURL
        // so it can be saved as an image
        document.getElementById('canvasImg').src = dataURL;
    };

    reader.readAsDataURL(file);

    return false;
}

function scaleDraw(img, posx, posy, destWidth, destHeight, cvs, ctx){
        var start = new Date().getTime();
        var w = img.width;
        var h = img.height;
        var can2 = document.createElement('canvas');
        can2.width = w;
        can2.height = h;
        var ctx2 = can2.getContext('2d');
        ctx2.drawImage(img, posx, posy, w, h);
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
                ctx.drawImage(can2, 0, 0, Math.round(lastWidth), Math.round(lastHeight), 0, 0, Math.round(curWidth), Math.round(curHeight));
            }
            else {
                ctx2.drawImage(can2, 0, 0, Math.round(lastWidth), Math.round(lastHeight), 0, 0, Math.round(curWidth), Math.round(curHeight));
            }
            lastWidth = curWidth;
            lastHeight = curHeight;
        }
        var endTime =new Date().getTime();
  console.log("execution time: "+ ( endTime - start) + "ms. scale per frame: "+scale+ " scaling step count: "+scalingSteps)
};

