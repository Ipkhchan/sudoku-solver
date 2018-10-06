var submitSudoku = document.querySelector(".submit");
var fileInput = document.querySelector('.fileInput');
var submitImage = document.querySelector('.fileSubmit');
var clipImage = document.querySelector('.clipImage')
var image = document.querySelector('img');
var rotateImgLeft = document.querySelector('.rotateImg .rLeft');
var rotateImgRight = document.querySelector('.rotateImg .rRight');
var cells = document.querySelectorAll('.cell');
var openCV = document.querySelector('#openCV');

var sudokuCanvas = document.querySelector('.sudoku');
var sudokuCtx = sudokuCanvas.getContext("2d");
var liveClippingCanvas = document.querySelector('.sudokuClipping');
var liveClippingCtx = liveClippingCanvas.getContext("2d");
var markupCanvas = document.querySelector('.markupCanvas');
var markupCtx = markupCanvas.getContext("2d");

var valueParsed = document.querySelector('.valueParsed');
var sudokuArray = [];

function populateSudoku(colour) {
  for(var i=0; i<9; i++) {
    var row = document.querySelectorAll(`.row-${i} .cell`);
    row.forEach((cell,index) => {
      if (cell.value === '') {
        cell.value = sudokuArray[i][index];
        cell.style.color = colour;
      }
    })
  }
}

function rotateDegrees(degrees) {
  const sudokuWidth = window.innerWidth * 0.8;
  sudokuCtx.translate(sudokuCanvas.width/2, sudokuCanvas.width/2);
  sudokuCtx.rotate(degrees*Math.PI/180);
  sudokuCtx.translate(-sudokuCanvas.width/2, -sudokuCanvas.width/2)
  sudokuCtx.drawImage(image, 0, 0, sudokuWidth, sudokuWidth);

  let corners = canvasBoxSelector.getCornerPositions();
  let center = {x: sudokuCanvas.width/2, y: sudokuCanvas.width/2};
  let radians = degrees * (Math.PI/180);

  if (degrees === 90) {
    corners.unshift(corners.pop());
  }
  else if (degrees === -90) {
    corners.push(corners.shift());
  }

  corners.forEach((corner) => {
    const originX = corner.x - center.x;
    const originY = corner.y - center.y;

    corner.x = originX*Math.cos(radians) - originY*Math.sin(radians);
    corner.y = originX*Math.sin(radians) + originY*Math.cos(radians);

    corner.x += center.x;
    corner.y += center.y;
  });

  canvasBoxSelector.draw(...corners);
}

function detectSudokuEdges(sudokuCanvas) {
  let srcCanny = cv.imread(sudokuCanvas);
  let dstCanny = new cv.Mat();
  cv.cvtColor(srcCanny, srcCanny, cv.COLOR_RGB2GRAY, 0);
  cv.Canny(srcCanny, dstCanny, 50, 100, 3, false);
  cv.imshow(sudokuCanvas, dstCanny);
  srcCanny.delete(); dstCanny.delete();

  let srcContour = cv.imread(sudokuCanvas);
  let dstContour = cv.Mat.zeros(srcContour.cols, srcContour.rows, cv.CV_8UC3);
  cv.cvtColor(srcContour, srcContour, cv.COLOR_RGBA2GRAY, 0);
  cv.threshold(srcContour, srcContour, 120, 200, cv.THRESH_BINARY);
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(srcContour, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

  let largestContourIndex;
  let largestContourSize = 0;

  for (let i = 0; i < contours.size(); ++i) {
    if (cv.contourArea(contours.get(i),false) > largestContourSize) {
      largestContourSize = cv.contourArea(contours.get(i), false);
      largestContourIndex = i;
    }
  }

  const largestContourData = contours.get(largestContourIndex).data32S;

  let x, y;
  var tl, tr, bl, br;
  [tl, tr, bl, br].forEach((corner) => {
    corner = {x: largestContourData[0], y: largestContourData[1]};
  })

  let tlCheck = largestContourData[0] + largestContourData[1];
  let trCheck = largestContourData[0] - largestContourData[1];
  let blCheck = largestContourData[1] - largestContourData[0];
  let brCheck = largestContourData[0] + largestContourData[1];


  for (var i = 0; i < largestContourData.length; i+=2) {
    x = largestContourData[i];
    y = largestContourData[i+1];

    if(x + y < tlCheck) {
      tlCheck = x + y;
      tl = {x: x, y: y};
    }
    else if(x - y > trCheck) {
      trCheck = x - y;
      tr = {x: x, y: y}
    }
    else if(y -x > blCheck) {
      blCheck = y - x;
      bl = {x: x, y: y}
    }
    else if (x + y > brCheck) {
      brCheck = x + y;
      br = {x: x, y: y}
    }
  }

  sudokuCtx.drawImage(image,0,0, sudokuCanvas.width, sudokuCanvas.height);
  sudokuCtx.save();
  markupCtx.save();
  canvasBoxSelector.init(markupCanvas, tl, tr, br, bl);
  srcContour.delete(); dstContour.delete(); contours.delete(); hierarchy.delete();
}

function handleImageSubmit(e) {
  e.preventDefault();
  canvasBoxSelector.stop();
  var liveResults = document.querySelector('.liveResults');
  liveResults.style.display= "flex";
  document.querySelector('.cvAlert').style.display = "block";
  $('html').animate({scrollTop: liveResults.getBoundingClientRect().top + document.documentElement.scrollTop - window.innerHeight/2 + liveResults.getBoundingClientRect().height/2}, 'slow');

  function getClipping(x,y,xLength,yLength) {
    var sudokuClipping = sudokuCtx.getImageData(x,y,xLength,yLength);
    return sudokuClipping;
  }

  var rowPromises = [];

  const gridDist = sudokuCanvas.width/9;
  const clipWidth = gridDist*0.7;
  const offsetWidth = gridDist*0.15;

  for (let i =0; i <9; i++) {
    rowPromises.push((() => {
      var recognizeNumber = Promise.resolve();
      var rowArray = [];

      for (let j= 0; j < 9; j++) {
        recognizeNumber= recognizeNumber
          .then(() => {
            return Promise.all([Promise.resolve(
              Tesseract.recognize(getClipping(offsetWidth + (j*gridDist),offsetWidth + (i*gridDist),clipWidth,clipWidth))
              // Tesseract.recognize(getClipping((j*100)-10,(i*100)-10,120,120))
            ), getClipping(offsetWidth +(j*gridDist),offsetWidth +(i*gridDist),clipWidth,clipWidth)])
          })
          .then(([result, sudokuClipping]) => {
            console.log("result", result);
            result = parseInt(result.text.slice(0,1)) || "";
            rowArray.push(result);
            createImageBitmap(sudokuClipping).then(function(clippingBitmap) {
                liveClippingCtx.drawImage(clippingBitmap, 0, 0, liveClippingCanvas.width, liveClippingCanvas.height);
            });
            valueParsed.innerHTML = result;
            return rowArray;
          })
      }
      return recognizeNumber;
    })());
  }

  Promise.all(rowPromises).then((result) => {
    console.log(result);
    sudokuArray = result;
    populateSudoku("black");
  })
}

function handleImageClip(e) {
  e.preventDefault();
  sudokuCtx.restore();
  markupCtx.restore();
  imageClipper(...canvasBoxSelector.getCornerPositions(), sudokuCanvas);
}

openCV.onload = function onOpenCvReady() {
  console.log("OpenCV is ready!");
  fileInput.classList.add("active");
}

function handleSudokuSubmit(e) {
  e.preventDefault();
  for(var i=0; i <9; i++) {
    var row = document.querySelectorAll(`.row-${i} .cell`);
    var rowVals = [];
    row.forEach((input) => {
      rowVals.push(parseInt(input.value) || '');
    })
    sudokuArray.push(rowVals);
  }

  solveSudoku(sudokuArray);
  populateSudoku("red");
}

function handleImageLoad() {
  const sudokuWidth = window.innerWidth * 0.8;

  document.querySelector('.imageControls').style.display= "block";
  document.querySelector('.canvasContainer').style.display= "block";
  sudokuCanvas.setAttribute("height", `${sudokuWidth}`);
  sudokuCanvas.setAttribute("width", `${sudokuWidth}`);
  markupCanvas.setAttribute("height", `${sudokuWidth}`);
  markupCanvas.setAttribute("width", `${sudokuWidth}`);

  sudokuCtx.drawImage(image,0,0, sudokuWidth, sudokuWidth);
  detectSudokuEdges(sudokuCanvas);
}

cells.forEach((cell) => {
  cell.addEventListener('keydown', (e) => {
    if (e.keyCode > 57 || (cell.value && (e.keyCode > 46))) {
      e.preventDefault();
    }
  })
});

fileInput.addEventListener('change', (e) => {image.src = URL.createObjectURL(e.target.files[0]);}, false);
image.onload = handleImageLoad;
rotateImgLeft.addEventListener("click", () => {rotateDegrees(-90)});
rotateImgRight.addEventListener("click", () => {rotateDegrees(90)});
clipImage.addEventListener('mouseup', handleImageClip);
submitImage.addEventListener("click", handleImageSubmit);
submitSudoku.addEventListener("click", handleSudokuSubmit);
