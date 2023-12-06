// IMPORTS

import Knob from "./Knob";

const od = new Knob(odEl, null, 0);
const tone = new Knob(toneEl, null, 0);
const level = new Knob(levelEl, null, 0);
const modKnob = new Knob(modKnobEl, null, 0);
const knobs = [od, tone, level, modKnob];

// DOM

const power = document.querySelector(".power-led");
const engage = document.querySelector(".engage-button");
const odEl = document.querySelector(".overdrive");
const toneEl = document.querySelector(".tone");
const levelEl = document.querySelector(".level");
const play = document.querySelector(".play");
const ringModEl = document.querySelector(".ringmod");
const modKnobEl = document.querySelector(".rm");
const fileEl = document.querySelector("#file");

// STATE

const MAX_DIST = 3;
const MAX_FREQ = 6000;
const MAX_RMF = 55;

let powerOn = false;
let doubleTapTimer = null;
let stopTimer = null;
let storedVol = null;
let storedFile = null;

const context = new AudioContext();
let player = new Tone.Player("sample.mp3").toDestination();
const dist = new Tone.Distortion(MAX_DIST / 2).toDestination();
const filter = new Tone.Filter(MAX_FREQ / 2, "peaking").toDestination();
const ringMod = new Tone.FrequencyShifter(MAX_RMF / 2).toDestination();
filter.gain.value = 20;
filter.Q.value = 1.5;
filter.rolloff = -12;
Tone.Master.volume.value = -10;
player.sync().start(0);

// FUNCTIONS

const setStopTimer = () => {
  const timeLeft =
    (player.buffer.duration -
      2 *
        (parseFloat(Tone.Transport.position.split(":")[0]) +
          parseFloat(Tone.Transport.position.split(":")[1]) / 4 +
          parseFloat(Tone.Transport.position.split(":")[2]) / 16)) *
    1000;

  stopTimer = setTimeout(handleEnd, timeLeft);
};

const clearStopTimer = () => {
  clearTimeout(stopTimer);
  stopTimer = null;
};

// HANDLERS

const handleEngage = () => {
  if (powerOn) {
    power.classList.remove("on");
    powerOn = false;

    dist.disconnect();
    Tone.Master.volume.value = -10;

    document.body.classList.remove("ring-mod-on");
    ringModEl.classList.remove("ring-mod-on-button");
    modKnobEl.classList.add("off");
    return;
  }
  power.classList.add("on");
  powerOn = true;

  Tone.Master.volume.value = storedVol;
  player.chain(dist, filter, ringMod);

  if (ringModEl.ariaChecked == "false") {
    ringMod.wet.value = 0;
  } else {
    document.body.classList.add("ring-mod-on");
    ringModEl.classList.add("ring-mod-on-button");
    modKnobEl.classList.remove("off");
  }
};

const handleRingMod = () => {
  if (powerOn) {
    if (ringModEl.ariaChecked == "false") {
      ringMod.wet.value = 1;
      ringModEl.ariaChecked = "true";
      document.body.classList.add("ring-mod-on");
      ringModEl.classList.add("ring-mod-on-button");
      modKnobEl.classList.remove("off");
    } else {
      ringMod.wet.value = 0;
      ringModEl.ariaChecked = "false";
      document.body.classList.remove("ring-mod-on");
      ringModEl.classList.remove("ring-mod-on-button");
      modKnobEl.classList.add("off");
    }
  }
};

const handlePlay = () => {
  Tone.start();
  if (play.ariaChecked == "false") {
    play.ariaChecked = "true";
    play.innerHTML = '<i class="fa-solid fa-pause"></i>';

    setStopTimer();
    Tone.Transport.start();
  } else {
    play.ariaChecked = "false";
    play.innerHTML = '<i class="fa-solid fa-play"></i>';

    clearStopTimer();
    Tone.Transport.pause();
  }
};

const handleEnd = () => {
  Tone.Transport.stop();
  play.innerHTML = '<i class="fa-solid fa-play"></i>';
  play.ariaChecked = "false";
};

async function handleFileSelect(e) {
  let file = e.target.files[0];
  if (!file) {
    // user cancels dialog (file == undefined)
    file = storedFile;
    storedFile = null;
  } else {
    // user chooses a file
    clearStopTimer();
    handleEnd();
    player.unsync();
    file = e.target.files[0];
    storedFile = file;

    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    player = new Tone.Player(audioBuffer).toDestination();
    player.sync().start(0);
    if (powerOn) player.chain(dist, filter, ringMod);
  }
  let filename_display = document.getElementById("file-upload");
  // Update element's width to fit the filename
  filename_display.setAttribute("style", "height:auto;");
  // Replace upload button label with name of uploaded file
  filename_display.innerText = file.name;
}

// INIT

const init = () => {
  engage.addEventListener("click", handleEngage);
  play.addEventListener("click", handlePlay);
  ringModEl.addEventListener("click", handleRingMod);
  fileEl.addEventListener("change", handleFileSelect);

  for (let knob of knobs) {
    knob.element.addEventListener("mousedown", knob.handleKnob);
    knob.element.addEventListener("touchstart", knob.handleKnob);
    knob.element.addEventListener("dblclick", knob.handleReset);
    knob.element.addEventListener("touchend", knob.handleResetTouch);
  }
};

init();
