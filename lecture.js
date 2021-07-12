let timerList;
let frag;
let audio;
let action;
let audioFile;
let actionFile;
let timeSlider;
let sliderValue;
let timestamp=0;
let audioDuration = 0;
let currentTime = 0;

function log(message) {
  console.log(message);
}

function createAudioReader(idParent, classe, filePath, timer = "", fragments = "") {
  let audio = new Audio(filePath);
  let reader = document.createElement("audio");
  reader.src = filePath;
  reader.preload = "metadata";
  reader.controls = "controls";
  reader.className = classe;
  if (timer != "")
    reader.setAttribute("timer", timer);
  if (fragments != "")
    reader.setAttribute("fragments", fragments);

  let parent = document.getElementById(idParent);
  parent.appendChild(reader);
}

function getTimer(element) {
  function checkTimerBegin(event) {
    if ((event.keyCode == 13) || (event.keyCode == 32) || (event.keyCode == 40) || (event.keyCode == 34) || (event.keyCode == 39)) {
      event.preventDefault();
      log(event.keyCode)
      if (frag[time].target[0] == timerList[0]) {
        nextElem(0);
        document.removeEventListener('keyup', checkTimerBegin);
      }
    }
  }
  frag = getFragments(document);
  timerList = element.querySelectorAll("[timer]");
  if (frag[0].target[0].hasAttribute("timer"))
    nextElem(0)
  else {

    document.addEventListener('keyup', checkTimerBegin);
  }


}

function getAudioTime(currentTimedElement, element) {
  //Source : https://zeke.blog/2018/02/14/get-video-and-audio-blob-duration-in-html5/
  let audioObject = new Audio(element);
  let time = 0;

  timerList[currentTimedElement].addEventListener('loadedmetadata', function() {
    audioObject.currentTime = 10000;

    audioObject.addEventListener('timeupdate', function() {
      time = Math.ceil(audioObject.duration) + parseInt(timerList[currentTimedElement].getAttribute("timer"), 10);
      log(Math.ceil(audioObject.duration) + parseInt(timerList[currentTimedElement].getAttribute("timer"), 10))
    });
  });
  return time;
}

function nextElem(current) {
  function changeElem(event) {
    if ((event.keyCode == 13) || (event.keyCode == 32) || (event.keyCode == 40) || (event.keyCode == 34) || (event.keyCode == 39)) {
      event.preventDefault();
      log(timerList[current]);
      log("test")
      nextElem(current)
      document.removeEventListener('keyup', changeElem);
    }
  }


  if (current < timerList.length) {

    if (frag[time].target[0].hasAttribute("timer")) {
      let seconds = timerList[current].getAttribute("timer");
      log(seconds + " secondes")
      if (timerList[current].nodeName != "AUDIO") {
        setTimeout(function() {
          current++;
          log(timerList[current])
          next();
          nextElem(current);
        }, seconds * 1000);
      } else {
        setTimeout(function() {
          current++;
          next();
          nextElem(current);
        }, seconds * 1000);

      }
    } else {
      document.addEventListener('keyup', changeElem);

    }
  }
}

function initPlay(audio, action, fileInUrl = false) {
  isActionAString = false;

  if(typeof action == "string")
    isActionAString=true;
if(!document.body.contains(document.getElementById("playButton"))){
  var playButton = document.createElement("button");
  playButton.innerText = "Play";
  playButton.id="playButton";
  var pauseButton = document.createElement("button");
  pauseButton.innerText = "Pause";
  pauseButton.disabled = true;
    pauseButton.id="pauseButton";
  var stopButton = document.createElement("button");
  stopButton.innerText = "Stop";
  stopButton.disabled = true;
  stopButton.id="stopButton";
}
  //source https://www.xul.fr/ecmascript/map-et-objet.php
  function objectToMap(o) {
    let m = new Map()
    for (let k of Object.keys(o)) {
      if (o[k] instanceof Object) {
        m.set(k, objectToMap(o[k]))
      } else {
        m.set(k, o[k])
      }
    }
    return m
  }
  var reader = new FileReader();
  let actionMap;

  reader.addEventListener('load', function(e) {
    actionMap = JSON.parse(e.target.result);

    actionMap = objectToMap(actionMap)
    createButton();
  });

  if (typeof action == "string" && typeof audio == "string") {
    let stringJSON = $.getJSON(action, function(data) {
      action = data;
    });
    $.when(stringJSON).done(function() {
      actionMap = objectToMap(action)
      createButton();
    })
  } else {
    reader.readAsBinaryString(action);
    audio = URL.createObjectURL(audio);
  }


  let fileSpan = document.getElementById("spanPlayFile");
  let urlSpan = document.getElementById("spanPlayUrl");

  let audioPlayer = document.createElement("audio")
  audioPlayer.style.visibility = "hidden";
  audioPlayer.controls = "controls";
  audioPlayer.src = audio;

  function createButton() {

    document.addEventListener("keyup", function(e) {
      if (e.keyCode == 80) {
        playRecord(audioPlayer, actionMap);
        pauseButton.disabled = false;
        stopButton.disabled = false;
        playButton.disabled = true;
      } else if (e.keyCode == 81) {
        if (pauseButton.innerText == "Pause") {
          pauseButton.innerText = "Resume";
          pauseRecord(audioPlayer, actionMap);
        } else {
          pauseButton.innerText = "Pause";
          resumeRecord(audioPlayer, actionMap);
        }
      } else if (e.keyCode == 83) {
        stopRecord(audioPlayer, actionMap);
        playButton.disabled = false;
        pauseButton.disabled = true;
        stopButton.disabled = true;
      } else if (e.keyCode == 65) {
        log(actionMap)
      }
    });
    playButton.addEventListener("click", function() {
      if (fileInUrl) {
        playRecord(audioPlayer, actionMap, true);
      } else {
        playRecord(audioPlayer, actionMap);
      }
      pauseButton.disabled = false;
      stopButton.disabled = false;
      playButton.disabled = true;
    });
    pauseButton.addEventListener("click", function() {
      if (pauseButton.innerText == "Pause") {
        pauseButton.innerText = "Resume";
        pauseRecord(audioPlayer, actionMap);
      } else {
        pauseButton.innerText = "Pause";
        resumeRecord(audioPlayer, actionMap);
      }
    });
    stopButton.addEventListener("click", function() {
      stopRecord(audioPlayer, actionMap);
      playButton.disabled = false;
      pauseButton.disabled = true;
      stopButton.disabled = true;
    });

  if(!document.body.contains(document.getElementById("timeSlider"))){
  timeSlider = document.createElement("input")
  timeSlider.type = "range"
  timeSlider.min = "0"
  timeSlider.id = "timeSlider"
  timeSlider.value = "0"
  timeSlider.name="slider"
  timeSlider.width="20vw"
}

  if(!document.body.contains(document.getElementById("timeSlider")))
  sliderValue=document.createElement("output");

    if (isActionAString && fileInUrl === false) {
      urlSpan.appendChild(playButton);
      urlSpan.appendChild(pauseButton);
      urlSpan.appendChild(stopButton);
      urlSpan.appendChild(timeSlider);
      urlSpan.appendChild(sliderValue);
      urlSpan.appendChild(audioPlayer)
    } else if (!isActionAString && fileInUrl === false) {
      fileSpan.appendChild(playButton);
      fileSpan.appendChild(pauseButton);
      fileSpan.appendChild(stopButton);
      fileSpan.appendChild(timeSlider);
      fileSpan.appendChild(sliderValue);
      fileSpan.appendChild(audioPlayer)
    } else {
      $("body").append(`
        <div id="readDiv" style="position: fixed; bottom: 0px; left: 0px; background-color: rgb(35, 39, 42); height: 50px; width: 100vw; color: white; display: flex; transition: all 1s ease-out 0s;">
        </div>
        `)
      let readDiv = document.getElementById("readDiv");
      readDiv.appendChild(playButton);
      readDiv.appendChild(pauseButton);
      readDiv.appendChild(stopButton);
      readDiv.appendChild(timeSlider);
      readDiv.appendChild(sliderValue);
      readDiv.appendChild(audioPlayer)
    }
  }
}

function playRecord(audioPlayer, actionMap, fileInUrl = false) {
  let audioObject = new Audio(audioPlayer.src);

  audioObject.currentTime = 10000;
  audioObject.addEventListener('timeupdate', e => {
    setAudioDuration(audioObject.duration);
    timeSlider.max = "" + Math.ceil(audioDuration);
  });

  audioPlayer.play();
  startInterval(audioPlayer, actionMap);

}

function pauseRecord(audioPlayer, actionMap) {
  audioPlayer.pause()
  clearInterval(actionTimer)
}

function resumeRecord(audioPlayer, actionMap) {
  audioPlayer.play();
  startInterval(audioPlayer, actionMap);
}

function stopRecord(audioPlayer, actionMap) {
  audioPlayer.pause();
  sliderValue.innerText = timestamp = timeSlider.value= currentTime = audioPlayer.currentTime = 0;
  clearInterval(actionTimer);
  log("End.")
}

function setAudioDuration(duration) {
  audioDuration = duration;
}

function startInterval(audioPlayer, actionMap) {
      audioPlayer.addEventListener("ended",function(){
       let playButton = document.getElementById("playButton");
      let pauseButton = document.getElementById("pauseButton");
      let stopButton = document.getElementById("stopButton");
      pauseButton.disabled = true;
      stopButton.disabled = true;
      playButton.disabled = false;
      stopRecord(audioPlayer, actionMap);
     
    });
  actionTimer = setInterval(function() {
    if(timestamp == currentTime){
    currentTime++;
    }
    timestamp++;
    timeSlider.value=timestamp;
    sliderValue.innerText=timestamp;
    timeSlider.addEventListener("change",function(){
      audioPlayer.currentTime=timeSlider.value;
      sliderValue.innerText=timeSlider.value;
      timestamp=timeSlider.value;
    })
    if(timestamp == currentTime){
    if (actionMap.get("" + currentTime) != undefined) {
      switch (actionMap.get("" + currentTime)) {
        case "next":
          next();
          break;
        case "prev":
          prev();
          break;
        case "jump":
          jump();
          break;
      }
    } 
  }
  }, 1000);
}
