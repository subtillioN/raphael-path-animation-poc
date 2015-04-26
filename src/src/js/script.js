// GLOBALS
var R = Raphael;

function init() {

// kludge until I can figure out this opacity issue
	$(".feed").fadeOut(100);

	raphaelSetup();

	R("holder", 936, 486, function () {
		var paper = this,
				initialLoadDelay = 500,
				driverUpdateOffset = 1000,

				bkg_src = document.getElementById("bkg"),
				bkg = paper.image(bkg_src.src, 0, 0, 936, 486),

				driverAnimDefaults = {paper: paper, speed: 1000, easing: "<>", energyDistance: 0.1},
		// path = paper.path("M395.494,191.584  c-75.929,0-142.233,0-169.509,0c-65.504,0-117.757,61.505-117.507,123.01c0.251,61.503,50.003,123.005,117.507,123.005  c69.004,0,420.027,0,491.031,0c69.506,0,122.759-61.502,122.006-123.007c-0.75-61.504-55.5-123.008-122.006-123.008  c-46.551,0-196.726,0-321.182,0H395.494z");
				path = paper.path("M395.494,191.584  c-75.929,0-142.233,0-169.509,0c-65.504,0-117.757,61.505-117.507,123.01c0.251,61.503,50.003,123.005,117.507,123.005  c69.004,0,420.027,0,491.031,0c69.506,0,122.759-61.502,122.006-123.007c-0.75-61.504-55.5-123.008-122.006-123.008  c-46.551,0-196.726,0-321.182,0H395.494z");
		path.attr({stroke: "#b7b7b7", opacity: 1, "stroke-width": 1});

		window.Drivers = new Drivers(paper, driverAnimDefaults, path);

		updateDriverConsole();

		// mock twitter feed
		setTimeout(twitterInit, initialLoadDelay);
		// twitterInit();
	});

	function Drivers(paper, defaults, path) {

		// this.driverData = [
		// 	{name:"Kyle Busch", twitID:"1", id:"1"}
		// ];


		this.driverData = [
			{name: "Canis Major", id: "1"},
			{name: "Acamar", id: "2"},
			{name: "Alcyone", id: "3"},
			{name: "Kaus Borealis", id: "4"},
			{name: "Kornephoros", id: "5"},
			{name: "Hydrobius", id: "6"},
			{name: "Marfik", id: "7"},
			{name: "Pollux", id: "8"},
			{name: "Ras Alhague", id: "9"},
			{name: "Seginus", id: "10"}
		];

		// create drivers
		this.drivers = [];
		this.initialLoad = true;
		var staggerAmt = 0.025;
		var l = this.driverData.length;
		for(var i = 0; i < l; i++) {
			var def = clone(defaults);
			def.from = (l * staggerAmt) - (i * staggerAmt);
			var d = new Driver(this.driverData[i], paper, def);
			paper.animateToPath.attach(d.el, path, def.from);
			d.index = i;
			this.drivers.push(d);
		}
		return this;
	}

	Drivers.prototype = {
		// takes an array of objects with twitID and energyNum per driver.
		update: function (data) {
			console.log('data = ');
			console.log(data);
			i = 0;
			for(var attr in data) {
				i++;
				var d = this.getDriverByID(attr);
				if(d !== undefined) {
					d.updateEnergy(data[attr], i * 100);
				}
			}
			this.getPlace();
		},
		getDriverByID: function (id) {
			for(var i = this.drivers.length - 1; i >= 0; i--) {
				if(this.drivers[i].id === id) return this.drivers[i];
			}
		},
		getPlace: function () {
			var places = {};
			for(var i = this.drivers.length - 1; i >= 0; i--) {
				places[this.drivers[i].id] = this.drivers[i].currentEnergy;
			}
			var sorted = sortObject(places).reverse();
			for(i = 0; i < sorted.length; i++) {
				this.getDriverByID(sorted[i].key).currentPlace = i + 1;
			}
		}
	};

	// DRIVER OBJECT 
	function Driver(params, paper, animParams) {
		this.currentPlace = 0;
		this.currentEnergy = 0;
		this.energyDistance = animParams.energyDistance;
		this.laps = 0;
		this.lapsToGo = 0;
		this.animFrom = animParams.from;
		this.animTo = animParams.to;
		this.animSpeed = animParams.speed;
		this.easing = animParams.easing;
		this.animCallback = animParams.callback;
		this.twitID = params.twitID;
		this.name = params.name;
		this.id = params.id;
		this.onChanged = params.onChanged;
		this.el = this.init({width: 20, id: params.id}, paper, this);
		this.params = params;
	}

	Driver.prototype = {
		init: function (cparams, paper, self) {
			console.log("logging params");
			console.log(self);
			var star_src = document.getElementById("star"),
					star = paper.image(star_src.src, -cparams.width * 0.5, -cparams.width * 0.5, cparams.width, cparams.width);

			console.log('this.currentEnergy = ' + this.currentEnergy);

			//star.mouseover(function () {displayData(self)});
			//star.mouseout(function () {displayData()});
//			star.click(function(){displayData(self)});
			return star;
		},
		updateEnergy: function (num, delay) {
			var newEnergy = num - this.currentEnergy;
			if(newEnergy === 0)return;
			var totalDist = newEnergy * this.energyDistance;
			if(totalDist < this.animTo) {
				totalDist += 1;
			}
			this.lapsToGo = Math.floor(totalDist);
			var posDist = totalDist - this.lapsToGo;
			console.log('totalDist = ' + totalDist);
			console.log('lapsToGo = ' + this.lapsToGo);
			console.log('posDist = ' + posDist);

			if(this.currentEnergy !== 0) {
				this.animFrom = this.animTo;
			}
			this.currentEnergy = num;
			this.animTo = posDist;
			this.laps += this.lapsToGo;

			console.log('this.laps TOTAL = ' + this.laps);

			if(this.lapsToGo) {
				console.log("laps to go?");
				this.animTo = 1;
				this.easing = "linear";
				console.log('________________________________________________________________________________this.easing = ' + this.easing);
				this.callback = function (driver) {
					console.log(driver);
					if(this.lapsToGo === 1) {
						console.log("...loop exiting, updating params");
						console.log('posDist = ' + posDist);
						this.animTo = posDist;
						this.animFrom = 0;
						this.easing = ">";
						console.log(this);
					} else
						if(this.lapsToGo === 0) {
							console.log("no laps left...");
							this.easing = ">";
						}
					return driver;
				};
			} else {
				this.animCallback = null;
				this.easing = "<>";
				console.log("no laps, so back to defaults...");
			}

			setTimeout(this.run, delay, this);
		},
		run: function (thiz) {
			if(thiz.animFrom != thiz.animTo) {
				thiz.el.paper.animateToPath.run(thiz);
			}
		}
//		getInfo: function(){
//			return {
//				place: this.currentPlace
//			}
//		}
	};

	// RAPHAEL SETUP ________________________________________________________________________________
	function raphaelSetup() {

		// add plugins 
		R.fn.animateToPath = {
			attach: function (el, path, at) {
				if(at === undefined)at = 0;
				len = path.getTotalLength();

				el.onAnimation(function () {
					var t = this.attr("transform");
				});

				el.paper.customAttributes.along = function (v) {

					var point = path.getPointAtLength(v * len);
					return {
						transform: "t" + [point.x, point.y] + "r" + point.alpha
					};
				};

				el.attr({along: at});

			},
			run: function (obj) {
				obj.el.attr({along: obj.animFrom});
				obj.el.animate({along: obj.animTo}, obj.animSpeed, obj.easing, function () {
					if(isFunction(obj.callback)) {
						obj = obj.callback(obj);
					}
					if(obj.lapsToGo) {
						obj.lapsToGo--;
						obj.el.attr({along: obj.animFrom});
						setTimeout(obj.el.paper.animateToPath.run(obj), 0);
					}
				});

			}
		};
	}


}

// MORE GLOBALS ...

// UTILITY FUNCTIONS ________________________________________________________________________________
function clone(obj) {
	if(null === obj || "object" != typeof obj) return obj;
	var copy = obj.constructor();
	for(var attr in obj) {
		if(obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
	}
	return copy;
}
function randomFromTo(from, to) {
	return Math.floor(Math.random() * (to - from + 1) + from);
}

function sortObject(obj) {
	var arr = [];
	for(var prop in obj) {
		if(obj.hasOwnProperty(prop)) {
			arr.push({
				         'key': prop,
				         'value': obj[prop]
			         });
		}
	}
	arr.sort(function (a, b) { return a.value - b.value; });
	return arr; // returns array
}

function isFunction(fn) {
	var getType = {};
	return fn && getType.toString.call(fn) === '[object Function]';
}


// MOCK DOM API ________________________________________________________________________________

function updateDriverConsole() {
	var data = window.Drivers.drivers;
	var $stats = $(".driverStat");
	for(var i = 0; i < data.length; i++) {
		$($stats[i]).find(".driverName").html(data[i].currentPlace);
		$($stats[i]).find(".driverData").html("<br/>ENERGY: " + data[i].currentEnergy + "<br/>LAPS: " + data[i].laps);
	}
}


function displayData(driver) {
	console.log(driver);
	if(driver!==undefined) {
		$(".feed").fadeIn(100);
		$(".feed").css('visibility', 'visible');
		$(".feed .score").html(driver.currentPlace);
		$(".feed .energy").html(driver.currentEnergy + " energy");
		$(".feed .lastEnergy").html(driver.params.lastEnergy);
		$(".feed").css('background-color', driver.params.color);
	}
	else{
		$(".feed").css('visibility', 'hidden');
		$(".feed").fadeOut(100);
	}
}


// MOCK TWITTER API ________________________________________________________________________________
function twitterInit() {
	updateDrivers(20, 300);
	updateDriverConsole();
}

function getTwitterFeed() {
//	console.log("getTwitterFeed ... ________________________________________________________________________________");
	updateDrivers(0, 50);
	updateDriverConsole();
}

function updateDrivers(from, to) {
	var obj = {};
	for(var i = 0; i < Drivers.drivers.length; i++) {
		obj[i + 1 + ""] = Drivers.drivers[i].currentEnergy + randomFromTo(from, to);
		console.log(obj);
	}
	Drivers.update(obj);
}

function energy() {
	// getTwitterFeed();
}

function energyUpdate(driver, energynum) {
	console.log("energy");
}

function energyUpdateAll() {
	console.log("energy");
}

