class FPSCounter {
  constructor({view, throttleInterval}) {
    this._view = view;
    this._canvasMode = false;
    this._DOMMode = false;
    if (view && view instanceof CanvasRenderingContext2D) {
      this._canvasMode = true;
    } else if (view && view instanceof Element) {
      this._DOMMode = true;
    } else {
      throw new Error('Wrong "view" parameter passed to constructor');
    }

    this._startTime;
    this._elapsed = 0;
    this._fps = 0;
    this._frameCount = 0;
    this._throttleInterval = throttleInterval || 100;
  }

  initView() {
    this._updateView();
  }

  _updateView() {
    let fpsText = this._fps;
    if (this._canvasMode) {
      if (this._fps % 1 === 0) {
        fpsText = `${fpsText}.0`;
      }
      this._view.textBaseline = 'top';
      this._view.font = '3vw sans-serif';
      this._view.fillText(fpsText, 20, 20);
    }
  }

  update() {
    const now = performance.now();
    if (!this._startTime) {
      this._startTime = now;
      return;
    }
    const singleFrameElapsed = now - this._startTime;
    this._elapsed += singleFrameElapsed;
    this._frameCount++;
    if (this._elapsed >= this._throttleInterval) {
      this._fps = Math.floor(10 * (1000 / (this._elapsed / this._frameCount))) / 10;
      this._frameCount = 0;
      this._elapsed = 0;
    }
    this._updateView();
    this._startTime = now;
  }

  get fps() {
    return this._fps;
  }
}