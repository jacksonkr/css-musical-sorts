"use strict";
//http://localhost/~Jackson/css-musical-sorts/

/**
random notes
sorts are from https://khan4019.github.io/front-end-Interview-Questions/sort.html
every line accessed needs to perform a tone
**/

// function() { // start scope wrap @jkr

// using ES5 to support old browsers - everyone wants to be involed :D  @jkr

function CSSMusicalSorts(divId) {
	// return;
	try {
		if(!divId) throw "no divID given, give CSSMusicalSorts some params";
		if(!(window.AudioContext || window.webkitAudioContext || window.audioContext))
			"This browser doesn't support audio context";

		// main construct @jkr
		this._divId = divId;
		this._sortIndex = -1;
		this._sorts = [];
		this._toneIsPlaying = false;

		// init audio @jkr
		this._audioCtx = new (window.AudioContext || window.webkitAudioContext || window.audioContext);
		this._osc = this._audioCtx.createOscillator();
		this._gain = this._audioCtx.createGain();

		// config audio @jkr
		this._gain.gain.value = CSSMusicalSorts.TONE_VOLUME;
		this._osc.type = CSSMusicalSorts.TONE_TYPE;
		this._osc.connect(this._gain);
		this._gain.connect(this._audioCtx.destination);

		var self = this;

		this.updateVisuals();
	} catch(e) {
		alert("This experience isn't going to work on your computer :(");
		console.error(e);
	}
}
// CSSMusicalSorts.instance;
CSSMusicalSorts.SAMPLE_ARRAY_LENGTH = 10;
CSSMusicalSorts.TOUCH_END_DELAY = 100; //ms
CSSMusicalSorts.COMPLETION_STEP_DURATION = 50; //ms
CSSMusicalSorts.STEP_DURATION = 10; // ms
CSSMusicalSorts.TONE_FREQUENCY_MIN = 40; // hz
CSSMusicalSorts.TONE_FREQUENCY_MAX = 1000; //hz
CSSMusicalSorts.TONE_TYPE = "triangle";
CSSMusicalSorts.TONE_VOLUME = 0.1;
CSSMusicalSorts.ALGO_BUBBLE_SORT = function(instance) {
	var statusObj = instance.getStatusObj();
	var arr = statusObj.arr;
	var len = arr.length;
	if(statusObj.i == undefined) {
		statusObj.i = len-1;
		statusObj.j = 1;
	}
	var i = statusObj.i;
	var j = statusObj.j;

	instance.toneCallback(i);

	if(i >= 0) {
		if(j <= i) {
			instance.indexTouched(j);
			if(arr[j-1] > arr[j]) {
				var temp = arr[j-1];
				arr[j-1] = arr[j];
				arr[j] = temp;
				instance.valueSwapped(j-1, j);
			}
		} 
		if(++statusObj.j > i) {
			--statusObj.i;
			statusObj.j = 0;
		}
		return instance.stepComplete();
	}
    
    return null;
}

/**
 * this function is called for every time a sort algo completes a loop
 * @jkr
 */
CSSMusicalSorts.prototype.stepComplete = function() {
	this.updateVisuals();
}
/**
 * updates display based on current array info
 **/
CSSMusicalSorts.prototype.updateVisuals = function() {
	var rootDiv = document.getElementById(this._divId);
	var values = document.getElementsByClassName("cssms-value");

	if(!this._statusObj) {
		// clear visuals
		while(values.length) {
			var o = values[0];
			rootDiv.removeChild(o);
		}
		return;
	}

	var arr = this._statusObj.arr;

	if(values.length <= 0) {
		// no values yet, set them up
		for(var i in arr) {
			var o = arr[i];
			var ele = document.createElement("div");
			ele.id = "cssms-value-" + i;
			ele.classList.add("cssms-value");
			var perc = o / arr.length * 100;
			ele.style.height = perc + "%";
			// ele.style.top = 100 - perc + "px";
			rootDiv.appendChild(ele);
		}
	}
}
CSSMusicalSorts.prototype.valueSwapped = function(fromId, toId) {
	// this.indexTouched(fromId);
	// this.indexTouched(toId);

	var fromEle = document.getElementById("cssms-value-" + fromId);
	var toEle = document.getElementById("cssms-value-" + toId);

	var temp = fromEle.style.height;
	fromEle.style.height = toEle.style.height;
	toEle.style.height = temp;

	// var toCopy = toEle.cloneNode(true);
 //    fromEle.parentNode.insertBefore(toCopy, fromEle);
 //    toEle.parentNode.insertBefore(fromEle, toEle);
 //    toEle.parentNode.replaceChild(toEle, toCopy);
}
CSSMusicalSorts.prototype.indexTouched = function(id) {
	// console.log("touching " + id);
	var ele = document.getElementById("cssms-value-" + id);
	ele.classList.remove("touched");
	ele.classList.add("touched");
	setTimeout(function() {
		ele.classList.remove("touched");
	}, CSSMusicalSorts.TOUCH_END_DELAY);
}
/**
 * this functions creates a tone base on current array size vs input value.
 * input value and tone pitch are related
 * @jkr
 */
CSSMusicalSorts.prototype.toneCallback = function(value) {
	var percent = value / this._statusObj.arr.length;
	var toneRange = (CSSMusicalSorts.TONE_FREQUENCY_MAX - CSSMusicalSorts.TONE_FREQUENCY_MIN);
	var tone = toneRange * percent + CSSMusicalSorts.TONE_FREQUENCY_MIN;
	// console.log("Playing tone at " + tone + " hz");
	this._osc.frequency.value = tone;
	if(this._toneIsPlaying == false) {
		this._toneIsPlaying = true;
		this._osc.start();
	}
	var self = this;
}
CSSMusicalSorts.prototype.addSort = function(recursiveAlgo) {
	this._sorts.push(recursiveAlgo);
}
/**
 * start of the experience
 */
CSSMusicalSorts.prototype.start = function() {
	this.nextSort();
}
CSSMusicalSorts.prototype.nextSort = function() {
	this._statusObj = {};
	this._statusObj.arr = this.generateSampleData();

	if(++this._sortIndex >= this._sorts.length) {
		// there are no more algos to run
		this.stopOscillator();
		console.log("experience over");
		return;
	}

	console.log("nextSort", this._statusObj.arr);

	this.updateVisuals();

	this.step();
}
CSSMusicalSorts.prototype.stopOscillator = function() {
	if(this._toneIsPlaying == true) {
		this._osc.stop();
	}
}
CSSMusicalSorts.prototype.step = function() {
	var algo = this._sorts[this._sortIndex];
	// console.log("i " + this._statusObj.i);
	if(algo(this) !== null) {
		this.stepContinue();
		return;
	}
	
	this.loopComplete();
}
CSSMusicalSorts.prototype.stepContinue = function() {
	var self = this;
	setTimeout(function() {
		// self.stopOscillator();
		self.step();
	}, CSSMusicalSorts.STEP_DURATION);
}
CSSMusicalSorts.prototype.getStatusObj = function() {
	return this._statusObj;
}
/**
 * mark each value green and play tone @jkr
 */
CSSMusicalSorts.prototype.loopComplete = function() {
	this.updateVisuals();
	console.log("loopComplete", this._statusObj.arr);

	var divs = document.getElementsByClassName("cssms-value");

	for(var i in divs) {
		var o = divs[i];
		var self = this;

		var t = CSSMusicalSorts.COMPLETION_STEP_DURATION * divs.length;
		if(isFinite(o)) {
			return setTimeout(function() {
				// 'divs' has a "length" param at the end. When we've hit that then end the completion @jkr
				self.stopOscillator();
			}, t);
		}

		var store = {'o':o, 'i':+i};
		t = i*CSSMusicalSorts.COMPLETION_STEP_DURATION;
		this.runFuncWithDelay(function(obj) {
			self.indexTouched(obj.i);
			self.markDivComplete(obj.o);
			var val = self.getArrValueByDiv(obj.o);
			self.toneCallback(val);
		}, t, store);
	}

	// this.nextSort();
}
CSSMusicalSorts.prototype.runFuncWithDelay = function(f, delay, obj) {
	setTimeout(function() {
		f(obj);
	}, delay);
}
CSSMusicalSorts.prototype.markDivComplete = function(div) {
	div.classList.add("complete");
}
CSSMusicalSorts.prototype.getArrValueByDiv = function(div) {
	var m = div.id.match(/cssms\-value\-(\d+)/);
	var id = +m[1];
	var val = this._statusObj.arr[id];
	return val;
}
CSSMusicalSorts.prototype.generateSampleData = function() {
	var arr = [];

	while(arr.length < CSSMusicalSorts.SAMPLE_ARRAY_LENGTH) arr.push(arr.length+1);

	// https://stackoverflow.com/a/6274381/332578
    var j, x, i;
    for (i = arr.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = arr[i];
        arr[i] = arr[j];
        arr[j] = x;
    }
    return arr;
}

// }(); // end scope wrap @jkr