window.bus = new Vue();

Vue.component('clock', {
	template: '#clock-template',
	delimiters: ['${', '}'],
	props: {
		tickrate: Number,
		autoupdate: Boolean
	},
	data: function() {
		return {
			time: {
				hours: 0,
				minutes: 0,
				seconds: 0,
				ampm: ''
			},
			date: {
				day: 0,
				month: 0,
				year: 0,
			},
			ticker: 0,
			currentdate: null
		};
	},
	created: function() {
		this.init();
	},
	beforeDestroy: function() {
		clearInterval(this.ticker);
	},
	methods: {
		init: function() {
			this.update();
			if (this.autoupdate) this._autoupdate();
		},
		update: function() {
			this.currentdate = new Date();
			this.setClock(this.currentdate);
		},
		setClock: function(date) {
			this.time = {
				hours:   this._getHours,
				minutes: date.getMinutes(),
				seconds: date.getSeconds(),
				ampm:    this._getAmPm
			};

			this.date = {
				day:   date.getDate(),
				month: this._getMonth,
				year:  date.getFullYear()
			};
		},
		_autoupdate: function() {
			this.tickrate = this.tickrate || 1000;
			this.ticker = setInterval(() => { this.update() }, this.tickrate);
		}
	},
	computed: {
		timeString: function() {
			return this.currentdate.toTimeString();
		},
		dateString: function() {
			return this.currentdate.toDateString();
		},
		monthString: function() {
			return this.currentdate.toLocaleString("en-us", { month: "long" });
		},
		weekString: function() {
			return this.currentdate.toLocaleString("en-us", { weekday: "long" });
		},
		_getHours: function() {
			return this.currentdate.getHours() % 12 || 12;
		},
		_getMonth: function() {
			return this.currentdate.getMonth() + 1;
		},
		_getAmPm: function() {
			return (this.currentdate.getHours() < 12) ? 'am' : 'pm';
		}
	}
});

Vue.component('weather', {
	template: '#weather-template',
	delimiters: ['${', '}'],
	props: {
		city: String,
		state: String,
		units: String,
		tickrate: Number,
		autoupdate: Boolean
	},
	data: function() {
		return {
			current: {},
			forecast: [],
			ticker: 0
		};
	},
	created: function() {
		this.init();
	},
	methods: {
		init: function() {
			this.update();
			if (this.autoupdate) this._autoupdate();
		},
		update: function() {
			axios
				.get(`https://query.yahooapis.com/v1/public/yql?q=select item.condition, item.forecast from weather.forecast where woeid in (select woeid from geo.places(1) where text="${this.city}, ${this.state}") and u="${this.units}"&format=json`)
				.then(resp => {
					if (resp.data.query === undefined || resp.data.query.count === 0) {
						throw "no weather data found";
					}
					let results = resp.data.query.results.channel;
					this.forecast = results.map(c => c.item.forecast);
					this.current = results[0].item.condition;
				})
				.catch(err => { console.log(`Weather api call error: ${err}`) });
		},
		_autoupdate: function() {
			this.tickrate = this.tickrate || 30000;
			this.ticker = setInterval(() => { this.update() }, this.tickrate);
		}
	},
	computed: {
		_units: function() {
			return (this.units !== "C") ? "F" : "C";
		}
	}
});

Vue.component('crypto', {
	template: '#crypto-template',
	delimiters: ['${', '}'],
	props: ['symbol'],
	data: function() {
		return {
			id: 0,
			price: 0,
			vol: 0,
			change: 0,
			marketcap: 0
		};
	},
	created: function() {
		this.init();
	},
	methods: {
		init: function() {
			this.setTickerId();
		},
		fetchTicker: function(id) {
			axios
				.get(`https://api.coinmarketcap.com/v2/ticker/${id}/`)
				.then(resp => {
					var usd = resp.data.data.quotes.USD;
					if (usd === undefined) { throw "no usd data available" }

					this.price = Number(usd.price.toFixed(2));
					this.vol = Number(usd.volume_24h.toFixed(2));
					this.marketcap = Number(usd.market_cap);
					this.change = Number(usd.percent_change_24h);
				})
				.catch(err => { console.log(`failed to fetch ticker: ${err}`) });
		},
		setTickerId: function() {
			axios
				.get("https://api.coinmarketcap.com/v2/listings/")
				.then(resp => { this.id = resp.data.data.filter(s => s.symbol === this.symbol)[0].id })
				.catch(err => { console.log(`failed to fetch tickers: ${err}`) });
		}
	},
	watch: {
		id: function(id) {
			this.fetchTicker(id);
		}
	}
});

Vue.component('notes', {
	template: '#notes-template',
	delimiters: ['${', '}'],
	props: {
		listid: Number
	},
	data: function() {
		return {
			notes: []
		};
	},
	created: function() {
		this.init();
	},
	methods: {
		init: function() {
			this.fetchNotes(this.listid);
		},
		fetchNotes: function(id) {
			axios
				.get('http://mindescalation.com:6002')
				.then(function(resp) {
					this.notes = resp.data;
				}.bind(this))
				.catch(function(err) {
					console.log('error querying notes: ', err);
				});
		}
	}
});

Vue.component('alert', {
	template: '#alert-template',
	delimiters: ['${', '}'],
	props: ['message'],
	data: function() {
		return {};
	}
});

Vue.component('countdown', {
	template: '#countdown-template',
	delimiters: ['${', '}'],
	data: function() {
		return {
			remaining: {},
			deadline: {},
			hours:   0,
			minutes: 0,
			seconds: 0,
			ticker: 0
		};
	},
	created: function() {
		this.init();
	},
	beforeDestroy: function() {
		clearInterval(this.ticker);
	},
	methods: {
		init: function() {
			// this.deadline = moment().days(4).hours(4).minutes(42).seconds(16);
			// this.ticker = setInterval(function() {
			// 	this.remaining = this.deadline.toNow("MM");
			// }.bind(this), 1000);
		}
	},
	watch: {
		remaining: function(left) {
			
			// this.hours = left.format('H');
		}
	}
});

Vue.component('calendar', {
	template: '#calendar-template',
	delimiters: ['${', '}'],
	data: function() {
		return {
			calendar: {},
			currentdate: {}
		};
	},
	created: function() {
		this.init();
	},
	methods: {
		init: function() {
			this.currentdate = moment();
			this.compileCalendar();
			this.fetchEvents();
		},
		fetchEvents: function() {
			axios
				.get('http://mindescalation.com/')
				.then(resp => {
					resp.data = {
						14: [
							{
								title: 'testing',
								description: 'somethingasd ads adasdas adsad',
								category: 1,
								start: moment(),
								end: moment().days(5)
							},
							{
								title: 'more testing',
								description: 'adasdas ads adsad somethingasd',
								category: 4,
								start: moment(),
								end: moment().days(9)
							}
						],
						22: [
							{
								title: 'random things',
								description: 'some more random things',
								category: 2,
								start: moment(),
								end: moment().days(1)
							}
						],
						2: [
							{
								title: 'to asdk2 wok',
								description: 'some asdk2 wok',
								category: 2,
								start: moment(),
								end: moment()
							}
						]
					};
					this.assignEvents(resp.data);
				})
				.catch(err => { console.log(`error fetching calendar: ${err}`) });
		},
		compileCalendar: function() {
			this.daysInMonth(7).forEach(i => {
				this.calendar[Number(i.format("D"))] = [];
			});
		},
		assignEvents: function(events) {
			Object.keys(events).forEach(day => {
				let tmp = [];
				events[day].forEach(e => tmp.push(e));
				this.calendar[day] = tmp;
			});
		},
		daysInMonth: function(month) {
			var daysinmonth = moment().month(month - 1).daysInMonth();
			var days = [];
			while (daysinmonth) {
				days.push(moment().date(daysinmonth));
				daysinmonth--;
			}
			return days;
		},
		weekdayString: function(day, trim) {
			var weekday = moment().day(day).format('dddd');
			return (trim) ? weekday.substr(0, 3) : weekday;
		}
	}
});

var mirror = new Vue({
	el: '#mirror',
	delimiters: ['${', '}']
});
