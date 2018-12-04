!function() {
	var holidayCache = {
		init: function(date) {
			var dataTime = this.getDateInfo(date);
			return this.set(data, dataTime.year, dataTime.yearMonth), this
		},
		ensureDateStr: function(str) {
			return str.split(/-0?/).join("-")
		},
		getDateInfo: function(date) {
			var ret;
			if ("string" === typeof date) ret = date.split(/-0?/), date = new Date(ret[0], ret[1] - 1, ret[2]);
			else ret = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
			return {
				year: ret[0],
				month: ret[1],
				date: ret[2],
				yearMonth: ret.slice(0, 2).join("-"),
				dateStr: ret.join("-"),
				dateStrZero: [ret[0], ("0" + ret[1]).slice(-2), ("0" + ret[2]).slice(-2)].join("-"),
				Date: date
			}
		},
		set: function(data, year, yearMonth) {
			var arr = function(obj) {
				return obj || []
			};
			this.setHoliday(arr(data.holidaylist), year), 
			this.setAlmanac(arr(data.almanac), yearMonth), 
			this.setHolidayDateList(arr(data.holiday), yearMonth), 
			this.setMod(arr(data.day), yearMonth)
		},
		_holiday: {},
		getHoliday: function(year) {
			return this._holiday[year]
		},
		setHoliday: function(dataList, year) {
			var ret = {},
				i, l, tem;
			if (!this._holiday[year]) {
				for (i = 0, l = dataList.length; i < l; i++) ret[dataList[i].name] = {};
				this._holiday[year] = ret
			}
		},
		_holidayDateList: {},
		_festival: {},
		setHolidayDateList: function(holidayList, yearMonth) {
			var ret = {},
				year = yearMonth.split("-")[0],
				tem, i, j, k, l, holidayObj, festivalObj;
			if (!this._holidayDateList[yearMonth]) {
				if (!holidayList.length && holidayList.festival) holidayList = [holidayList];
				for (!this._holiday[year] && (this._holiday[year] = {}), !this._festival[year] && (this._festival[year] = {}), i = 0, l = holidayList.length; i < l; i++) {
					if (tem = holidayList[i], holidayObj = this._holiday[year][tem.name] || {}, this.getDateInfo(tem.festival).year == year) $.extend(holidayObj, tem), this._festival[year][tem.festival] = tem.name;
					for (tem = tem.list, j = 0, k = tem.length; j < k; j++) ret[tem[j].date] = tem[j].status, tem[j] = this.getDateInfo(tem[j].date).dateStrZero;
					holidayObj.startday = this.ensureDateStr(tem.sort()[0])
				}
				this._holidayDateList[yearMonth] = ret
			}
		},
		getHolidayDateList: function(yearMonth) {
			return this._holidayDateList[yearMonth]
		},
		getFestival: function(year) {
			return this._festival[year]
		},
		_almanac: {},
		getAlmanac: function(yearMonth) {
			return this._almanac[yearMonth]
		},
		setAlmanac: function(dataList, yearMonth) {
			if (!this._almanac[yearMonth]) {
				var list = this._almanac[yearMonth] = {},
					i, l;
				for (i = 0, l = dataList.length; i < l; i++) list[ensureDateStr(dataList[i].date)] = {
					suit: dataList[i].suit.replace(/\.$/, "").split(".").slice(0, 15),
					avoid: dataList[i].avoid.replace(/\.$/, "").split(".").slice(0, 15)
				}
			}
		},
		_mod: {},
		setMod: function(modList) {
			var mod = this._mod,
				i, l;
			for (i = 0, l = modList.length; i < l; i++) mod[modList[i].date] = modList[i]
		},
		getMod: function() {
			return this._mod
		},
		getData: function(yearMonth, callback) {
			if (this._almanac[yearMonth]) callback.call(this);
			else yearMonth = yearMonth.split("-"), this.ajax(yearMonth[0] + "年" + yearMonth[1] + "月", callback, function() {
				return yearMonth.join("-")
			})
		},
		getHolidayData: function(year, name, callback) {
			var holiday = this.getHoliday(year);
			if (holiday && holiday[name].festival) callback.call(this);
			else this.ajax(year + "年" + name, callback, function(data) {
				var holiday = data.holiday,
					i, l;
				if (holiday && !holiday.length) holiday = [holiday];
				for (i = 0, l = holiday.length; i < l; i++)
					if (holiday[i].name == name) return this.getDateInfo(holiday[i].festival).yearMonth
			})
		},
		ajax: function(query, callback, fn) {
			var self = this;
			_this.ajax(query, srcid, {
				success: function(data) {
					var yearMonth;
					if (data = data[0] || {}, yearMonth = fn(data), yearMonth) self.set(data, yearMonth.split("-")[0], yearMonth), callback.call(self)
				}
			})
		}
	};

    window.HolidayChina = function(date) {
		var ho=holidayCache.init(date);
		console.log(ho);
		return ho;
	}
}();