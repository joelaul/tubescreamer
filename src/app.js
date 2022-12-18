// Use tone.js and WebAudioAPI to feed the page audio and tie filter amount to knob rotation (init knobs at noon)

class Knob {
    constructor(element, initPos, currentRot) {
        this.element = element;
        this.initPos = initPos;
        this.currentRot = currentRot;
    }

    handleReset = () => {
        let {element, initPos, currentRot} = this;
    
        if (powerOn) {
            element.style.transform = `rotate(0deg)`;
            currentRot = 0;
            if (initPos) {
                initPos = null;
            }
        }
    }

    handleKnob = (e) => {
        console.log(this);
        console.log(e);

        if (powerOn) {
            lastTouched = this;
            lastTouched.initPos = e.clientY;
            window.addEventListener('mousemove', lastTouched.updatePosition);
            window.addEventListener('mouseup', lastTouched.handleMouseUp);
        }
    }

    updatePosition = (e) => {
        let {element, initPos, currentRot} = this;
    
        const currentPos = e.clientY;
        const delta = initPos - currentPos;
        let result = delta*1.5;
        
        if (currentRot + result >= -150 && currentRot + result <= 150) {
            if (currentRot * result < 0) {
                result = result + currentRot;
            } else {
                if (currentRot < result) {
                    result = result + currentRot;
                }
            }
            // if ((result + 30) % 30 == 0) 
            element.style.transform = `rotate(${result}deg)`;
        }
    }  
    
    handleMouseUp = () => {
        window.removeEventListener('mousemove', lastTouched.updatePosition);
        window.removeEventListener('mouseup', lastTouched.handleMouseUp);
        lastTouched.initPos = null;

        if (lastTouched.element.style.transform) {
            lastTouched.currentRot = parseInt(lastTouched.element.style.transform.split('(')[1].split('d')[0]);
        }  
    }
}

const power = document.querySelector('.power-led');
const engage = document.querySelector('.engage-button');
const odEl = document.querySelector('.overdrive');
const toneEl = document.querySelector('.tone');
const levelEl = document.querySelector('.level');

const od = new Knob(odEl, null, 0);
const tone = new Knob(toneEl, null, 0);
const level = new Knob(levelEl, null, 0);
const knobs = [od, tone, level];

let powerOn = false;
let lastTouched = null;

const handleEngage = () => {
    if (powerOn) {
        power.classList.remove('on');
        powerOn = false;
        return;
    }
    power.classList.add('on');
    powerOn = true;
}

const initApp = () => {
    engage.addEventListener('click', handleEngage);
    for (let knob of knobs) {   
        knob.element.addEventListener('mousedown', knob.handleKnob);
        knob.element.addEventListener('dblclick', knob.handleReset);
    }
}

initApp();