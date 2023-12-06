export default class Knob {
  constructor(element, initPos, initAngle) {
    this.element = element;
    this.initPos = initPos;
    this.initAngle = initAngle;
  }

  handleReset = () => {
    this.element.style.transform = `rotate(0deg)`;
    this.initAngle = 0;
    if (this == level) {
      if (powerOn) {
        Tone.Master.volume.value = -14;
      }
    } else if (this == tone) {
      filter.frequency.value = MAX_FREQ / 2;
    } else if (this == od) {
      dist.distortion = MAX_DIST / 2;
    } else if (this == modKnob) {
      ringMod.frequency.value = MAX_RMF / 2;
    }
  };

  handleResetTouch = () => {
    if (!doubleTapTimer) {
      doubleTapTimer = setTimeout(() => {
        clearTimeout(doubleTapTimer);
        doubleTapTimer = null;
      }, 200);
      return;
    }
    // if knob is touched during the 200 ms window where timer has a value, reset
    this.handleReset();
  };

  updatePosition = (e) => {
    let { element, initPos, initAngle } = this;
    let currentPos;

    // ROTATION

    if (e.type == "touchmove") {
      const touch = e.touches[0];
      currentPos = touch.clientY;
    } else {
      currentPos = e.clientY;
    }
    const delta = initPos - currentPos;
    const rotation = delta * 1.5;
    const newAngle = initAngle + rotation;

    if (newAngle >= -150 && newAngle <= 150) {
      element.style.transform = `rotate(${newAngle}deg)`;

      // EFFECT

      if (this == level) {
        if (powerOn) {
          Tone.Master.volume.value = ((newAngle + 150) / 300) * 32 - 30;
        } else {
          storedVol = ((newAngle + 150) / 300) * 32 - 30;
        }
      } else if (this == tone) {
        filter.frequency.value = ((newAngle + 150) / 300) * MAX_FREQ;
      } else if (this == od) {
        dist.distortion = ((newAngle + 150) / 300) * MAX_DIST;
      } else if (this == modKnob) {
        ringMod.frequency.value = ((newAngle + 150) / 300) * MAX_RMF;
      }
    }
  };

  handleKnob = (e) => {
    if (e.type == "touchstart") {
      const touch = e.touches[0];
      this.initPos = touch.clientY;
    } else {
      this.initPos = e.clientY;
    }

    window.addEventListener("mousemove", this.updatePosition);
    window.addEventListener("touchmove", this.updatePosition);
    window.addEventListener("mouseup", this.handleMouseUp);
    window.addEventListener("touchend", this.handleMouseUp);
  };

  handleMouseUp = () => {
    window.removeEventListener("mousemove", this.updatePosition);
    window.removeEventListener("touchmove", this.updatePosition);
    window.removeEventListener("mouseup", this.handleMouseUp);
    window.removeEventListener("touchend", this.handleMouseUp);

    if (this.element.style.transform)
      this.initAngle = parseInt(
        this.element.style.transform.split("(")[1].split("d")[0]
      );
  };
}
