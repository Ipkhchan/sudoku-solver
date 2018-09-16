function imageClipper(tl, tr, br, bl, canvas) {
  var ctx = canvas.getContext("2d");

  var xMinL = Math.min(tl.x, bl.x);
  var xMaxL = Math.max(tl.x, bl.x);
  var xMaxR = Math.max(tr.x, br.x);
  var xMinR = Math.min(tr.x, br.x);
  var yMinT = Math.min(tl.y, tr.y);
  var yMaxT = Math.max(tl.y, tr.y);
  var yMaxB = Math.max(bl.y, br.y);
  var yMinB = Math.max(bl.y, br.y);
  var width = xMaxR - xMinL;
  var height = yMaxB - yMinT;
  var sx, sy, sWidth, sHeight;

  var sTopLeft = {x: tl.x - xMinL, y: tl.y - yMinT};
  var sTopRight = {x: tr.x - xMinL, y: tr.y - yMinT};
  var sBotLeft = {x: bl.x - xMinL, y: br.y - yMinT};
  var sBotRight = {x: br.x - xMinL, y: br.y - yMinT};

  var sudokuClipping = ctx.getImageData(xMinL, yMinT, width, height);

  function createCanvas(width, height) {
    var canvas = document.createElement("canvas");
    canvas.style.display = "none";
    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);
    return canvas;
  }

  var scaleCanvas = createCanvas(width, height);
  var scaleCanvasCtx = scaleCanvas.getContext("2d");
  scaleCanvas.classList = "scaleCanvas";
  var xStretchCanvas = createCanvas(width, height);
  var xStretchCanvasCtx = xStretchCanvas.getContext("2d");
  xStretchCanvas.classList = "xStretchCanvas";
  var yStretchCanvas = createCanvas(width, height);
  var yStretchCanvasCtx = yStretchCanvas.getContext("2d");
  yStretchCanvas.classList = "yStretchCanvas";

  scaleCanvasCtx.putImageData(sudokuClipping, 0, 0);


  for (var j = 0; j < height; j++) {
    sx = sTopLeft.x - (sTopLeft.x - sBotLeft.x)*(j/height);
    sWidth = (sTopRight.x - sTopLeft.x) + ((sBotRight.x - sBotLeft.x) - (sTopRight.x - sTopLeft.x))*(j/height);

    xStretchCanvasCtx.drawImage(scaleCanvas,
      sx, j, sWidth, 1,
      0, j, width, 1);
  }

  for (var j = 0; j < width; j++) {
    sy = sTopLeft.y - (sTopLeft.y - sTopRight.y)*(j/height);
    sHeight = (sBotLeft.y - sTopLeft.y) + ((sBotRight.y - sTopRight.y) - (sBotLeft.y - sTopLeft.y))*(j/height);


    yStretchCanvasCtx.drawImage(xStretchCanvas,
      j, sy, 1, sHeight,
      j, 0, 1, height);
  }


  ctx.drawImage(yStretchCanvas, 0, 0, 900, 900);

  // cleanup
  document.body.removeChild(scaleCanvas);
  document.body.removeChild(xStretchCanvas);
  document.body.removeChild(yStretchCanvas);
}
