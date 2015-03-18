function debugMessage(message) {
	document.write(message + '<br>');
};
function debugObject(object) {
	debugMessage('<p>');
	debugMessage('<strong>' + object + '</strong>');
	for (var property in object)
		debugMessage('<strong>[' + property + '</strong>] = ' + object[property]);
	debugMessage('</p>');
};
function debug(target) {
	if (typeof target == 'object')
		debugObject(target);
	else
		debugMessage(target);
	debugMessage(target);
};
//	Функции из PrototypeJs (чтобы не тащить 170 кБ), самописные и откуда-то взятые
function byId(id) {
	return document.getElementById(id);
};
function extend(destination, source) {
	for (var property in source) {
		destination[property] = source[property];
	};
	return destination;
};
function getPosition(element) {
	var
		x = 0,
		y = 0;
	while (element) {
		x += element.offsetLeft;
		y += element.offsetTop;
		element = element.offsetParent;
	};
	if (navigator.userAgent.indexOf('Mac') != -1 && typeof document.body.leftMargin != 'undefined') {
		x += document.body.leftMargin;
		y += document.body.topMargin;   //  offsetTop
	};
	return new Array(x, y);
};
function getStyle(element, property) {
	if (element.currentStyle) {
		var
			alt_property_name = property.replace(/\-(\w)/g, function(m, c) {    //  background-color -> backgroundColor
				return c.toUpperCase();
			}),
			value = element.currentStyle[property] || element.currentStyle[alt_property_name];
	}
	else if (window.getComputedStyle) {
		property = property.replace(/([A-Z])/g,"-$1").toLowerCase();    //  backgroundColor -> background-color
		var value = document.defaultView.getComputedStyle(element,null).getPropertyValue(property);
	};
	if (property == "opacity" && element.filter)
		value = (parseFloat(element.filter.match(/opacity\=([^)]*)/)[1]) / 100);
	else if (property == "width" && isNaN(value))
		value = element.clientWidth || element.offsetWidth;
	else if (property == "height" && isNaN(value))
		value = element.clientHeight || element.offsetHeight;
	return value;
};
function inside(element, positions) {
	var
		x = positions.x || positions.clientX,
		y = positions.y || positions.clientY,
		xy = getPosition(element),
		left = xy[0],
		top = xy[1],
		width = getStyle(element, 'width'),
		height = getStyle(element, 'height');
	return (x >= left && x <= left + width && y >= top && y <= top + height);
};
function outside(element, positions) {
	return !inside(element, positions);
};
function randomString(length) {
	var
		result = '',
		chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (var i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	};
	return result;
};
function hasClass(el, name) {
   return new RegExp('(\\s|^)' + name + '(\\s|$)').test(el.className);
};
function addClass(el, name) {
	if (!hasClass(el, name)) {
		el.className += (el.className ? ' ' : '') + name;
	};
};
function removeClass(el, name) {
   if (hasClass(el, name)) {
	  el.className = el.className.replace(new RegExp('(\\s|^)' + name + '(\\s|$)'),' ').replace(/^\s+|\s+$/g, '');
   };
};
function varType(variable) {
	if (variable instanceof Date)
		return 'date';
	else if (variable instanceof String)
		return 'string';
	else if (variable instanceof Number)
		return 'number';
	else
		return (typeof variable);
};
function valueValidate(index) {
	switch (varType(index)) {
		case 'number':
			return index;
		case 'string':
			return index.convert().toId();
		case 'date':
			return index.toId();
	};
};
//	Расширение прототиповв
//	Расширение прототипа массивов, так как для IE типовой indexOf работает только для версии 9 и выше
//	Необходимо протестировать на версиях ниже, у меня нет такой возможности
(function(A) {
	if (!Array.prototype.indexOf)
		A.indexOf = A.indexOf || function(object) {
			for (var i = 0, l = this.length; i < l; i++) {
				if (i in this && this[i] === object) {
					return i;
				};
			};
			return -1;
		};
	if (!Array.prototype.forEach)
		A.forEach = A.forEach || function(action, that) {
			for (var i = 0, l = this.length; i < l; i++)
				if (i in this)
					action.call(that, this[i], i, this);
		};
	//  ВНИМАНИЕ!!! Это отдельный метод, а не перегрузка!!!
	A.remove = function() {
		var
			what = undefined,
			args = arguments,
			length = args.length,
			ax = undefined;
		while (length && this.length) {
			what = args[--length];
			while ((ax = this.indexOf(what)) != -1) {
				this.splice(ax, 1);
			};
		};
		return this;
	}
})(Array.prototype);
//	Расширение прототипа даты
(function(A) {
	//  Вычисление номера недели (иначе получается некошерный вид календаря
	//  в случае, если первый день месяца попадает на понедельник (например, октябрь 2012 года))
	A.getWeek = function(object) {
		var
			dt = (object) ? new Date(object) : new Date(),
			newYear = new Date(dt.getFullYear(), 0, 1),
			newYearDay = newYear.getDay();
		return Math.floor(((dt.getTime() - newYear.getTime()) / 1000 / 60 / 60 / 24 + newYearDay) / 7);
	}
	//  Преобразование даты в строку вида ДД.ММ.ГГГГ
	A.toOutput = function(format) {
		var
			value = this,
			result = undefined;
		function getD() {
			var res = value.getDate();
			return (res < 10) ? '0' + res : res;
		};
		function getM() {
			var res = value.getMonth() + 1;
			return (res < 10) ? '0' + res : res;
		};
		function getY() {
			return value.getFullYear();
		};
		result = '';
		for (var i = 0; i < format.length; i++) {
			switch (format[i]) {
				case 'D':
					result += getD();
					break;
				case 'M':
					result += getM();
					break;
				case 'Y':
					result += getY();
					break;
				default:
					result += format[i];
					break;
			};
		};
		return result;
	};
	//  Преобразование даты в уникальное число (используется разница дней между искомой датой и 01.01.1900 00:00:00)
	A.toId = function() {
		var
			firstDate = new Date(1900, 1, 1, 0, 0, 0, 0);
		return parseInt(((this.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));
	};
	//  Отсечение временной части
	A.truncate = function() {
		return new Date(this.getFullYear(), this.getMonth(), this.getDate());
	};
})(Date.prototype);
//  Расширение прототипа числа, для собственных нужд
(function(A) {
	//  Преобразование числа в дату (функция, обратная Date.toId )
	A.fromId = function() {
		var
			firstDate = new Date(1900, 1, 1, 0, 0, 0, 0),
			resultDate = new Date(1900, 1, 1, 0, 0, 0, 0);
		resultDate.setDate(firstDate.getDate() + this.valueOf());
		return resultDate;
	};
})(Number.prototype);
//  Расширение прототипа строки, для собственных нужд
(function(A) {
	A.trim = function() {
		return this.replace(/^\s+|\s+$/g,"");
	};
	A.ltrim = function() {
		return this.replace(/^\s+/,"");
	};
	A.rtrim = function() {
		return this.replace(/\s+$/,"");
	};
	A.convert = function() {
		if (this.length == 10)
			result = new Date(
				this.charAt(6) + this.charAt(7) + this.charAt(8) + this.charAt(9),
				this.charAt(3) + this.charAt(4) - 1,
				this.charAt(0) + this.charAt(1)
			);
		else
			result = this;
		return result;
	}
})(String.prototype);
//  Расширение прототипа функции
(function(A) {
	if (!Function.prototype.bind)
		A.bind = A.bind || function() {
			var funcObj = this;
			var original = funcObj;
			var extraArgs = Array.prototype.slice.call(arguments);
			var thisObj = extraArgs.shift();
			var func = function() {
				var thatObj = thisObj;
				return original.apply(thatObj, extraArgs.concat(
					Array.prototype.slice.call(
						arguments, extraArgs.length
					)
				));
			};
			func.bind = function() {
				var args = Array.prototype.slice.call(arguments);
				return Function.prototype.bind.apply(funcObj, args);
			};
			return func;
		};
})(Function.prototype);
//	Секция констант. Однако IE не понимает именование const - приходится использовать var
//	Отсутствие изменений этих переменных лежит на совести разработчика
var
	//  Языки
	liENG = 0,
	liRUS = 1,
	//  Режимы повторного выделения
	rmReplace = 0,  //  Замена области (удаление из старой области, добавление в новую область)
	rmDenied = 1,   //  Запрет (отказ в создании новой области, если в ней присутствуют элементы старых областей)
	rmRequest = 2,  //  Задать вопрос пользователю (возврат число)
	monthNames = [
		['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
	],
	dayNames = [
		['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
		['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
	];
	firstDaysOfWeek = [
		0,  //  английская неделя начинается с воскресенья (ноль по яваскриптовому)
		1   //  русская неделя начинается с понедельника (единица по яваскриптовому)
	];
function Cell(config) {
	this.uniqueId = undefined;
	this.id = undefined;
	this.locked = false;
	this.granted = false;
	this.current = false;
	this.inScope = false;
	this.past = false;
	this.mode = undefined;
	this.element = undefined;
	this.value = undefined;
	this.config = {};
	this.defaults = {
		calendarInstance: undefined,
		cellDate: undefined,
		scopeDate: undefined,
		onRender: function(container, cellDate, scopeDate) {},
		onCellClick: function(cell, mouseEvent) {},
		onCellMouseMove: function(cell, mouseEvent) {}
	};
	this.initialize = function(config) {
		// this.config = extend(this.config, this.defaults);
		this.config = extend(this.defaults, config);
		if (config)
			this.config = extend(this.config, config);
		if (!this.config.cellDate || !(this.config.cellDate instanceof Date))
			throw ('cellDate "' + this.config.cellDate + '" неверного формата');
		if (!this.config.scopeDate || !(this.config.scopeDate instanceof Date))
			throw ('scopeDate "' + this.config.scopeDate + '" неверного формата');
	};
	this.setData = function(key, value) {
		this.config.calendarInstance.setData(key, value);
		return this;
	};
	this.getData = function(key) {
		return this.config.calendarInstance.getData(key);
	};
	this.getDate = function() {
		return this.config.cellDate;
	};
	this.getScopeDate = function() {
		return this.config.scopeDate;
	};
	this.getAttributes = function() {
		var
			dayIndex = (this.getDate().getDay() - this.config.calendarInstance.getFirstDayOfWeek() < 0) ? 6 :
				this.getDate().getDay() - this.config.calendarInstance.getFirstDayOfWeek(),
			currentDate = this.config.calendarInstance.getCurrentDate();
		this.value = this.getDate();
		this.inScope = this.config.cellDate.getMonth() == this.config.scopeDate.getMonth();
		this.locked = (this.config.calendarInstance.getArrayDisabledWeekDays()[dayIndex] == '1') || (this.config.calendarInstance.getArrayDisabledDays().indexOf(this.value.getTime()) != -1);
		this.granted = (this.config.calendarInstance.getArrayGrantedWeekDays()[dayIndex] == '1');
		this.current = (currentDate.getTime() == this.value.getTime());
		this.past = (currentDate.getTime() > this.value.getTime());
		this.id = (this.inScope) ? this.value.toId() : 0;
		this.uniqueId = this.config.calendarInstance.cellUnique + this.id;
	}
	this.getClassName = function() {
		var
			className = '';
		this.inEnabledRange = true;
		if (this.config.calendarInstance.startEnabledRange || this.config.calendarInstance.stopEnabledRange) {
			var temp = this.value.toId();
			if ((temp < this.config.calendarInstance.startEnabledRange) || (temp > this.config.calendarInstance.stopEnabledRange))
				this.inEnabledRange = false;
		};
		if (!this.inEnabledRange)
			this.locked = true;
		if (this.inScope)
			className += 'scope ';
		if (this.locked)
			className += 'locked ';
		if (this.granted)
			className += 'granted ';
		if (this.current)
			className += 'current ';
		if (this.past)
			className += 'past ';
		if (this.mode == 'include' || this.mode == 'exclude')
			className += this.mode;
		return className.trim();
	};
	this.render = function() {
		var
			className = this.getClassName();
		if (this.element == undefined) {
			var
				container = document.createElement('td');
			this.element = container;
			this.value = this.getDate();
			container.innerHTML = this.getDate().getDate();
			if (this.uniqueId)
				container.setAttribute('id', this.uniqueId);
			if (className)
				container.setAttribute('class', className);
			if (this.config.onCellClick instanceof Function)
				container.onclick = this.config.onCellClick.bind(this, this);
			if (this.config.onCellMouseMove instanceof Function)
				container.onmousemove = this.config.onCellMouseMove.bind(this, this);
			if (this.config.onRender instanceof Function)
				this.config.onRender.apply(this, [container, this.getDate(), this.getScopeDate()]);
			return container;
		} else {
			var
				container = this.element;
			if (className)
				container.setAttribute('class', className);
			if (this.config.onRender instanceof Function)
				this.config.onRender.apply(this, [container, this.getDate(), this.getScopeDate()]);
			return container;
		};
	}
	this.initialize(config);
	this.getAttributes();
	return this;
};
function Calendar(config) {
	this.config = {};
	this.data = {};
	this.cellUnique = '';
	this.cellsArray = [];
	this.minCell = undefined;
	this.maxCell = undefined;
	this.operation = undefined;
	this.mode = undefined;
	this.startCell = undefined;
	this.stopCell = undefined;
	this.includesArray = [];
	this.excludesArray = [];
	this.startEnabledRange = 'a';
	this.stopEnabledRange = 'b';
	this.defaults = {
		container: undefined,
		currentDate: '',
		startDate: '',
		data: undefined,
		inheritedClick: undefined,
		count: 1,
		alpha: 1,
		languageIndex: liENG,
		onRender: function(table, date) {},
		onCellRender: function(cellContainer, cellDate, scopeDate) {},
		onCellClick: function(cell, mouseEvent) {},
		onCellMouseMove: function(cell, mouseEvent) {},
		showPrior: true,
		showNext: true,
		cellUnique: undefined,
		mode: 'include',
		editable: true,
		nopast: false,
		reselectMode: rmRequest,
		taplendar: false,
		onRangeExistsRequest: function() {},
		onRangeSelect: function(mode, startId, stopId, isOverwrite) {},
		onInitialize: function() {}
	};
	this.convertStringDates = function() {
		if (this.config.arrayDisabledDays)
			this.config.arrayDisabledDays.forEach(function(value, index, selfArray) {
				if (typeof value == 'string')
					selfArray[index] = value.convert().getTime();
			});
		if (this.config.startDate && typeof this.config.startDate == 'string')
			this.config.startDate = this.config.startDate.convert();
		if (this.config.currentDate && typeof this.config.currentDate == 'string')
			this.config.currentDate = this.config.currentDate.convert();
	};
	this.initialize = function(config) {
		/*
		this.config = extend(this.config, this.defaults);
		if (config) {
			if (config['data']) {
				this.data = extend(this.data, config['data']);
				delete config['data'];
			}
			this.config = extend(this.config, config);
		}
		*/
		this.config = extend(this.defaults, config);
		if (this.config.container instanceof $)
			this.config.container = this.config.container[0];
		this.convertStringDates();
		if (this.config.startDate && this.config.startDate instanceof Date)
			this.config.startDate.setDate(1);
		else
			throw ('startDate "' + this.config.startDate + '" неверного формата');
		this.cellUnique = (this.config.cellUnique == undefined) ? randomString(5) : this.config.cellUnique;
		return this;
	};
	this.render = function() {
		var container = this.config.container;
		while (container.hasChildNodes())
			container.removeChild(container.firstChild);
		var
			date = new Date(this.getStartDate().getTime()),
			table = document.createElement('table'),
			tr = document.createElement('tr');
		this.minCell = undefined;
		this.maxCell = undefined;
		for (var i = 0; i < this.config.count; i++) {
			var td = document.createElement('td');
			td.appendChild(this.renderCalendar(date, this.config.showPrior && i == 0, this.config.showNext && (this.config.count == i + 1)));
			tr.appendChild(td);
			date.setMonth(date.getMonth() + 1);
		}
		table.appendChild(tr);
		table.setAttribute('class', 'jsc-calendar-wrapper');
		container.appendChild(table);
	};
	this.prior = function() {
		this.date.setMonth(this.date.getMonth() - this.config.alpha);
		this.render();
		return false;
	};
	this.next = function() {
		this.date.setMonth(this.date.getMonth() + this.config.alpha);
		this.render();
		return false;
	};
	this.getMonthNames = function(index) {
		return monthNames[this.config['languageIndex']][index];
	};
	this.getDayNames = function(index) {
		return dayNames[this.config['languageIndex']][index];
	};
	this.setData = function(key, value) {
		this.data[key] = value;
		return this;
	};
	this.getData = function(key) {
		return this.data[key];
	};
	this.getStartDate = function() {
		if (!this.date) {
			this.date = this.config.startDate || new Date()
		};
		return this.date;
	};
	this.setDate = function(date) {
		if (typeof date == 'string')
			this.date = date.convert();
		else
			this.date = date;
	};
	this.setStartDate = function(startDate) {
		if (typeof startDate == 'string')
			this.config.startDate = startDate.convert();
		else
			this.config.startDate = startDate;
	};
	this.getLanguageIndex = function() {
		return this.config['languageIndex'];
	};
	this.getFirstDayOfWeek = function() {
		return firstDaysOfWeek[this.getLanguageIndex()];
	};
	this.getCurrentDate = function() {
		return (this.config.currentDate == undefined) ? new Date().truncate() : this.config.currentDate;
	};
	this.setCurrentDate = function(currentDate) {
		if (typeof currentDate == 'string')
			this.config.currentDate = currentDate.convert();
		else
			this.config.currentDate = currentDate;
	};
	this.getArrayDisabledDays = function() {
		return (this.config.arrayDisabledDays == undefined) ? [] : this.config.arrayDisabledDays;
	};
	this.getArrayDisabledWeekDays = function() {
		return (this.config.arrayDisabledWeekDays == undefined) ? [] : this.config.arrayDisabledWeekDays;
	};
	this.getArrayGrantedWeekDays = function() {
		return (this.config.arrayGrantedWeekDays == undefined) ? [] : this.config.arrayGrantedWeekDays;
	};
	this.getNewCell = function(cellDate, scopeDate) {
		return new Cell({
			calendarInstance: this,
			cellDate: new Date(cellDate.getTime()),
			scopeDate: new Date(scopeDate.getTime()),
			onRender: this.config.onCellRender,
			onCellClick: this.config.onCellClick,
			onCellMouseMove: this.config.onCellMouseMove
		});
	};
	this.inScope = function(date, scopeDate) {
		return date.getMonth() == scopeDate.getMonth();
	};
	this.getMonthMatrix = function(startDate) {
		var
			date = new Date(startDate.getTime());
		//  Установка первого дня месяца
		date.setDate(1);
		//  Установка первого дня недели
		date.setDate(date.getDate() - date.getDay() + this.getFirstDayOfWeek());
		//  Если вдруг день не начало месяца - необходимо сбросить неделю назад
		if (date.getDate() > 1 && date.getMonth() == startDate.getMonth())
			date.setDate(date.getDate() - 7);
		//  Построение матрицы
		var
			month = {},
			cell = undefined;
		for (var week = 0; week < 6; week++) {
			if (!month[week])
				month[week] = {};
			while (true) {
				if (this.inScope(date, startDate)) {
					cell = this.cellsArray[date.toId()];
					if (cell == undefined) {
						cell = this.getNewCell(date, startDate);
						this.cellsArray[cell.id] = cell;
					} else
						cell.getAttributes();
					if (this.minCell == undefined)
						this.minCell = cell;
					this.maxCell = cell;
				} else
					cell = this.getNewCell(date, startDate);
				month[week][date.getDay() - this.getFirstDayOfWeek()] = cell;
				//  Переход к следующему дню
				date.setDate(date.getDate() + 1);
				if (date.getDay() == this.getFirstDayOfWeek()) {
					//  Переход к следующей неделе
					break;
				};
			};
		};
		return month;
	};
	this.renderHead = function(date, showPrior, showNext) {
		showPrior = typeof showPrior == 'undefined' ? true : showPrior;
		showNext = typeof showNext == 'undefined' ? true : showNext;
		var
			thead = document.createElement('thead'),
			trFirst = document.createElement('tr'),
			trSecond = document.createElement('tr'),
			tdPrior = document.createElement('td'),
			thMonth = document.createElement('th'),
			tdNext = document.createElement('td');
		if (showPrior) {
			var btnPrior = document.createElement('span');
			btnPrior.innerHTML = 'Prior';
			btnPrior.onmousedown = this.prior.bind(this);
			tdPrior.setAttribute('class', 'calendar-btn btn-prior');
			tdPrior.appendChild(btnPrior);
			tdPrior.setAttribute('id', this.cellUnique + 'Prior');
		};
		if (showNext) {
			var btnNext = document.createElement('span');
			btnNext.innerHTML = 'Next';
			btnNext.onmousedown = this.next.bind(this);
			tdNext.setAttribute('class', 'calendar-btn btn-next');
			tdNext.appendChild(btnNext);
			tdNext.setAttribute('id', this.cellUnique + 'Next');
		};
		thMonth.setAttribute('class', 'month-name');
		thMonth.setAttribute('colspan', 7 - ((showNext) ? 1 : 0) - ((showPrior) ? 1 : 0));
		var
			comboMonth = document.createElement('span'),
			comboYear = document.createElement('span'),
			optionItem = undefined;
		thMonth.innerHTML = this.getMonthNames(date.getMonth()) + ' ' + date.getFullYear();
		if (showPrior)
			trFirst.appendChild(tdPrior);
		trFirst.appendChild(thMonth);
		if (showNext)
			trFirst.appendChild(tdNext);
		for (var i = 0; i < 7; i++) {
			var th = document.createElement('th');
			th.innerHTML = this.getDayNames(i);
			trSecond.appendChild(th);
		};
		thead.appendChild(trFirst);
		thead.appendChild(trSecond);
		return thead;
	};
	this.renderCalendar = function(date, showPrior, showNext) {
		var
			month = this.getMonthMatrix(date),
			div = document.createElement('div'),
			table = document.createElement('table'),
			thead = this.renderHead(date, showPrior, showNext),
			tfoot = document.createElement('tfoot'),
			tbody = document.createElement('tbody');
		div.setAttribute('class', 'jsc-month');
		table.setAttribute('class', 'jsc-calendar');
		for (var week in month) {
			var tr = document.createElement('tr');
			for (var day in month[week]) {
				tr.appendChild(
					month[week][day].render()
				);
			};
			tbody.appendChild(tr);
		};
		table.appendChild(thead);
		table.appendChild(tfoot);
		table.appendChild(tbody);
		if (this.config.onRender instanceof Function) {
			this.config.onRender.apply(this, [table, date]);
		};
		div.appendChild(table);
		return div;
	};
	this.visible = function() {
		return (this.config.container.style.display == 'none') ? false : true;
	};
	this.show = function () {
		if (this.isDatepicker())
			this.setEvents();
		this.config.container.style.display = 'block';
	};
	this.close = function() {
		this.config.container.style.display = 'none';
		if (this.config.inheritedClick)
			document.onclick = this.config.inheritedClick;
	};
	this.toggleVisibility = function() {
		(this.visible()) ? this.close() : this.show();
	};
	this.isDatepicker = function() {
		return (this.config.control) ? true : false;
	};
	this.controlGetPosition = function() {
		return getPosition(this.config.control);
	};
	this.controlGetStyle = function(property) {
		return getStyle(this.config.control, property);
	};
	this.setEvents = function() {
		this.config.inheritedClick = document.onclick;
		var self = this;
		document.onclick = function(clickEvent) {
			clickEvent = clickEvent || window.event;
			if (self.visible() && outside(self.config.container, clickEvent) && outside(self.config.control, clickEvent))
				self.close();
		};
	};
	this.attachControl = function() {
		var
			control = this.config.control,
			container = this.config.container,
			xy = this.controlGetPosition(),
			controlWidth = parseInt(this.controlGetStyle('width')),
			controlHeight = parseInt(this.controlGetStyle('height')),
			self = this;
		container.style.left = xy[0] + 'px';
		container.style.top = xy[1] + 5 + controlHeight + 'px';
		this.close();
		control.onclick = function() {
			var
				controlValue = (control.value) ? control.value : new Date();
			self.setDate(control.value);
			self.setStartDate(control.value);
			self.setCurrentDate(control.value);
			self.render();
			self.toggleVisibility();
		};
	};
	this.loadRange = function(mode, range) {
		function indexValidate(index) {
			switch (varType(index)) {
				case 'number':
					return index;
				case 'string':
					return index.convert().toId();
				case 'date':
					return index.toId();
			};
		};
		var
			startIndex = undefined,
			stopIndex = undefined;
		if (range.length != 2) {
			console.error('Неверный размер массива (' + range.length + ')');
			return;
		};
		startIndex = indexValidate(range[0]);
		stopIndex = indexValidate(range[1]);
		if (stopIndex < startIndex) {
			var tempIndex = startIndex;
			startIndex = stopIndex;
			stopIndex = tempIndex;
		};
		for (var i = startIndex; i <= stopIndex; i++) {
			var cell = this.cellsArray[i];
			if (cell == undefined) {
				cell = this.getNewCell(i.fromId(), i.fromId());
				this.cellsArray[i] = cell;
			};
			this.setCellMode(cell, mode);
		};
	};
	this.loadRanges = function(mode, ranges) {
		var instance = this;
		ranges.forEach(function(range) {
			instance.loadRange(mode, range);
		});
	};
	this.load = function() {
		if (config.arrayIncludeDays instanceof Array)
			this.loadRanges('include', config.arrayIncludeDays);
		if (config.arrayExcludeDays instanceof Array)
			this.loadRanges('exclude', config.arrayExcludeDays);
	};
	//  Выделение в реальном режиме (класс "temp")
	this.tempSelect = function(cell) {
		var
			startIndex = (cell.id > this.startCell.id) ? this.startCell.id : cell.id,
			stopIndex = (cell.id > this.startCell.id) ? cell.id : this.startCell.id,
			element = undefined;
		this.tempClear();
		//  Выделение "temp"
		for (var i = startIndex; i <= stopIndex; i++) {
			element = byId(this.cellUnique + i);
			if (element != undefined)
				addClass(element, (hasClass(element, this.mode)) ? 'reselect' : 'temp');
		};
	};
	//  Очистка временного выделения
	this.tempClear = function() {
		for (var i = this.minCell.id; i <= this.maxCell.id; i++) {
			removeClass(byId(this.cellUnique + i), 'reselect');
			removeClass(byId(this.cellUnique + i), 'temp');
		};
	};
	this.rangeValidate = function() {
		if (this.startCell.id > this.stopCell.id) {
			var tempCell = this.startCell;
			this.startCell = this.stopCell;
			this.stopCell = tempCell;
		};
	};
	this.setCellMode = function(cell, mode) {
		switch (mode) {
			case 'clear':
				if (cell.mode) {
					cell.mode = undefined;
					cell.render();
					return true;
				} else
					return false;
				break;
			case 'include':
				cell.mode = 'include';
				cell.render();
				return true;
			case 'exclude':
				if (cell.mode == 'exclude') {   //  Необходимо вернуть true для замены областей исключения, не перерисовывая ячейку
					cell.mode = 'include';
					cell.render();
					return true;
				} else if (cell.mode == 'include') {
					cell.mode = 'exclude';
					cell.render();
					return true;
				} else if (cell.granted) {
					cell.mode = 'exclude';
					cell.render();
					return true;
				}
					return false;
			default:
				return false;
		};
	};
	this.setRange = function() {
		var
			currentRange = undefined,
			tempReselectMode = this.config.reselectMode,
			noselect = false,
			isOverwrite = false;
		//  Проверка на присутствие диапазона
		switch (this.mode) {
			case 'include':
			case 'exclude':
				for (var i = this.startCell.id; i <= this.stopCell.id; i++) {
					if (this.cellsArray[i].mode == this.mode) {
						if (tempReselectMode == rmRequest) {
							switch (this.mode) {
								case 'include':
									if (this.config.onRangeExistsRequest instanceof Function)
										tempReselectMode = this.config.onRangeExistsRequest.apply(this);
									break;
								default:
									tempReselectMode = rmReplace;
							};
						};
						noselect = (tempReselectMode == rmDenied);
						isOverwrite = !noselect;
					};
				};
				break;
		};
		this.tempClear();
		if (noselect)
			return;
		currentRange = this.appendRange(this.mode);
		for (var i = this.startCell.id; i <= this.stopCell.id; i++) {
			if (this.setCellMode(this.cellsArray[i], this.mode))
				this.pushItem(this.mode, currentRange, this.cellsArray[i]);
		};
		this.validate();
		if (this.config.onRangeSelect instanceof Function)
			this.config.onRangeSelect.apply(this, [this.mode, this.startCell.id, this.stopCell.id, isOverwrite]);
	};
	this.setMode = function(mode) {
		this.mode = mode;
		return this.mode;
	};
	this.getMode = function() {
		return this.mode;
	};
	this.appendRange = function(mode) {
		switch (mode) {
			case 'include':
				this.includesArray[this.includesArray.length] = [];
				return this.includesArray.length - 1;
				break;
			case 'exclude':
				this.excludesArray[this.excludesArray.length] = [];
				return this.excludesArray.length - 1;
				break;
			default:
				return false;
		};
	};
	this.clearRange = function(mode) {
		switch (mode) {
			case 'include':
				this.includesArray = [];
				break;
			case 'exclude':
				this.excludesArray = [];
				break;
			default:
				return;
		};
	};
	this.clear = function(refresh) {
		refresh = (refresh == undefined) ? false : refresh;
		this.clearRange('include');
		this.clearRange('exclude');
		this.cellsArray = [];
		if (refresh)
			this.render();
	};
	this.pushItem = function(mode, index, item) {
		var
			instance = this;
		if (item instanceof Array) {
			item.forEach(function(item) {
				instance.pushItem(mode, index, item);
			});
		} else
			switch (mode) {
				case 'clear':
					this.removeItem(item);
					break;
				case 'include':
					this.removeItem(item);
					this.includesArray[index][this.includesArray[index].length] = item;
					break;
				case 'exclude':
					this.removeItem(item);
					this.excludesArray[index][this.excludesArray[index].length] = item;
					break;
				default:
					return false;
			};
	};
	this.removeItem = function(item) {
		this.includesArray.forEach(function(array) {
			array.remove(item);
		});
		this.excludesArray.forEach(function(array) {
			array.remove(item);
		});
	};
	this.truncate = function() {
		var
			includes = this.includesArray,
			excludes = this.excludesArray;
		includes.forEach(function(array) {
			if (array.length == 0)
				includes.remove(array);
		});
		excludes.forEach(function(array) {
			if (array.length == 0)
				excludes.remove(array);
		});
	};
	this.validate = function() {
		var
			includes = [],
			excludes = [],
			tempIncludes = [],
			tempExcludes = [],
			mode = undefined;
		this.cellsArray.forEach(function(item, index, array) {
			switch (item.mode) {
				case undefined:
					if (tempIncludes.length > 0)
						includes[includes.length] = tempIncludes;
					if (tempExcludes.length > 0)
						excludes[excludes.length] = tempExcludes;
					tempIncludes = [];
					tempExcludes = [];
					break;
				case 'include':
					if (tempExcludes.length > 0)
						excludes[excludes.length] = tempExcludes;
					tempExcludes = [];
					tempIncludes[tempIncludes.length] = item;
					break;
				case 'exclude':
					tempExcludes[tempExcludes.length] = item;
					break;
			};
		});
		if (tempIncludes.length > 0)
			includes[includes.length] = tempIncludes;
		if (tempExcludes.length > 0)
			excludes[excludes.length] = tempExcludes;
		this.includesArray = includes;
		this.excludesArray = excludes;
	};
	this.includes = function(format) {
		var
			result = [],
			temp = [],
			startValue = undefined,
			stopValue = undefined;
		this.validate();
		this.includesArray.forEach(function(array, index) {
			startValue = array[0].id;
			stopValue = array[array.length - 1].id;
			if (format) {
				startValue = startValue.fromId().toOutput(format);
				stopValue = stopValue.fromId().toOutput(format);
			}
			temp = [startValue, stopValue];
			result[index] = temp;
		});
		return result;
	};
	this.excludes = function(format) {
		var
			result = [],
			temp = [],
			startValue = undefined,
			stopValue = undefined;
		this.validate();
		this.excludesArray.forEach(function(array, index) {
			startValue = array[0].id;
			stopValue = array[array.length - 1].id;
			if (format) {
				startValue = startValue.fromId().toOutput(format);
				stopValue = stopValue.fromId().toOutput(format);
			}
			temp = [startValue, stopValue];
			result[index] = temp;
		});
		return result;
	};
	this.setGrantedWeekDays = function(value) {
		this.config.arrayGrantedWeekDays = value;
	};
	this.setEnabledRange = function(startValue, stopValue, needRefresh) {
		this.startEnabledRange = valueValidate(startValue);
		this.stopEnabledRange = valueValidate(stopValue);
		if (false !== needRefresh)
			this.render();
	};
	this.clearEnabledRange = function(needRefresh) {
		this.startEnabledRange = false;
		this.stopEnabledRange = false;
		if (false !== needRefresh)
			this.render();
	};
	this.initialize(config);
	if (config.taplendar)
		this.load(config);
	this.render();
	if (config.taplendar)
		this.validate();
	if (this.isDatepicker())
		this.attachControl();
	else
		this.show();
	return this;
};
function Datepicker(config) {
	config.currentDate = (config.control.value) ? config.control.value : new Date(),
	config.startDate = (config.control.value) ? config.control.value : new Date();
	userCellClick = config.onCellClick;
	config.onCellClick = function(cell, mouseEvent) {
		var
			control = config.control,
			container = config.container,
			calendar = cell.config.calendarInstance;
		if (userCellClick != undefined)
			userCellClick(cell, mouseEvent);
		switch (calendar.config.languageIndex) {
			case liENG:
				control.value = cell.getDate().toOutput('Y-M-D');
				break;
			case liRUS:
				control.value = cell.getDate().toOutput('D.M.Y');
				break;
			default:
				control.value = cell.getDate().toOutput('Y-M-D');
				break;
		}
		calendar.close();
	};
	return new Calendar(config);
};
function Taplendar(config) {
	var inheritedOnCellClick = config.onCellClick;
	config.onCellClick = function(cell, mouseEvent) {
		var
			granted = false;
		if (this.config.calendarInstance.startEnabledRange || this.config.calendarInstance.stopEnabledRange)
			if (!cell.inEnabledRange)
				return;
		switch (cell.config.calendarInstance.mode) {
			case 'clear':
				granted = (cell.inScope && cell.mode != undefined && cell.config.calendarInstance.config.editable && !(this.config.calendarInstance.config.nopast && cell.past));
				break;
			case 'include':
				granted = (cell.inScope && cell.config.calendarInstance.config.editable && !(this.config.calendarInstance.config.nopast && cell.past));
				break;
			case 'exclude':
				granted = (cell.inScope && (cell.mode == 'include' || cell.mode == 'exclude' || cell.granted) && cell.config.calendarInstance.config.editable && !(this.config.calendarInstance.config.nopast && cell.past));
				break;
			default:
				granted = false;
		};
		if (!granted)
			return;
		this.config.calendarInstance.operation = (this.config.calendarInstance.operation == 'select') ? 'set' : 'select';
		if (inheritedOnCellClick instanceof Function)
			inheritedOnCellClick.apply(this, [cell, mouseEvent, this.config.calendarInstance.operation]);
		switch (this.config.calendarInstance.operation) {
			case 'select':
				this.config.calendarInstance.startCell = cell;
				break;
			case 'set':
				this.config.calendarInstance.stopCell = cell;
				this.config.calendarInstance.rangeValidate();
				this.config.calendarInstance.setRange();
				break;
			default:
				return;
		};
	};
	config.onCellMouseMove = function(cell, mouseEvent) {
		var
			granted = false;
		granted = (this.config.calendarInstance.operation == 'select' && cell.inScope && !(this.config.calendarInstance.config.nopast && cell.past));
		if (!granted)
			return;
		this.config.calendarInstance.tempSelect(cell);
	};
	config.taplendar = true;
	object = new Calendar(config);
	object.setMode((config.mode == undefined) ? 'include' : config.mode);
	return object;
};