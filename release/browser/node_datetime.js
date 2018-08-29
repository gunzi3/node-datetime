(function () {var module = {exports: {}};var exports = module.exports;var FORMATS = {y: getYear,Y: getFullYear,m: getMonth,n: getMonthName,f: getMonthFullName,d: getDay,    D: getFormattedDay,H: getMilitaryHours,I: getHours,M: getMinutes,S: getSeconds,N: getMillisec,w: getWeekday,W: getFullWeekday,p: getPeriod};var PERIOD = {AM: 'AM',PM: 'PM'};var WEEKS = {ABB: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],FULL: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']};var MONTHS = {ABB: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],FULL: ['January','February','March','April','May','June','July','August','September','October','November','December']};var ONEDAY = 86400000;var ONEHOUR = 3600000;function DateTime(now, defaultFormat) {this._created = Date.now();this._now = (now) ? new Date(now) : new Date();this._delta = this._created - this._now.getTime();this._defaultFormat = defaultFormat || null;}DateTime.setWeekNames = function (names) {for (var i = 0, len = names.length; i < len; i++) {if (!names[i]) {continue;}WEEKS.FULL[i] = names[i];}};DateTime.setShortWeekNames = function (names) {for (var i = 0, len = names.length; i < len; i++) {if (!names[i]) {continue;}WEEKS.ABB[i] = names[i];}};DateTime.setPeriod = function (period) {if (period[0]) {PERIOD.AM = period[0];}if (period[1]) {PERIOD.PM = period[1];}};DateTime.setMonthNames = function (names) {for (var i = 0, len = names.length; i < len; i++) {if (!names[i]) {continue;}MONTHS.FULL[i] = names[i];}};DateTime.setShortMonthNames = function (names) {for (var i = 0, len = names.length; i < len; i++) {if (!names[i]) {continue;}MONTHS.ABB[i] = names[i];}};DateTime.prototype.format = function (format) {if (!format && this._defaultFormat) {format = this._defaultFormat;}var str = '';for (var i = 0, len = format.length; i < len; i++) {str += this._convert(format[i]);}return str;};DateTime.prototype.now = function () {return Date.now() - this._delta;};DateTime.prototype.epoch = function () {return Math.floor(this.getTime() / 1000);};DateTime.prototype.getTime = function () {return this._now.getTime();};DateTime.prototype.offsetInDays = function (offset) {var next = new Date(this._now);next.setDate(next.getDate() + offset);this._now = next;this._updateDelta();};DateTime.prototype.offsetInHours = function (offset) {var next = new Date(this._now);next.setHours(next.getHours() + offset);this._now = next;this._updateDelta();};DateTime.prototype.getDatesInRange = function (dateObj) {if (dateObj instanceof DateTime) {dateObj = dateObj._now;}if (this.getTime() >= dateObj.getTime()) {throw new Error('start time cannot be greater than the end time');}var list = [];var dir = (dateObj.getTime() >= this.getTime()) ? 1 : -1;var diff = dateObj.getTime() - this.getTime() * dir;var current = new DateTime(this._now);while (diff > 0) {list.push(current);var next = new DateTime(current.getTime());next.offsetInDays(1 * dir);current = next;diff -= ONEDAY;}return list;};DateTime.prototype.getHoursInRange = function (dateObj) {if (dateObj instanceof DateTime) {dateObj = dateObj._now;}if (this._now.getTime() >= dateObj.getTime()) {throw new Error('start time cannot be greater than the end time');}var list = [];var dir = (dateObj.getTime() >= this._now.getTime()) ? 1 : -1;var diff = dateObj.getTime() - this._now.getTime() * dir;var current = new DateTime(this._now);while (diff > 0) {list.push(current);var next = new DateTime(current.getTime());next.offsetInHours(1 * dir);current = next;diff -= ONEHOUR;}return list;};DateTime.prototype._convert = function (formatFragment) {var converter = FORMATS[formatFragment];if (converter) {return converter(this._now);}return formatFragment;};DateTime.prototype._updateDelta = function () {this._delta = this._created - this._now.getTime();};function getYear(d) {var year = d.getFullYear().toString();return year.substring(year.length - 2);}function getFullYear(d) {return d.getFullYear();}function getMonth(d) {return pad(d.getMonth() + 1);}function getMonthName(d) {return MONTHS.ABB[d.getMonth()];}function getMonthFullName(d) {return MONTHS.FULL[d.getMonth()];}function getDay(d) {return pad(d.getDate());}function getFormattedDay(d) {    var _date = d.getDate();    if (_date > 10) {        return _date.toString() + 'th';    }    var date = _date.toString();    var lastDigit = parseInt(date[date.length - 1]);    switch (lastDigit) {        case 1:            lastDigit += 'st';            break;        case 2:            lastDigit += 'nd';            break;        case 3:            lastDigit += 'rd';            break;        default:            lastDigit += 'th';            break;    }    return date.substring(0, date.length - 1) + lastDigit;}function getMilitaryHours(d) {return pad(d.getHours());}function getHours(d) {var h = d.getHours();var hours = (h > 12) ? h - 12 : h; return pad(hours);}function getMinutes(d) {return pad(d.getMinutes());}function getSeconds(d) {return pad(d.getSeconds());}function getMillisec(d) {return mpad(d.getMilliseconds());}function getWeekday(d) {return WEEKS.ABB[d.getDay()];}function getFullWeekday(d) {return WEEKS.FULL[d.getDay()];}function getPeriod(d) {var hours = d.getHours();if (hours < 12) {return PERIOD.AM;}return PERIOD.PM;}function pad(n) {return (n < 10) ? '0' + n : n;}function mpad(n) {var padded = pad(n);return (typeof padded === 'string' || padded < 100) ? '0' + padded : padded; }var INC = 'inc';var DEC = 'dec';function TimedNumber(conf) {this.validate(conf);this.conf = conf;this.current = this.conf.init;this.lastUpdate = this.conf.lastUpdate || Date.now();}TimedNumber.prototype.getValue = function () {switch (this.conf.type) {case INC:return this.calculateCurrentValueForInc();case DEC:return this.calculateCurrentValueForDec();}};TimedNumber.prototype.inc = function (value) {if (!value || isNaN(value)) {return false;}if (this.current + value > this.conf.max) {return false;}if (this.current === this.conf.init) {this.lastUpdate = Date.now();}this.current += value;this.lastUpdate = Date.now();return true;};TimedNumber.prototype.dec = function (value) {if (!value || isNaN(value)) {return false;}if (this.current - value < this.conf.min) {return false;}if (this.current === this.conf.init) {this.lastUpdate = Date.now();}this.current -= value;this.lastUpdate = Date.now();return true;};TimedNumber.prototype.reset = function () {this.current = this.conf.init;this.lastUpdate = Date.now();};TimedNumber.prototype.getMaxValue = function () {return this.conf.max;};TimedNumber.prototype.getMinValue = function () {return this.conf.min;};TimedNumber.prototype.getInterval = function () {return this.conf.interval;};TimedNumber.prototype.getStep = function () {return this.conf.step;};TimedNumber.prototype.getLastUpdate = function () {return this.lastUpdate;};TimedNumber.prototype.toObject = function () {var obj = {};obj.current = this.current;obj.lastUpdate = this.lastUpdate;for (var key in this.conf) {obj[key] = this.conf[key];}return obj;};TimedNumber.prototype.validate = function (conf) {if (!conf.hasOwnProperty('max') || isNaN(conf.max)) {throw new Error('invalid max: ' + conf.max);}if (!conf.hasOwnProperty('min') || isNaN(conf.min) || conf.min >= conf.max) {throw new Error('invalid min: ' + conf.min);}if (!conf.hasOwnProperty('interval') || isNaN(conf.interval) || conf.interval <= 0) {throw new Error('invalid interval: ' + conf.interval);}if (!conf.hasOwnProperty('type') || (conf.type !== INC && conf.type !== DEC)) {throw new Error('invalid type: ' + conf.type);}if (!conf.hasOwnProperty('init') || isNaN(conf.init) || conf.init <= 0) {throw new Error('invalid init: ' + conf.init);}if (!conf.hasOwnProperty('step') || isNaN(conf.step) || conf.step <= 0) {throw new Error('invalid step: ' + conf.step);}if (conf.type === INC && conf.step > conf.max) {throw new Error('step must not be greater than max');}if (conf.type === DEC && conf.step < conf.min) {throw new Error('step must not be smaller than min');}};TimedNumber.prototype.calculateCurrentValueForInc = function () {if (this.current === this.conf.max) {return this.current;}var now = Date.now();var timePast = now - this.lastUpdate;var steps = Math.floor(timePast / this.conf.interval);var incValue = this.conf.step * steps;this.current = (this.current + incValue <= this.conf.max) ? this.current + incValue : this.conf.max;if (incValue) {this.lastUpdate = now;}return this.current;};TimedNumber.prototype.calculateCurrentValueForDec = function () {if (this.current === this.conf.min) {return this.current;}var now = Date.now();var timePast = now - this.lastUpdate;var steps = Math.floor(timePast / this.conf.interval);var decValue = this.conf.step * steps;this.current = (this.current - decValue >= this.conf.min) ? this.current - decValue : this.conf.min;if (decValue) {this.lastUpdate = now;}return this.current;};function TimedState(conf) {this.validate(conf);this.conf = conf;this.length = this.conf.states.length;this.current = this.conf.init;this.lastUpdate = this.conf.lastUpdate || Date.now();}TimedState.prototype.getState = function () {var now = Date.now();var timePast = now - this.lastUpdate;var steps = Math.floor(timePast / this.conf.interval);var nextPos = steps + this.current;if (nextPos >= this.length) {if (this.conf.loop) {nextPos = (steps + this.current) - (this.length);} else {nextPos = this.length - 1;}}return this.conf.states[nextPos];};TimedState.prototype.forward = function (value) {if (!value) {value = 1;}if (!value || isNaN(value)) {return false;}if (this.current + value >= this.length) {return false;}if (this.current === this.conf.init) {this.lastUpdate = Date.now();}this.current += value;this.lastUpdate = Date.now();return true;};TimedState.prototype.backward = function (value) {if (!value) {value = 1;}if (!value || isNaN(value)) {return false;}if (this.current - value < 0) {return false;}if (this.current === this.conf.init) {this.lastUpdate = Date.now();}this.current -= value;this.lastUpdate = Date.now();return true;};TimedState.prototype.reset = function () {this.current = this.conf.init;this.lastUpdate = Date.now();};TimedState.prototype.getStates = function () {return this.conf.states.map(function (elm) {return elm;});};TimedState.prototype.getInterval = function () {return this.conf.interval;};TimedState.prototype.getLastUpdate = function () {return this.lastUpdate;};TimedState.prototype.toObject = function () {var obj = {};obj.current = this.current;obj.lastUpdate = this.lastUpdate;for (var key in this.conf) {obj[key] = this.conf[key];}return obj;};TimedState.prototype.validate = function (conf) {if (!conf.hasOwnProperty('states') || !Array.isArray(conf.states) || conf.states.length === 0) {throw new Error('invalid states: ' + conf.states);}if (!conf.hasOwnProperty('interval') || isNaN(conf.interval) || conf.interval <= 0) {throw new Error('invalid interval: ' + conf.interval);}if (!conf.hasOwnProperty('init') || isNaN(conf.init) || conf.init < 0) {throw new Error('invalid init: ' + conf.init);}};var offsets = {days: 0,hours: 0};var globalDefaultFormat = null;exports.setOffsetInDays = function (d) {if (isNaN(d)) {throw new Error('invalidOffset');}offsets.days = d;};exports.setOffsetInHours = function (h) {if (isNaN(h)) {throw new Error('invalidOffset');}offsets.hours = h;};exports.setDefaultFormat = function (format) {globalDefaultFormat = format;};exports.setWeekNames = function (list) {DateTime.setWeekNames(list);};exports.setShortWeekNames = function (list) {DateTime.setShortWeekNames(list);};exports.setMonthName = function (list) {DateTime.setMonthName(list);};exports.setShortMonthNames = function (list) {DateTime.setShortMonthName(list);};exports.setPeriod = function (list) {DateTime.setPeriod(list);};exports.create = function (now, defaultFormat) {if (!defaultFormat && globalDefaultFormat) {defaultFormat = globalDefaultFormat;}var d = new DateTime(now, defaultFormat);if (offsets.days !== 0) {d.offsetInDays(offsets.days);}if (offsets.hours !== 0) {d.offsetInHours(offsets.hours);}return d;};exports.createTimedNumber = function (conf) {return new TimedNumber(conf);};exports.createTimedState = function (conf) {return new TimedState(conf);};if (window.DateTime) {console.warn('window.DateTime already exists');console.warn('window.__DateTime created instead');window.__DateTime = exports;} else {window.DateTime = exports;}}());