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
    console.log(this._fps);
    this._view.fillText(this._fps, 200, 200, 1000);
  }

  update() {
    if (!this._startTime) this._startTime = performance.now();
    const now = performance.now()
    const singleFrameElapsed = now - this._startTime;
    this._elapsed += singleFrameElapsed;
    this._frameCount++;
    if (this._elapsed + singleFrameElapsed >= this._throttleInterval) {
      this._fps = Math.floor(10 * (1000 / (this._elapsed / this._frameCount))) / 10;
      this._frameCount = 0;
      this._elapsed = 0;
      this._updateView();
    }
    this._startTime = now;
  }

  get fps() {
    return this._fps;
  }
}