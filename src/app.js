// Use tone.js and WebAudioAPI to feed the page audio and tie filter amount to knob rotation (init knobs at noon)

// DOM elements

const power = document.querySelector('.power-led');
const engage = document.querySelector('.engage-button');
const od = document.querySelector('.overdrive');
const tone = document.querySelector('.tone');
const level = document.querySelector('.level');

// Variables

let powerOn = false;
let mouseDown = false;
let result = null;
let initPos = null;
let currentPos = null;

// Event handlers

const handleEngage = () => {
    if (powerOn) {
        power.classList.remove('on');
        powerOn = false;
        return;
    }
    power.classList.add('on');
    powerOn = true;
}

const updatePosition = (e, knob) => {
    console.log(e.target);
    currentPos = e.clientY;
    const delta = initPos - currentPos;

    if (delta <= -100) {
        result = -150;
    }
    else if (delta >= 100) {
        result = 150;
    }
    else {
        result = Math.floor(parseFloat(delta*1.5));
    }
    if ((result + 30) % 30 == 0)

    od.style.transform = `rotate(${result}deg)`;
}

const handleKnob = (e) => {
    document.querySelector('.top-section').addEventListener('mousemove', updatePosition)
    if (!initPos) {
        initPos = e.clientY;
    }
    updatePosition(e);
}

const handleMouseDown = () => {
    mouseDown = true;
}

const handleMouseUp = () => {
    document.querySelector('.top-section').removeEventListener('mousemove', updatePosition)
    mouseDown = false;
    initPos = null;
}

// Event listeners

engage.addEventListener('click', handleEngage);
od.addEventListener('mousedown', handleKnob);
window.addEventListener('mouseup', handleMouseUp);