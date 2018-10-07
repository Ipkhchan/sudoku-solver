var canvasBoxSelector = (() => {
  var drag = false,
      mouseX,
      mouseY,
      closeEnough = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 15 : 10),
      dragTL = dragBL = dragTR = dragBR = false,
      tl, tr, bl, br,
      canvas,
      ctx;

  function drawCircle(x, y, radius) {
    ctx.fillStyle = "#3C99A3";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
  }

  function drawPolygon() {
    ctx.beginPath();
    ctx.strokeStyle = "#3C99A3";
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.moveTo(tl.x, tl.y);
    ctx.lineTo(tr.x, tr.y);
    ctx.stroke();
    ctx.lineTo(br.x, br.y);
    ctx.stroke();
    ctx.lineTo(bl.x, bl.y);
    ctx.stroke();
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  }

  function draw(topLeft, topRight, botRight, botLeft) {
    if(topLeft&&topRight&&botLeft&&botRight) {
      tl = topLeft;
      tr = topRight;
      bl = botLeft;
      br = botRight;
    }

    console.log("drawing", tl, tr, bl, br);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPolygon();
    drawCircle(tl.x, tl.y, closeEnough);
    drawCircle(tr.x, tr.y, closeEnough);
    drawCircle(br.x, br.y, closeEnough);
    drawCircle(bl.x, bl.y, closeEnough);
  }

  function getCornerPositions() {
    return [tl, tr, br, bl];
  }

  function mouseDown(e) {
    // e.preventDefault();
    var canvasRect = canvas.getBoundingClientRect();
    mouseX = (e.clientX || e.targetTouches[0].clientX) - canvasRect.left;
    mouseY = (e.clientY || e.targetTouches[0].clientY) - canvasRect.top;

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

    draw();
  }

  function checkCloseEnough(p1, p2) {
    return Math.abs(p1 - p2) < closeEnough;
  }

  function mouseUp(e) {
    e.preventDefault();
    dragTL = dragTR = dragBL = dragBR = false;
  }

  function mouseMove(e) {
    e.preventDefault();
    var canvasRect = canvas.getBoundingClientRect();

    mouseX = (e.clientX || e.targetTouches[0].clientX) - canvasRect.left;
    mouseY = (e.clientY || e.targetTouches[0].clientY) - canvasRect.top;

    if (dragTL) {
        tl = {x: mouseX, y: mouseY};
    } else if (dragTR) {
        tr = {x: mouseX, y: mouseY};
    } else if (dragBL) {
        bl = {x: mouseX, y: mouseY};
    } else if (dragBR) {
        br = {x: mouseX, y: mouseY};
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw();
  }

  function init(srcCanvas, initTl, initTr, initBr, initBl) {
    canvas = srcCanvas;
    ctx = canvas.getContext("2d");
    canvas.addEventListener('mousedown', mouseDown, false);
    canvas.addEventListener('mouseup', mouseUp, false);
    canvas.addEventListener('mousemove', mouseMove, false);
    canvas.addEventListener('touchstart', mouseDown, false);
    canvas.addEventListener('touchmove', mouseMove, false);
    canvas.addEventListener('touchend', mouseUp, false);

    if(!(initTl&&initTr&&initBl&&initBr)) {
      const canvasHeight = canvas.height;
      const canvasWidth = canvas.width;

      tl = {x: canvasWidth/3, y: canvasHeight/3};
      tr = {x: 2*canvasWidth/3, y: canvasHeight/3};
      br = {x: 2*canvasWidth/3, y: 2*canvasHeight/3};
      bl = {x: canvasWidth/3, y: 2*canvasHeight/3};

    }
    else {
      tl = initTl;
      tr = initTr;
      br = initBr;
      bl = initBl;

    }

    draw();
  }

  function stop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.removeEventListener('mousedown', mouseDown, false);
    canvas.removeEventListener('mouseup', mouseUp, false);
    canvas.removeEventListener('mousemove', mouseMove, false);
    canvas.removeEventListener('touchstart', mouseDown, false);
    canvas.removeEventListener('touchmove', mouseMove, false);
    canvas.removeEventListener('touchend', mouseUp, false);
  }



  return {init: init,
          getCornerPositions: getCornerPositions,
          draw: draw,
          stop: stop}
})();
