/*let recordButton = document.getElementById("Record");
recordButton.addEventListener("click",start);

let stopButton =document.getElementById("Stop");
stopButton.addEventListener("click",stop);
*/
let chunks = [];
let extension;
let recorder;
let stream;
let recordInterval;
let timingMap = new Map();
let fragList;
let keyupHandling;


if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
  extension = "webm";
} else {
  extension = "ogg"
}

function startRecord() {
  //audio
  fragList = getFragments(document);
  let timestamp = 0;
  let info = document.getElementById("infoRecord");
  navigator.mediaDevices.getUserMedia({
    audio: true
  }).then(function(tmpStream) {
    stream = tmpStream;
    let options = {
      audioBitsPerSecond: 256000,
      videoBitsPerSecond: 2500000,
      bitsPerSecond: 2628000,
      mimeType: 'audio/' + extension + ';codecs=opus'
    }
    recorder = new MediaRecorder(stream, options);
    recorder.ondataavailable = function(e) {
      chunks.push(e.data);
      if (recorder.state == 'inactive') {
        const blob = new Blob(chunks, {
          type: 'audio/' + extension,
          bitsPerSecond: 128000
        });
        console.log(blob);
        createDownloadLink(blob, timingMap)
      }
    };
    recorder.onerror = function(e) {
      console.log(e);
    }
    recorder.start();
    info.innerHTML = "Recording";

    //action
    recordInterval = setInterval(function() {
      timestamp++;
      log(timestamp)
    }, 1000);

    keyupHandling = function(event) {
    	event.preventDefault();
      if ((event.keyCode == 13) || (event.keyCode == 32) || (event.keyCode == 40) || (event.keyCode == 34) || (event.keyCode == 39)) {
        timingMap.set(timestamp, "next");
      } else if ((event.keyCode == 38) || (event.keyCode == 33) || (event.keyCode == 37)) {
        timingMap.set(timestamp, "prev");
      } else if (event.keyCode == 27) {
        timingMap.set(timestamp, "jump");
      }
      log(timingMap)
    }
    document.addEventListener('keyup', keyupHandling);

  }).catch(e => {
    console.log("Aucun micro détecté");
    info.innerHTML = "Aucun micro détecté";
  });
}

function stopRecording() {
  let info = document.getElementById("infoRecord");
  recorder.stop();
  clearInterval(recordInterval);
  document.removeEventListener('keyup', keyupHandling);
  stream.getAudioTracks()[0].stop();
  info.innerText = "Stopped";

}

function createDownloadLink(blob, map) {

  let url = URL.createObjectURL(blob);
  let audiolink = document.createElement('a');
  let jsonlink = document.createElement('a');

  audiolink.href = url;
  audiolink.download = "audio_" + new Date().toISOString() + '.' + extension;
  audiolink.innerHTML = "Audio File : " + "<span style='color:red'>" + audiolink.download + "</span>";
  audiolink.style.color = 'white';
  audiolink.style.textDecoration = "none";
  audiolink.style.padding = "0 10 0 10";

  //source https://www.xul.fr/ecmascript/map-et-objet.php
  function mapToObjectRec(m) {
    //let data={};
    let lo = {}
    for (let [k, v] of m) {
      if (v instanceof Map) {
        lo[k] = mapToObjectRec(v)
      } else {
        lo[k] = v
      }
    }

    return lo
  }
  map = mapToObjectRec(map);

  jsonlink.href = "data:text/json;charset=utf-8," + JSON.stringify(map);
  jsonlink.download = "actionRecord_" + new Date().toISOString() + ".json";
  jsonlink.innerHTML = "Action File : " + "<span style='color:red'>" + jsonlink.download + "</span>";
  jsonlink.style.color = 'white';
  jsonlink.style.textDecoration = "none";
  jsonlink.style.padding = "0 10 0 10";

  timingMap.clear();

  document.getElementById("infoRecord").appendChild(audiolink);
  document.getElementById("infoRecord").appendChild(jsonlink);
}

function createRecordBar() {
  let url = window.location.href;
  if (!url.includes("?audio=")) {
    $("body").append(`
		<div id="arrowDiv" style="position: fixed; bottom: 0px; left: 0px; background-color: rgb(35, 39, 42); height: 20px; width: 20px; color: white; border-top-right-radius: 7px; transition: all 1s ease-out 0s;">
   			<span id="arrowSpan">▲</span>
		</div>
		<div id="recDiv" style="position: fixed; bottom: -50px; left: 0px; background-color: rgb(35, 39, 42); height: 50px; width: 100vw; color: white; display: flex; transition: all 1s ease-out 0s;">
   			<span id="spanChoose" style="width: 6rem; position: relative; top: 0px; display: block; padding: 0px 10px 0px 5px;">
      			<p id="recordText" style="float: left; color: red;">Record</p>
      			<p id="playText" style="float: right; color: white;">Play</p>
   			</span>
   			<span id="spanUploadChoose" style="width: 5rem; position: relative; top: 0px; display: none; padding: 0px 15px;">
      			<p id="fileText" style="float: left; color: red;">File</p>
     			 <p id="urlText" style="float: right; color: white;">URL</p>
   			</span>
   			<span id="spanRecord" style="display: flex; position: relative;">
      			<p id="startRec" style="color: red; padding: 0px 5px;">⬤</p>
      			<p id="pauseRec" style="color: red; padding: 0px 5px;">▌▌</p>
      			<p id="stopRec" style="color: red; padding: 0px 5px;">◼</p>
      			<p id="infoRecord" style="padding: 0px 5px;"></p>
   			</span>
   			<span id="spanPlayFile" style="display: none; position: relative;">
      			<form id="formFile">
         			<input type="file" id="audioFile" accept=".webm,.ogg" required style="padding: 10px 0px;">
         			<input type="file" id="jsonFile" required accept=".json" style="padding: 10px 0px;">
         			<input type="submit">
      			</form>
   			</span>
   			<span id="spanPlayUrl" style="position: relative; top: 0px; display: none; padding: 0px 10px 0px 5px;">
      			<form id="formURL">
         			<input id="audioFileUrl" type="text" required="true" placeholder="Enter Audio File URL (.webm)" style="padding: 10px 0px;">
         			<input id="jsonFileUrl" type="text" required="true" placeholder="Enter Action File URL (.json)" style="padding: 10px 0px;">
         			<input type="submit">
      			</form>
   			</span>
		</div>
		`)
    let audioFile;
    let jsonFile;
    let arrowDiv = document.getElementById("arrowDiv");
    let arrowSpan = document.getElementById("arrowSpan");
    let recDiv = document.getElementById("recDiv");
    let recordText = document.getElementById("recordText");
    let playText = document.getElementById("playText");
    let startRec = document.getElementById("startRec");
    let pauseRec = document.getElementById("pauseRec");
    let stopRec = document.getElementById("stopRec");
    let formFile = document.getElementById("formFile");
    let audioFileButton = document.getElementById("audioFile");
    let jsonFileButton = document.getElementById("jsonFile");
    let fileText = document.getElementById("fileText");
    let urlText = document.getElementById("urlText");
    let formURL = document.getElementById("formURL");

    arrowSpan.addEventListener("click", r => {
      if (arrowSpan.innerText == "▲") {
        recDiv.style.bottom = "0px";
        arrowDiv.style.bottom = "50px";
        arrowSpan.innerText = "▼"
      } else {
        arrowSpan.innerText = "▲";
        recDiv.style.bottom = "-50px";
        arrowDiv.style.bottom = "0px";
      }
    })

    startRec.addEventListener('mouseover', function() {
      startRec.style.color = "#d63031";
    });
    startRec.addEventListener('mouseleave', function() {
      startRec.style.color = "red";
    });
    startRec.addEventListener('click', startRecord);
	document.addEventListener('keyup',function(e){
		if(e.keyCode==65){
			startRecord();
		}
	})
    stopRec.addEventListener('click', stopRecording);
    stopRec.addEventListener('mouseover', function() {
      stopRec.style.color = "#d63031";
    });
    stopRec.addEventListener('mouseleave', function() {
      stopRec.style.color = "red";
    });

    recordText.addEventListener('click', function() {
      spanPlayFile.style.display = "none";
      spanRecord.style.display = "flex";
      playText.style.color = "white";
      spanUploadChoose.style.display = "none";
      recordText.style.color = "red";
      spanPlayUrl.style.display = "none";
    });

    playText.addEventListener("click", function() {
      recordText.style.color = "white";
      playText.style.color = "red";
      spanPlayFile.style.display = "flex";
      spanUploadChoose.style.display = "block";
      spanRecord.style.display = "none";
    })

    audioFileButton.onchange = function(e) {
      log(e.target.files[0])
      audioFile = e.target.files[0];
    }

    jsonFileButton.onchange = function(e) {
      log(e.target.files[0])
      jsonFile = e.target.files[0];
    }

    formFile.addEventListener("submit", function(e) {
      e.preventDefault();
      initPlay(audioFile, jsonFile);
    })
    fileText.addEventListener('click', function() {
      spanPlayFile.style.display = "flex";
      spanPlayUrl.style.display = "none";
      urlText.style.color = "white";
      fileText.style.color = "red";
    });
    urlText.addEventListener("click", function() {
      fileText.style.color = "white";
      urlText.style.color = "red";
      spanPlayUrl.style.display = "flex";
      spanPlayFile.style.display = "none";
    })
    formURL.addEventListener("submit", function(e) {
      e.preventDefault();
      let newURL = window.location.href + "?audio=" + audioFileUrl.value + "&action=" + jsonFileUrl.value;
      window.history.pushState(null, null, newURL);
      initPlay(audioFileUrl.value, jsonFileUrl.value);
    });
  } else {
  	if(window.location.hash.match(/^#[0-9]$/g)===null && !window.location.hash===""){
  		window.location.search=window.location.hash.substring(2,window.location.hash.length);
  		window.location.hash = window.location.hash.substring(0,2);
  	}
    let urlParam = new URLSearchParams(window.location.search);
    let audioFile = urlParam.get("audio")
    let actionFile = urlParam.get("action")
    initPlay(audioFile, actionFile, true);
  }
}
