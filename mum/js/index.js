var textTo = 'Dear Mum',
  textMessage = "Happy Mother's Day",
  textFrom = 'Love Ben',
  time = 200;

var canvas, ctx,
  maxSize = Math.min(window.innerHeight, window.innerWidth) / 2;

window.onload = function() {
  var rem = (window.innerHeight / 320) * 100;
  document.getElementsByTagName('html')[0].style.fontSize = rem + '%';

  var elementTo = document.getElementById('to'),
    elementMessage = document.getElementById('message'),
    elementFrom = document.getElementById('from');

  setTimeout(function() {
    writeWord(elementTo, textTo, 0)
  }, time);

  setTimeout(function() {
    writeWord(elementMessage, textMessage, 0)
  }, time * (3 + textTo.length));

  setTimeout(function() {
    writeWord(elementFrom, textFrom, 0)
  }, time * (6 + textTo.length + textMessage.length));

  canvas = document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx = canvas.getContext('2d');
  console.log(canvas.width, canvas.height);
  setTimeout(startDrawingHearts, time * (9 + textTo.length + textMessage.length + textFrom.length));

}

function writeWord(div, word, index) {
  if (index < word.length) {
    div.innerHTML += word[index];
    setTimeout(function() {
      index += 1;
      writeWord(div, word, index)
    }, time);
  }
}

function bigRedHeart(e) {
  var size = maxSize;
  drawHeart(e.pageX, e.pageY - 50, size, size, true, true);
}
document.addEventListener("touchstart", bigRedHeart, false);
document.addEventListener("click", bigRedHeart, false);

function drawHeart(x, y, width, height, fill, red) {
  y -= height / 2; // offset y
  ctx.save();
  ctx.beginPath();
  var topCurveHeight = height * 0.3;
  ctx.moveTo(x, y + topCurveHeight);
  // top left curve
  ctx.bezierCurveTo(
    x, y,
    x - width / 2, y,
    x - width / 2, y + topCurveHeight
  );

  // bottom left curve
  ctx.bezierCurveTo(
    x - width / 2, y + (height + topCurveHeight) / 2,
    x, y + (height + topCurveHeight) / 2,
    x, y + height
  );

  // bottom right curve
  ctx.bezierCurveTo(
    x, y + (height + topCurveHeight) / 2,
    x + width / 2, y + (height + topCurveHeight) / 2,
    x + width / 2, y + topCurveHeight
  );

  // top right curve
  ctx.bezierCurveTo(
    x + width / 2, y,
    x, y,
    x, y + topCurveHeight
  );

  ctx.closePath();

  if (fill) {
    ctx.fillStyle = '#' + Math.random().toString(16).slice(2, 8).toUpperCase();
    if (red) {
      ctx.fillStyle = 'red';
    }
    ctx.fill();
  }
  ctx.strokeStyle = '#' + Math.random().toString(16).slice(2, 8).toUpperCase();
  ctx.stroke();
  ctx.restore();
}

function randomCoordinate(width, height, size) {
  if (width && height) {
    return {
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * height)
    };
  } else {
    return {
      x: Math.floor(Math.random() * (canvas.width - size)) + size / 2,
      y: Math.floor(Math.random() * (canvas.height - size)) + size / 2
    };
  }
}

function startDrawingHearts() {
  var t = 500;
  setInterval(function() {
    var size = Math.random() * maxSize;
    var coord = randomCoordinate(null, null, size);
    if (Math.random() < 0.2) {
      drawHeart(coord.x, coord.y, size, size, true);
      if (t > 1000) {
        //t -= 100;
      }
    } else {
      drawHeart(coord.x, coord.y, size, size);
    }
  }, t);
}