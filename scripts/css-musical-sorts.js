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
		this._isOscillatorOn = false;

		// init audio @jkr
		this._audioCtx = new (window.AudioContext || window.webkitAudioContext || window.audioContext);
		this._osc = this._audioCtx.createOscillator();
		this._gain = this._audioCtx.createGain();

		// config audio @jkr
		this._gain.gain.value = CSSMusicalSorts.TONE_VOLUME;
		this._osc.type = CSSMusicalSorts.TONE_TYPE;
		this._gain.connect(this._audioCtx.destination);
		this.startOscillator();
		this._osc.start();

		var self = this;

		this.updateVisuals();
	} catch(e) {
		alert("This experience isn't going to work on your computer :(");
		console.error(e);
	}
}
// CSSMusicalSorts.instance;
CSSMusicalSorts.SAMPLE_ARRAY_LENGTH = 30;
CSSMusicalSorts.TOUCH_END_DELAY = 100; //ms
/*
 * This is for when the sorting is done and the 
 */
CSSMusicalSorts.COMPLETION_STEP_DURATION = 30;//CSSMusicalSorts.SAMPLE_ARRAY_LENGTH / 5; //ms
CSSMusicalSorts.COMPLETION_LAST_STEP_DURATION = 300; //ms
CSSMusicalSorts.DURATION_TIL_NEXT_SORT = 3000; //ms
CSSMusicalSorts.STEP_DURATION = 10; // ms
CSSMusicalSorts.TONE_FREQUENCY_MIN = 80; // hz
CSSMusicalSorts.TONE_FREQUENCY_MAX = 1300; //hz
CSSMusicalSorts.TONE_TYPE = "triangle";
CSSMusicalSorts.TONE_VOLUME = 0.2;
CSSMusicalSorts.ALGO_BUBBLE_SORT = {
	name: "Bubble Sort",
	f: function(instance) {
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
				instance.toneCallback(arr[statusObj.j]);
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
}
CSSMusicalSorts.ALGO_SELECTION_SORT = {
	name: "Selection Sort",
	f: function(instance) {
		var statusObj = instance.getStatusObj();
		if(statusObj.i == undefined) {
			statusObj.i = 0;
			statusObj.j = 1;
		}

		var temp, minIdx;
		var arr = statusObj.arr;

		instance.toneCallback(statusObj.i);

		if(statusObj.i < arr.length) { // loop
			minIdx = statusObj.i;
			if(statusObj.j < arr.length) { // loop
				instance.indexTouched(statusObj.j);
				instance.toneCallback(arr[statusObj.j]);
				if(arr[statusObj.j] < arr[minIdx]) {
					minIdx = statusObj.j;
				}
			}
			temp = arr[statusObj.i];
			instance.valueSwapped(statusObj.i, minIdx);
			arr[statusObj.i] = arr[minIdx];
			arr[minIdx] = temp;

			if(++statusObj.j >= arr.length) {
				statusObj.j = ++statusObj.i + 1;
			}

			return instance.stepComplete();
		}

		return null;
	}
}

/**
 * this function is called for every time a sort algo completes a loop
 * @jkr
 */
CSSMusicalSorts.prototype.stepComplete = function() {
	this.updateVisuals();
}
CSSMusicalSorts.prototype.updateTitle = function() {
	var div = document.getElementById("cssms-sort-name");
	if(!div) {
		div = document.createElement("div");
		div.id = "cssms-sort-name";
		var root = document.getElementById(this._divId);
		root.appendChild(div);
	}
	var sort = this._sorts[this._sortIndex];
	div.innerHTML = sort.name;
}
/**
 * updates display based on current array info
 **/
CSSMusicalSorts.prototype.updateVisuals = function() {
	var rootDiv = document.getElementById(this._divId);
	var values = document.getElementsByClassName("cssms-value");

	if(!this._statusObj || !this._statusObj.arr) {
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
CSSMusicalSorts.prototype.defaultSorts = function() {
	this.addSort(CSSMusicalSorts.ALGO_SELECTION_SORT);
	this.addSort(CSSMusicalSorts.ALGO_BUBBLE_SORT);
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
	this.startOscillator();
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
	this.updateVisuals();
	this._statusObj.arr = this.generateSampleData();

	if(++this._sortIndex >= this._sorts.length) {
		// there are no more algos to run
		// this.stopOscillator();
		// console.log("experience over");
		// return;
		
		//start over
		this._sortIndex = 0;
		if(true) return;
	}

	console.log("nextSort", this._statusObj.arr);

	this.updateTitle();
	this.updateVisuals();

	this.step();
}
CSSMusicalSorts.prototype.startOscillator = function() {
	if(this._isOscillatorOn == false) {
		this._isOscillatorOn = true;
		this._osc.connect(this._gain);
	}
}
CSSMusicalSorts.prototype.stopOscillator = function() {
	if(this._isOscillatorOn == true) {
		this._isOscillatorOn = false;
		this._osc.disconnect(this._gain);
	}
}
CSSMusicalSorts.prototype.step = function() {
	var algo = this._sorts[this._sortIndex].f;
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

	this.doCompletionAnimation();
}
CSSMusicalSorts.prototype.doCompletionAnimation = function() {
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
		t = i * CSSMusicalSorts.COMPLETION_STEP_DURATION;
		this.runFuncWithDelay(function(obj) {
			self.indexTouched(obj.i);
			self.markDivComplete(obj.o);
			var val = self.getArrValueByDiv(obj.o);
			self.toneCallback(val);
			if(obj.i == self._statusObj.arr.length-1) {
				// last item in array
				setTimeout(function() {
					self.nextSort();
				}, CSSMusicalSorts.DURATION_TIL_NEXT_SORT);
			}
		}, t, store);
	}
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