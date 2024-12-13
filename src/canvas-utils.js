'use strict'; {

/* ======================== Canvas ======================== */
class Canvas {
	constructor (rgbaColor) {
		this.element = document.createElement('canvas');
		this.element.setAttribute('id', 'canvas');
		this.element.setAttribute('style', '');
		this.ctx = this.element.getContext('2d');
		const element = document.createElement('canvas');
		this.cache = { ctx: element.getContext('2d'), element };
		this.color = (rgbaColor?.length == 4) ? [...rgbaColor] : [0, 0, 0, 1.0];
		this.setColor(this.color);
	};
	appendTo = function (wrap) {
		wrap.appendChild(this.element);
		this.update();
	};
	base64ToClipboard = function (mimeType, transparentBackground=false) {
		this.cache.element.width = this.element.clientWidth;
		this.cache.element.height = this.element.clientHeight;
		if (!transparentBackground) {
			this.setColor(this.color);
			this.cache.ctx.fillRect(0, 0, this.element.clientWidth, this.element.clientHeight);
		}
		this.cache.ctx.drawImage(this.element, 0, 0);
		this.cache.ctx.closePath();
		window.navigator.clipboard.writeText(this.cache.element.toDataURL(mimeType));
		this.cache.element.width = this.element.clientWidth;
		this.cache.element.height = this.element.clientHeight;
	};
	setColor = function (rgbaColor) {
		if (rgbaColor.length != 4) return;
		this.color = [window.parseInt(rgbaColor[0]), window.parseInt(rgbaColor[1]), window.parseInt(rgbaColor[2]), window.parseFloat(rgbaColor[3])];
		this.element.style.backgroundColor = `rgba(${this.color.join(',')})`;
		this.cache.ctx.fillStyle = `rgba(${this.color.join(',')})`;
	};
	resize = function () {
		this.cache.element.width = this.element.clientWidth;
		this.cache.element.height = this.element.clientHeight;
		this.cache.ctx.drawImage(this.element, 0, 0);
		this.cache.ctx.closePath();
		this.update();
		this.ctx.drawImage(this.cache.element, 0, 0);
		this.ctx.closePath();
	};
	update = function () {
		this.element.width = this.element.clientWidth;
		this.element.height = this.element.clientHeight;
		this.element.style.backgroundColor = `rgba(${this.color.join(',')})`;
		this.ctx.clearRect(0, 0, this.element.clientWidth, this.element.clientHeight);
		this.ctx.closePath();
	};
};

/* ======================== Brush ======================== */
class Brush {
	constructor (canvas, size, rgbaColor, isSquare=false) {
		this.canvas = canvas;
		this.lineLoopId = -1;
		this.halfSize = -1;
		this.isSquare = isSquare == true;
		this.color = (rgbaColor?.length == 4) ? [...rgbaColor] : [255, 255, 255, 1.0];
		this.size = Math.max(1, window.parseInt(size));
		this.x = -(this.size*2);
		this.y = -(this.size*2);
		this.element = document.createElement('div');
		this.element.setAttribute('id', 'brush');
		this.element.setAttribute('style', '');
		this.setColor(this.color);
		this.setSize(this.size);
	};
	appendTo = function (wrap) {
		wrap.appendChild(this.element);
		this.updateBrush();
	};
	updateBrush = function () {
		this.canvas.ctx.lineWidth = this.size;
		this.canvas.ctx.strokeStyle = `rgba(${this.color.join(',')})`;
		this.canvas.ctx.lineCap = this.isSquare ? 'square' : 'round';
		this.canvas.ctx.imageSmoothingEnabled = false;
	};
	setColor = function(rgbaColor) {
		if (rgbaColor.length != 4) return;
		this.color = [window.parseInt(rgbaColor[0]), window.parseInt(rgbaColor[1]), window.parseInt(rgbaColor[2]), window.parseFloat(rgbaColor[3])];
		this.element.style.backgroundColor = `rgba(${this.color.join(',')})`;
		this.element.style.borderRadius = this.isSquare ? '0' : '50%';
		this.updateBrush();
	};
	setSize = function (size) {
		this.size = Math.max(1, window.parseInt(size));
		this.halfSize = window.parseInt(this.size/2);
		this.element.style.width = `${this.size}px`;
		this.element.style.height = `${this.size}px`;
		this.updateBrush();
	};
	setBrushPosition = function (x, y) {
		this.x = x - this.canvas.element.clientLeft;
		this.y = y - this.canvas.element.clientTop;
	};
	drawStopEvent = function (evt) {
		evt.preventDefault();
		if (this.x < 0 || this.y < 0) return;
		this.canvas.ctx.lineTo(this.x, this.y);
		this.canvas.ctx.stroke();
		this.canvas.ctx.closePath();
		this.x = -(this.size+1);
		this.y = -(this.size+1);
		this.#lineLoopStop();
	};
	drawStartEvent = function (evt) {
		evt.preventDefault();
		this.#lineLoopStop();
		this.setBrushPosition(evt.clientX, evt.clientY);
		this.canvas.ctx.beginPath();
		this.canvas.ctx.moveTo(this.x, this.y);
		this.drawMoveEvent(evt);
		this.#lineLoopStart();
	};
	drawMoveEvent = function (evt) {
		evt.preventDefault();
		this.element.style.left = `${evt.clientX - this.halfSize - 1}px`;
		this.element.style.top = `${evt.clientY - this.halfSize - 1}px`;
		if (this.x < 0 || this.y < 0) return;
		this.setBrushPosition(evt.clientX, evt.clientY);
		this.canvas.ctx.lineTo(this.x, this.y);
		this.canvas.ctx.stroke();
	};
	#lineLoopStop = function () {
		if (this.lineLoopId == -1) return;
		window.cancelAnimationFrame(this.lineLoopId);
		this.lineLoopId = -1;
	};
	#lineLoopStart = function () {
		if (this.x < 0 || this.y < 0)
			return this.#lineLoopStop();
		this.canvas.ctx.lineTo(this.x, this.y);
		this.canvas.ctx.stroke();
		this.lineLoopId = window.requestAnimationFrame(() => this.#lineLoopStart());
	};
};

/* ======================================================= */
window.Canvas = rgbaColor => new Canvas(rgbaColor);
window.Brush = (canvas, size, rgbaColor, isSquare=false) => new Brush(canvas, size, rgbaColor, isSquare);
};
