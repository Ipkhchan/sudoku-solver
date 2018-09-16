var submitSudoku = document.querySelector(".submit");
var fileInput = document.querySelector('.fileInput');
var submitImage = document.querySelector('.fileSubmit');
var clipImage = document.querySelector('.clipImage')
var image = document.querySelector('img');

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

submitSudoku.addEventListener("click", (e) => {
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
})

fileInput.addEventListener('change', (e) => {
  image.src = URL.createObjectURL(e.target.files[0]);
  console.log("here");
}, false);

image.onload = function() {
  document.querySelector('.imageControls').style.display= "block";
  document.querySelector('.canvasContainer').style.display= "block";
  sudokuCanvas.setAttribute("height", "900");
  sudokuCanvas.setAttribute("width", "900");
  markupCanvas.setAttribute("height", "900");
  markupCanvas.setAttribute("width", "900");
  sudokuCtx.drawImage(image,0,0, 900, 900);
  canvasBoxSelector.init(markupCanvas);
}

clipImage.addEventListener('mouseup', (e) => {
  e.preventDefault();
  imageClipper(...canvasBoxSelector.getCornerPositions(), sudokuCanvas);
})



submitImage.addEventListener("click", (e) => {
  e.preventDefault();
  var liveResults = document.querySelector('.liveResults');
  liveResults.style.display= "flex";
  $('html').animate({scrollTop: liveResults.getBoundingClientRect().top + document.documentElement.scrollTop - window.innerHeight/2 + liveResults.getBoundingClientRect().height/2}, 'slow');
  //which canvas to put the live image clipping on
  //which canvas to put the live results on


  function getClipping(x,y,xLength,yLength) {
    var sudokuClipping = sudokuCtx.getImageData(x,y,xLength,yLength);
    return sudokuClipping;
  }

  var rowPromises = [];

  for (let i =0; i <9; i++) {
    rowPromises.push((() => {
      var recognizeNumber = Promise.resolve();
      var rowArray = [];

      for (let j= 0; j < 9; j++) {
        recognizeNumber= recognizeNumber
          .then(() => {
            return Promise.all([Promise.resolve(
              Tesseract.recognize(getClipping(10 + (j*100),10 + (i*100),80,80))
              // Tesseract.recognize(getClipping((j*100)-10,(i*100)-10,120,120))
            ), getClipping(10 +(j*100),10 +(i*100),80,80)])
          })
          .then(([result, sudokuClipping]) => {
            console.log("result", result);
            result = parseInt(result.text.slice(0,1)) || "";
            rowArray.push(result);
            liveClippingCtx.putImageData(sudokuClipping, 0, 0);
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
})
