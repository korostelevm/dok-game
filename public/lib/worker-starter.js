let worker;

function startWorker() {
  if(typeof(Worker) !== "undefined") {
    if(typeof(worker) == "undefined") {
      worker = new Worker("../worker/worker.js");

      const uInt8Array = new Uint8Array(1024 * 1024 * 32); // 32MB
      for (var i = 0; i < uInt8Array.length; ++i) {
        uInt8Array[i] = i;
      }

      worker.postMessage(["test", uInt8Array.buffer], [uInt8Array.buffer]);
    }
    worker.onmessage = function(event) {
      console.log("main", event);
      document.getElementById("result").innerHTML = event.data;
    };
  } else {
    document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Workers...";
  }
}

function stopWorker() { 
  worker.terminate();
  worker = undefined;
}




startWorker();