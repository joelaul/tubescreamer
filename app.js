// knobs get fucked up after reset. Figure it out

// DOM

const power = document.querySelector('.power-led');
const engage = document.querySelector('.engage-button');
const odEl = document.querySelector('.overdrive');
const toneEl = document.querySelector('.tone');
const levelEl = document.querySelector('.level');
const play = document.querySelector('.play');
const ringModEl = document.querySelector('.ringmod');
const modKnobEl = document.querySelector('.rm');
const timeCue = document.querySelector('audio');

// VARIABLES

let powerOn = false;
const MAX_DIST = 3;
const MAX_FREQ = 6000; 
const MAX_RMF = 100;

// TONE.JS

const spiro = new Tone.Player("larada di.wav").toDestination();

const dist = new Tone.Distortion(MAX_DIST / 2).toDestination();

const filter = new Tone.Filter(MAX_FREQ / 2, 'peaking').toDestination();
filter.gain.value = 20;
filter.Q.value = 1.5;
filter.rolloff = -12;

const ringMod = new Tone.FrequencyShifter(27).toDestination();

Tone.Master.volume.value = -14;

spiro.sync().start(0);

// MAKE KNOB CLASS

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
            if (this == level) {
                Tone.Master.volume.value = -14;
            }
            else if (this == tone) {
                filter.frequency.value = MAX_FREQ / 2;
            }
            else if (this == od) {
                dist.distortion = MAX_DIST / 2;
            }
            else if (this == modKnob) {
                ringMod.frequency.value = MAX_RMF / 2;
            }
        }
    }

    updatePosition = (e) => {
        let {element, initPos, currentRot} = this;
    
        const currentPos = e.clientY;
        const delta = initPos - currentPos;
        let result = delta*1.5;
        
        if (currentRot + result >= -150 && currentRot + result <= 150) {

            // KNOB ROTATION

            if (currentRot * result < 0) {
                result = result + currentRot;
            } else {
                if (currentRot < result) {
                    result = result + currentRot;
                }
            }
            element.style.transform = `rotate(${result}deg)`;

            // EFFECT

            if (this == level) {
                Tone.Master.volume.value = 
                (((result + 150) / 300) * 32) - 30;
            }
            else if (this == tone) {
                filter.frequency.value = 
                ((result + 150) / 300) * MAX_FREQ;
            }
            else if (this == od) {
                dist.distortion = 
                ((result + 150) / 300) * MAX_DIST;
            }
            else if (this == modKnob) {
                ringMod.frequency.value = 
                ((result + 150) / 300) * MAX_RMF;
            }
            console.log('mod knob');
        }
    } 

    handleKnob = (e) => {
        if (powerOn) {
            this.initPos = e.clientY;
            window.addEventListener('mousemove', this.updatePosition);
            window.addEventListener('mouseup', this.handleMouseUp);
            console.log()
        }
    } 
    
    handleMouseUp = () => {
        window.removeEventListener('mousemove', this.updatePosition);
        window.removeEventListener('mouseup', this.handleMouseUp);
        this.initPos = null;
        
        if (this.element.style.transform)
        this.currentRot = parseInt(this.element.style.transform.split('(')[1].split('d')[0]);
    }
}

// INSTANTIATE KNOBS

const od = new Knob(odEl, null, 0);
const tone = new Knob(toneEl, null, 0);
const level = new Knob(levelEl, null, 0);
const modKnob = new Knob(modKnobEl, null, 0);
const knobs = [od, tone, level, modKnob];

// INITIALIZE APP

const handleEngage = () => {
    if (powerOn) {
        power.classList.remove('on');
        modKnob
        powerOn = false;

        dist.disconnect();
        document.body.classList.remove('ring-mod-on');
        ringModEl.classList.remove('ring-mod-on-button');
        modKnobEl.classList.add('off');
        return;
    }
    power.classList.add('on');
    powerOn = true;

    spiro.chain(dist, filter, ringMod);

    if (ringModEl.ariaChecked == 'false') {
        ringMod.wet.value = 0;
    }
    else {
        document.body.classList.add('ring-mod-on');
        ringModEl.classList.add('ring-mod-on-button');
        modKnobEl.classList.remove('off');
    }
}

const handleRingMod = () => {
    if (powerOn) {
        if (ringModEl.ariaChecked == 'false') {
            ringMod.wet.value = 1;
            ringModEl.ariaChecked = 'true';
            document.body.classList.add('ring-mod-on');
            ringModEl.classList.add('ring-mod-on-button');
            modKnobEl.classList.remove('off');
            
        } else {
            ringMod.wet.value = 0;
            ringModEl.ariaChecked = 'false';
            document.body.classList.remove('ring-mod-on'); 
            ringModEl.classList.remove('ring-mod-on-button');   
            modKnobEl.classList.add('off');
        }
    }
}

const handlePlay = () => {
    Tone.start();

    if (play.ariaChecked == 'false') {
        play.textContent = 'Pause';
        play.ariaChecked = 'true';
        play.innerHTML = '<i class="fa-solid fa-pause"></i>';
        
        timeCue.play(); // shadow audio track in the html accessed on end to change pause icon back to play
        Tone.Transport.start();

    } else {
        timeCue.pause();
        play.textContent = 'Play';
        play.ariaChecked = 'false';
        play.innerHTML = '<i class="fa-solid fa-play"></i>';

        Tone.Transport.pause();
    }
}

const handleEnd = () => {
    Tone.Transport.stop();
    play.innerHTML = '<i class="fa-solid fa-play"></i>';
    play.ariaChecked = 'false';
}

const init = () => {6 
    engage.addEventListener('click', handleEngage);
    play.addEventListener('click', handlePlay);
    ringModEl.addEventListener('click', handleRingMod);
    timeCue.addEventListener('ended', handleEnd);

    for (let knob of knobs) {   
        knob.element.addEventListener('mousedown', knob.handleKnob);
        knob.element.addEventListener('dblclick', knob.handleReset);
    }
}

init();