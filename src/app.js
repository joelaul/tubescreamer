// Use tone.js and WebAudioAPI to feed the page audio and tie filter amount to knob rotation (init knobs at noon)

// DOM elements

const power = document.querySelector('.power-led');
const engage = document.querySelector('.engage-button');

const od = document.querySelector('.overdrive');
const tone = document.querySelector('.tone');
const level = document.querySelector('.level');

// Variables

let powerOn = false;
let initPos = null;
let currentRot = 0;

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

const updatePosition = (e) => {
    const currentPos = e.clientY;
    const delta = initPos - currentPos;
   
    let result = delta*1.5;

    if (currentRot + result >= 150) {
        result = 150; 
    }
    else if (currentRot + result <= -150) {
        result = -150;
    }

    od.style.transform = `rotate(${currentRot + result}deg)`;
}

const handleKnob = (e) => {
    if (powerOn) {
        if (!initPos) {
            initPos = e.clientY;
        }
        document.querySelector('.top-section').addEventListener('mousemove', updatePosition)
    }
}

const handleMouseUp = () => {
    document.querySelector('.top-section').removeEventListener('mousemove', updatePosition)
    initPos = null;
    if (od.style.transform) {
        currentRot = parseInt(od.style.transform.split('(')[1].split('d')[0]);
    }
    console.log(currentRot);
}

// Event listeners

engage.addEventListener('click', handleEngage);
od.addEventListener('mousedown', handleKnob);
window.addEventListener('mouseup', handleMouseUp);