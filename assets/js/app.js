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
				ampm:    this._getAmpm
			};

			this.date = {
				day:   date.getDate(),
				month: this._getMonth,
				year:  date.getFullYear()
			};
		},
		_autoupdate: function() {
			this.ticker = setInterval(function() { this.update(); }.bind(this), this.tickrate);
		}
	},
	computed: {
		_getHours: function() {
			return this.currentdate.getHours() % 12 || 12;
		},
		_getMonth: function() {
			return this.currentdate.getMonth() + 1;
		},
		_getAmpm: function() {
			return (this.currentdate.getHours() < 12) ? 'am' : 'pm';
		},
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
				.get(this.buildQuery({ city: this.city, state: this.state, units: this._units }))
				.then(function(resp) {
					if (resp.data.query === undefined || resp.data.query.count === 0) {
						throw "no weather data found";
					}
					var results = resp.data.query.results.channel;
					this.forecast = results.map(function(cast) { return cast.item.forecast; });
					this.current = results[0].item.condition;
				}.bind(this))
				.catch(function(err) {
					console.log("Weather api call error: ", err);
				});
		},
		_autoupdate: function() {
			this.ticker = setInterval(function() { this.update(); }.bind(this), this.tickrate);
		}
	},
	computed: {
		buildQuery: function() {
			return _.template('https://query.yahooapis.com/v1/public/yql?q=select item.condition, item.forecast from weather.forecast where woeid in (select woeid from geo.places(1) where text="<%= city %>, <%= state %>") and u="<%= units %>"&format=json');
		},
		_units: function() {
			return (this.units !== "C") ? "F" : "C";
		}
	}
});

var mirror = new Vue({
	el: '#mirror',
	delimiters: ['${', '}']
});
