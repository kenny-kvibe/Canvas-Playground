'use strict'; {

const hexaToRgba = hexaColor => {
    hexaColor = hexaColor.replace(/^#/, '');
    if (hexaColor.length == 3 || hexaColor.length == 4)
        hexaColor = hexaColor.split('').map(c => c + c).join('');
    const r = window.parseInt(hexaColor.slice(0, 2), 16);
    const g = window.parseInt(hexaColor.slice(2, 4), 16);
    const b = window.parseInt(hexaColor.slice(4, 6), 16);
    const a = hexaColor.length == 8 ? window.parseInt(hexaColor.slice(6, 8), 16) / 255 : 1;
    return [r, g, b, a];
};

const rgbaToHexa = rgbaColor => {
    const r = window.parseInt(rgbaColor[0]).toString(16).padStart(2, '0');
    const g = window.parseInt(rgbaColor[1]).toString(16).padStart(2, '0');
    const b = window.parseInt(rgbaColor[2]).toString(16).padStart(2, '0');
    const a = rgbaColor.length == 4 ? Math.round(window.parseFloat(rgbaColor[3]) * 255).toString(16).padStart(2, '0') : 'ff';
    return `#${r}${g}${b}${a}`;
};

const initWindowEvents = (wrap, brush) => {
	const keys = {
		I: { code: 73, description: 'Key bindings information' },
		X: { code: 88, description: 'Reset the canvas' },
		S: { code: 83, description: 'Save canvas to clipboard as base64' },
		F: { code: 70, description: 'Flip between square and circle' },
		C: { code: 67, description: 'Set brush color' },
		B: { code: 66, description: 'Set canvas background color' },
	};
	const binds = {
		[keys.I.code]: evt => {
			evt.preventDefault();
			const keysInfo = Object.values(keys).map(key => `\t ${String.fromCharCode(key.code)}\t-\t${key.description}`).join('\n');
			window.alert(`––[  Keys Bindings  ]--\n\n${keysInfo}\n\n`);
		},
		[keys.X.code]: evt => {
			brush.drawStopEvent(evt);
			brush.canvas.update();
			brush.updateBrush();
		},
		[keys.S.code]: evt => {
			evt.preventDefault();
			const makeTransparent = window.confirm(`––[  Copy Canvas as Base64  ]--\n\nCanvas will be copied to clipboard as Base64 text.\nMake the background transparent ?\n\n`);
			brush.canvas.base64ToClipboard('image/png', makeTransparent);
		},
		[keys.F.code]: evt => {
			evt.preventDefault();
			brush.isSquare = !brush.isSquare;
			brush.setColor(brush.color);
		},
		[keys.C.code]: evt => {
			evt.preventDefault();
			showColorPicker(brush.color, brushColor => {
				brush.drawStopEvent(evt);
				brush.setColor(brushColor);
			});
		},
		[keys.B.code]: evt => {
			evt.preventDefault();
			showColorPicker(brush.canvas.color, canvasColor => {
				brush.drawStopEvent(evt);
				brush.canvas.setColor(canvasColor);
				brush.canvas.resize();
				brush.updateBrush();
			});
		},
	};
	const showColorPicker = (rgbaColor, colorCallbackFn) => {
		const colorPicker = document.createElement('input');
		const currentColorHexa = rgbaToHexa(rgbaColor).slice(0, 7);
		let interacted = -1;
		colorPicker.setAttribute('type', 'color');
		colorPicker.setAttribute('id', 'color-picker');
		colorPicker.setAttribute('value', currentColorHexa);
		colorPicker.addEventListener('click', evt => {
			if (interacted < 0)
				interacted = 0;
		}, false);
		colorPicker.addEventListener('input', evt => {
			evt.preventDefault();
			if (interacted == 2) {
				interacted = 3;
				return colorCallbackFn(hexaToRgba(colorPicker.value));
			}
			if (interacted == 0)
				interacted = 1;
		}, false);
		colorPicker.addEventListener('change', evt => {
			evt.preventDefault();
			const colorHexa = colorPicker.value;
			if (interacted < 0 || (interacted == 0 && colorHexa == '#000000') || (interacted == 1 && colorHexa == currentColorHexa))
				return;
			interacted = 2;
			return colorCallbackFn(hexaToRgba(colorHexa));
		}, false);
		wrap.appendChild(colorPicker);
		colorPicker.click();
	};
	window.addEventListener('touchend',    evt => brush.drawStopEvent(evt), false);
	window.addEventListener('touchcancel', evt => brush.drawStopEvent(evt), false);
	window.addEventListener('touchstart',  evt => brush.drawStartEvent(evt), false);
	window.addEventListener('touchmove',   evt => brush.drawMoveEvent(evt), false);
	window.addEventListener('mouseup',     evt => brush.drawStopEvent(evt), false);
	window.addEventListener('mousedown',   evt => brush.drawStartEvent(evt), false);
	window.addEventListener('mousemove',   evt => brush.drawMoveEvent(evt), false);
	window.addEventListener('mouseover',   evt => brush.drawMoveEvent(evt), false);
	window.addEventListener('wheel', evt => {
		evt.preventDefault();
		brush.setSize(evt.deltaY > 0 ? brush.size-1 : brush.size+1);
		brush.drawMoveEvent(evt);
	}, false);
	window.addEventListener('resize', evt => {
		evt.preventDefault();
		brush.canvas.resize();
		brush.updateBrush();
	}, false);
	window.addEventListener('keydown', evt => {
		const keyCode = evt.keyCode;
		if (keyCode in binds)
			binds[keyCode](evt);
	}, false);
};

const main = () => {
	window.oncontextmenu = () => false;
	const wrap = document.getElementById('wrap');
	if (wrap == null || [typeof window.Canvas, typeof window.Brush].includes('undefined')) return;
	const canvas = window.Canvas([20, 5, 0, 1]);
	const brush = window.Brush(canvas, 8, [255, 60, 0, 1], false);
	initWindowEvents(wrap, brush);
	brush.canvas.appendTo(wrap);
	brush.appendTo(wrap);
};

document.onreadystatechange = () => {
	if (document.readyState != 'complete') return;
	return main();
}};
