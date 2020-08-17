function dragElement(elmnt) {
  var dx = 0, dy = 0, px = 0, py = 0;
  if (document.getElementById(elmnt.id + "-header")) {
    document.getElementById(elmnt.id + "-header").onmousedown = start;
  } else {
    elmnt.onmousedown = start;
  }

  function start(e) {
    e = e || window.event;
    e.preventDefault();
    px = e.clientX;
    py = e.clientY;
    document.onmouseup = stop;
    document.onmousemove = move;
  }

  function move(e) {
    e = e || window.event;
    e.preventDefault();
    dx = px - e.clientX;
    dy = py - e.clientY;
    px = e.clientX;
    py = e.clientY;
    elmnt.style.top = (elmnt.offsetTop - dy) + "px";
    elmnt.style.left = (elmnt.offsetLeft - dx) + "px";
  }

  function stop() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}