var i = 0;

function timedCount() {
  i = i + 1;
  postMessage(i);
  setTimeout("timedCount()",500);
}

//timedCount();


addEventListener("message", e => {
	console.log(e);
	postMessage(e.data[1], [e.data[1]]);
});