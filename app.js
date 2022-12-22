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
const MAX_RMF = 55;
let timer = null;

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
    constructor(element, initPos, initAngle) {
        this.element = element;
        this.initPos = initPos;
        this.initAngle = initAngle;
    }

    handleReset = () => {    
        if (powerOn) {
            this.element.style.transform = `rotate(0deg)`;
            this.initAngle = 0;
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

    handleResetTouch = () => {
        if (!timer) {
            timer = setTimeout(() => {
                clearTimeout(timer);
                timer = null;
            }, 200);
            return;
        }
        // if the function is called during the 200 ms window where timer has a value, reset
        this.handleReset();
    }

    updatePosition = (e) => {
        let {element, initPos, initAngle} = this;
        let currentPos;
        
        if (e.type == 'touchmove') {
           const touch = e.touches[0];
            currentPos = touch.clientY;
        } else {
            currentPos = e.clientY;
        }
        const delta = initPos - currentPos;
        const rotation = delta*1.5;  
        const newAngle = initAngle + rotation;
        
        if (newAngle >= -150 && newAngle <= 150) {
            element.style.transform = `rotate(${newAngle}deg)`;

            // EFFECT

            if (this == level) {
                Tone.Master.volume.value = 
                (((newAngle + 150) / 300) * 32) - 30;
            }
            else if (this == tone) {
                filter.frequency.value = 
                ((newAngle + 150) / 300) * MAX_FREQ;
            }
            else if (this == od) {
                dist.distortion = 
                ((newAngle + 150) / 300) * MAX_DIST;
            }
            else if (this == modKnob) {
                ringMod.frequency.value = 
                ((newAngle + 150) / 300) * MAX_RMF;
            }
        }
    } 

    handleKnob = (e) => {
        if (powerOn) {
        
            if (e.type == 'touchstart') {
               const touch = e.touches[0];
                this.initPos = touch.clientY;
            } else {
                this.initPos = e.clientY;
            }

            window.addEventListener('mousemove', this.updatePosition);
            window.addEventListener('touchmove', this.updatePosition);
            window.addEventListener('mouseup', this.handleMouseUp);
            window.addEventListener('touchend', this.handleMouseUp);
        }
    } 
    
    handleMouseUp = () => {
        window.removeEventListener('mousemove', this.updatePosition);
        window.removeEventListener('touchmove', this.updatePosition);
        window.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('touchend', this.handleMouseUp);
        
        if (this.element.style.transform)
        this.initAngle = parseInt(this.element.style.transform.split('(')[1].split('d')[0]);
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

const init = () => {
    engage.addEventListener('click', handleEngage);
    play.addEventListener('click', handlePlay);
    ringModEl.addEventListener('click', handleRingMod);
    timeCue.addEventListener('ended', handleEnd);

    for (let knob of knobs) {   
        knob.element.addEventListener('mousedown', knob.handleKnob);
        knob.element.addEventListener('touchstart', knob.handleKnob);
        knob.element.addEventListener('dblclick', knob.handleReset);
        knob.element.addEventListener('touchend', knob.handleResetTouch);
    }
}

init();