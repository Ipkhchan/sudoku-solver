var canvasBoxSelector = (() => {
  var drag = false,
      mouseX,
      mouseY,
      closeEnough = 10,
      dragTL = dragBL = dragTR = dragBR = false,
      tl, tr, bl, br,
      ctx;

  function init(canvas) {
    ctx = canvas.getContext("2d");
    canvas.addEventListener('mousedown', mouseDown, false);
    canvas.addEventListener('mouseup', mouseUp, false);
    canvas.addEventListener('mousemove', mouseMove, false);

    tl = {x: 300, y: 300};
    tr = {x: 600, y: 300};
    bl = {x: 300, y: 600};
    br = {x: 600, y:600};

    function mouseDown(e) {
      var canvasRect = canvas.getBoundingClientRect();
      mouseX = e.clientX - canvasRect.left;
      mouseY = e.clientY - canvasRect.top;

      if (checkCloseEnough(mouseX, tl.x) && checkCloseEnough(mouseY, tl.y)) {
          dragTL = true;

      }
      // 2. top right
      else if (checkCloseEnough(mouseX, tr.x) && checkCloseEnough(mouseY, tr.y)) {
          dragTR = true;


      }
      // 3. bottom left
      else if (checkCloseEnough(mouseX, bl.x) && checkCloseEnough(mouseY, bl.y)) {
          dragBL = true;


      }
      // 4. bottom right
      else if (checkCloseEnough(mouseX, br.x) && checkCloseEnough(mouseY, br.y)) {
          dragBR = true;

      }
      // (5.) none of them
      else {
          // handle not resizing
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      draw();

    }

    function checkCloseEnough(p1, p2) {
      return Math.abs(p1 - p2) < closeEnough;
    }

    function mouseUp() {
      dragTL = dragTR = dragBL = dragBR = false;
    }

    function mouseMove(e) {
      var canvasRect = canvas.getBoundingClientRect();

      mouseX = e.clientX - canvasRect.left;
      mouseY = e.clientY - canvasRect.top;

      if (dragTL) {
          tl = {x: mouseX, y: mouseY};
      } else if (dragTR) {
          tr = {x: mouseX, y: mouseY};
      } else if (dragBL) {
          bl = {x: mouseX, y: mouseY};
      } else if (dragBR) {
          br = {x: mouseX, y: mouseY};
      }

      // ctx.clearRect(0, 0, sudokuCanvas.width, sudokuCanvas.height);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      draw();
    }

    function drawCircle(x, y, radius) {
      ctx.fillStyle = "#3C99A3";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
    }

    function drawPolygon() {
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.moveTo(tl.x, tl.y);
      ctx.lineTo(tr.x, tr.y);
      ctx.lineTo(br.x, br.y);
      ctx.lineTo(bl.x, bl.y);
      ctx.closePath();
      ctx.fill();
    }

    function draw() {
      drawPolygon();
      drawCircle(tl.x, tl.y, closeEnough);
      drawCircle(tr.x, tr.y, closeEnough);
      drawCircle(bl.x, bl.y, closeEnough);
      drawCircle(br.x, br.y, closeEnough);
    }

    draw();
  }

  function getCornerPositions() {
    return [tl, tr, br, bl];
  }

  return {init: init,
          getCornerPositions: getCornerPositions}
})();