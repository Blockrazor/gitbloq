import { Template } from 'meteor/templating';

import { Githubitems } from '../api/repo.js';
import { Githubcount } from '../api/repo.js';
import { Githubcommits } from '../api/repo.js';
import { AllCoins } from '../api/repo.js';

import './body.html';

var randomColor = require('randomcolor');

Template.body.onCreated(function bodyOnCreated() {
	//this.state = new ReactiveDict();
	Meteor.subscribe('githubcommits');
	Meteor.subscribe('githubitems');
	Meteor.subscribe('githubcount');
	Meteor.subscribe('allcoins');
	Session.set("slug", "bitcoin");
});


Template.body.helpers({
	repos() {
		var repos = Githubitems.find({ coinSlug: Session.get("slug") }).fetch();
		return repos;
	},
	coinName() {
		var coinObj = AllCoins.findOne({ slug: Session.get("slug") });
		// console.log(coinObj);
		if (coinObj != undefined)
			return coinObj.name;
	},
	coinSymbol() {
		var coinObj = AllCoins.findOne({ slug: Session.get("slug") });
		// console.log(coinObj);
		if (coinObj != undefined)
			return coinObj.symbol;
	},
	watcherCount() {
		var repo = Githubcount.findOne({ coinSlug: Session.get("slug") }, { sort: { date_created: -1 } });
		if (repo != undefined)
			return repo.watchers_count;
	},
	forkCount() {
		var repo = Githubcount.findOne({ coinSlug: Session.get("slug") }, { sort: { date_created: -1 } });
		if (repo != undefined)
			return repo.forks_count;
	},
	starCount() {
		var repo = Githubcount.findOne({ coinSlug: Session.get("slug") }, { sort: { date_created: -1 } });
		if (repo != undefined)
			return repo.stargazers_count;
	},
	repoCount() {
		var repo = Githubcount.findOne({ coinSlug: Session.get("slug") }, { sort: { date_created: -1 } });
		if (repo != undefined)
			return repo.repoTotalCount;
	},
	commitCount() {
		var repoArray = Githubitems.find({ coinSlug: Session.get("slug") }).fetch();
		var commitNumber = 0;
		repoArray.forEach((repo) => {
			commitNumber += repo.commit_count;
		})
		return commitNumber;
	}
});


Template.coinlist.helpers({
	Allcoins() {
		return AllCoins.find({}).fetch();
	}
})

Template.coinlist.events({
	"change #coinlist": function (evt) {
		var newValue = $(evt.target).val();
		var oldValue = Session.get("slug");
		if (newValue != oldValue) {
			// value changed, let's do something
		}
		Session.set("slug", newValue);
	}
})


Template.gitcountchart.rendered = function () {
	// var chart = nv.models.lineChart()
	try {
		var chart = nv.models.lineWithFocusChart();
		//   .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
		//   .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
		//   .transitionDuration(350)  //how fast do you want the lines to transition?
		//   .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
		//   .showYAxis(true)        //Show the y-axis
		//   .showXAxis(true)        //Show the x-axis
		// ;

		nv.addGraph(function () {
			chart.xAxis.axisLabel('Date').tickFormat(
				function (d) {
					return d3.time.format('%x')(new Date(d))
				});
			chart.x2Axis.axisLabel('Date').tickFormat(
				function (d) {
					return d3.time.format('%x')(new Date(d))
				});
			chart.yAxis.axisLabel('Repos').tickFormat(d3.format('d'));
			chart.y2Axis.axisLabel('Repos').tickFormat(d3.format('d'));
			var repoData = constructrepodata();
			d3.select('#repochart svg').datum(
				repoData
			).call(chart);
			nv.utils.windowResize(function () { chart.update(); });
			return chart;
		});

		this.autorun(function () {
			var repoData = constructrepodata();
			d3.select('#chart svg').datum(
				repoData
			).call(chart);
			chart.update();
		});

	} catch{

	}
};

function constructrepodata() {
	var data = [];
	for (const gitcountdata of Githubcount.find({ coinSlug: Session.get("slug") }).fetch()) {
		data.push(
			{
				x: gitcountdata.time,
				y: gitcountdata.repoTotalCount
			});
	}
	return [
		{
			values: data,
			key: 'Total repo',
			color: '#7770ff',
			area: true      //area - set to true if you want this line to turn into a filled area chart.
		},
	];
}

Template.gitcountchart.rendered = function () {
	// var chart = nv.models.lineChart()
	try {
		var chart = nv.models.lineWithFocusChart();
		//   .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
		//   .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
		//   .transitionDuration(350)  //how fast do you want the lines to transition?
		//   .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
		//   .showYAxis(true)        //Show the y-axis
		//   .showXAxis(true)        //Show the x-axis
		// ;

		nv.addGraph(function () {
			chart.xAxis.axisLabel('Date').tickFormat(
				function (d) {
					return d3.time.format('%x')(new Date(d))
				});
			chart.x2Axis.axisLabel('Date').tickFormat(
				function (d) {
					return d3.time.format('%x')(new Date(d))
				});
			chart.yAxis.axisLabel('Repos').tickFormat(d3.format('d'));
			chart.y2Axis.axisLabel('Repos').tickFormat(d3.format('d'));
			var repoData = constructrepodata();
			d3.select('#repochart svg').datum(
				repoData
			).call(chart);
			nv.utils.windowResize(function () { chart.update(); });
			return chart;
		});

		this.autorun(function () {
			var repoData = constructrepodata();
			d3.select('#repochart svg').datum(
				repoData
			).call(chart);
			chart.update();
		});
	} catch{ }
};

function constructrepodata() {
	var data = [];
	for (const gitcountdata of Githubcount.find({ coinSlug: Session.get("slug") }).fetch()) {
		data.push(
			{
				x: gitcountdata.time,
				y: gitcountdata.repoTotalCount
			});
	}
	return [
		{
			values: data,
			key: 'Total repo',
			color: '#7770ff',
			area: true      //area - set to true if you want this line to turn into a filled area chart.
		},
	];
}

Template.gitstarchart.rendered = function () {
	// var chart = nv.models.lineChart()
	try {
		var chart = nv.models.lineWithFocusChart();
		//   .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
		//   .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
		//   .transitionDuration(350)  //how fast do you want the lines to transition?
		//   .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
		//   .showYAxis(true)        //Show the y-axis
		//   .showXAxis(true)        //Show the x-axis
		// ;

		nv.addGraph(function () {
			chart.xAxis.axisLabel('Date').tickFormat(
				function (d) {
					return d3.time.format('%x')(new Date(d))
				});
			chart.x2Axis.axisLabel('Date').tickFormat(
				function (d) {
					return d3.time.format('%x')(new Date(d))
				});
			chart.yAxis.axisLabel('Stars').tickFormat(d3.format('d'));
			chart.y2Axis.axisLabel('Stars').tickFormat(d3.format('d'));
			var repoData = constructrepodata();
			d3.select('#starchart svg').datum(
				repoData
			).call(chart);
			nv.utils.windowResize(function () { chart.update(); });
			return chart;
		});

		this.autorun(function () {
			var repoData = constructstardata();
			d3.select('#starchart svg').datum(
				repoData
			).call(chart);
			chart.update();
		});
	} catch{ }
};

function constructstardata() {
	var data = [];
	for (const gitcountdata of Githubcount.find({ coinSlug: Session.get("slug") }).fetch()) {
		data.push(
			{
				x: gitcountdata.time,
				y: gitcountdata.stargazers_count
			});
	}
	return [
		{
			values: data,
			key: 'Total Stars',
			color: '#7770ff',
			area: true      //area - set to true if you want this line to turn into a filled area chart.
		},
	];
}


Template.gitforkchart.rendered = function () {
	// var chart = nv.models.lineChart()
	try {
		var chart = nv.models.lineWithFocusChart();
		//   .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
		//   .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
		//   .transitionDuration(350)  //how fast do you want the lines to transition?
		//   .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
		//   .showYAxis(true)        //Show the y-axis
		//   .showXAxis(true)        //Show the x-axis
		// ;

		nv.addGraph(function () {
			chart.xAxis.axisLabel('Date').tickFormat(
				function (d) {
					return d3.time.format('%x')(new Date(d))
				});
			chart.x2Axis.axisLabel('Date').tickFormat(
				function (d) {
					return d3.time.format('%x')(new Date(d))
				});
			chart.yAxis.axisLabel('Forks').tickFormat(d3.format('d'));
			chart.y2Axis.axisLabel('Forks').tickFormat(d3.format('d'));
			var repoData = constructrepodata();
			d3.select('#forkchart svg').datum(
				repoData
			).call(chart);
			nv.utils.windowResize(function () { chart.update(); });
			return chart;
		});

		this.autorun(function () {
			var repoData = constructforkdata();
			d3.select('#forkchart svg').datum(
				repoData
			).call(chart);
			chart.update();
		});
	} catch{ }
};

function constructforkdata() {
	var data = [];
	for (const gitcountdata of Githubcount.find({ coinSlug: Session.get("slug") }).fetch()) {
		data.push(
			{
				x: gitcountdata.time,
				y: gitcountdata.forks_count
			});
	}
	return [
		{
			values: data,
			key: 'Total forks',
			color: '#7770ff',
			area: true      //area - set to true if you want this line to turn into a filled area chart.
		},
	];
}

Template.gitwatcherchart.rendered = function () {
	try {
		// var chart = nv.models.lineChart()
		var chart = nv.models.lineWithFocusChart();
		//   .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
		//   .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
		//   .transitionDuration(350)  //how fast do you want the lines to transition?
		//   .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
		//   .showYAxis(true)        //Show the y-axis
		//   .showXAxis(true)        //Show the x-axis
		// ;

		nv.addGraph(function () {
			chart.xAxis.axisLabel('Date').tickFormat(
				function (d) {
					return d3.time.format('%x')(new Date(d))
				});
			chart.x2Axis.axisLabel('Date').tickFormat(
				function (d) {
					return d3.time.format('%x')(new Date(d))
				});
			chart.yAxis.axisLabel('Forks').tickFormat(d3.format('d'));
			chart.y2Axis.axisLabel('Forks').tickFormat(d3.format('d'));
			var repoData = constructrepodata();
			d3.select('#watcherchart svg').datum(
				repoData
			).call(chart);
			nv.utils.windowResize(function () { chart.update(); });
			return chart;
		});

		this.autorun(function () {
			var repoData = constructwatcherdata();
			d3.select('#watcherchart svg').datum(
				repoData
			).call(chart);
			chart.update();
		});
	} catch{ }
};

function constructwatcherdata() {
	var data = [];
	for (const gitcountdata of Githubcount.find({ coinSlug: Session.get("slug") }).fetch()) {
		data.push(
			{
				x: gitcountdata.time,
				y: gitcountdata.forks_count
			});
	}
	return [
		{
			values: data,
			key: 'Total watchers',
			color: '#7770ff',
			area: true      //area - set to true if you want this line to turn into a filled area chart.
		},
	];
}





// Template.gitcommitchart.rendered = function () {
// 	try {
// 		// var chart = nv.models.lineChart()
// 		var chart = nv.models.lineWithFocusChart();
// 		//   .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
// 		//   .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
// 		//   .transitionDuration(350)  //how fast do you want the lines to transition?
// 		//   .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
// 		//   .showYAxis(true)        //Show the y-axis
// 		//   .showXAxis(true)        //Show the x-axis
// 		// ;

// 		nv.addGraph(function () {
// 			chart.xAxis.axisLabel('Date').tickFormat(
// 				function (d) {
// 					return d3.time.format('%x')(new Date(d))
// 				});
// 			chart.x2Axis.axisLabel('Date').tickFormat(
// 				function (d) {
// 					return d3.time.format('%x')(new Date(d))
// 				});
// 			chart.yAxis.axisLabel('Commits').tickFormat(d3.format('d'));
// 			chart.y2Axis.axisLabel('Commits').tickFormat(d3.format('d'));
// 			var repoData = constructcommitdata();
// 			d3.select('#chart2 svg').datum(
// 				repoData
// 			).call(chart);
// 			nv.utils.windowResize(function () { chart.update(); });
// 			return chart;
// 		});

// 		this.autorun(function () {
// 			var repoData = constructcommitdata();
// 			d3.select('#chart2 svg').datum(
// 				repoData
// 			).call(chart);
// 			chart.update();
// 		});
// 	} catch{ }
// };

// // function constructcommitdata(){
// // 	var line = [];
// // 	var data = [];
// // 	for (const repo of Githubitems.find().fetch()){
// // 		data = [];
// // 		//console.log(repo.name);
// // 		//console.log(Githubcommits.find().fetch());
// // 		for (const commit of Githubcommits.find({},{sort: {time : 1}}).fetch())
// // 		{
// // 			console.log(d3.time.format('%x')(new Date(commit.time)));
// // 			data.push(
// // 			{
// // 				x: commit.time,
// // 				y: commit.count
// // 			});
// // 		}
// // 		line.push({
// //       	values: data,
// //      	 key: repo.name,
// //      	 color: randomColor(),
// //      	 area: false      //area - set to true if you want this line to turn into a filled area chart.
// //     	});
// // 	}
// // 	return line;
// // }

// function constructcommitdata() {

// 	var data = [];
// 	var allcommits = Githubcommits.find().fetch();
// 	var dates = [];
// 	for (const commit of allcommits) {
// 		dates.push(d3.time.format('%x')(new Date(commit.time)));
// 		commit.date = (d3.time.format('%x')(new Date(commit.time)));
// 		//console.log(commit.time);
// 	}
// 	dates = [...new Set(dates)];
// 	console.log(dates);
// 	for (const date of dates) {
// 		console.log(date);
// 		var Matchedcommits = allcommits.filter(function (element) {
// 			return element.date == date;
// 		});
// 		var tmpcount = 0;
// 		for (const matchedcommit of Matchedcommits) {
// 			tmpcount += matchedcommit.count;
// 		}
// 		data.push(
// 			{
// 				x: Matchedcommits[0].time,
// 				y: tmpcount
// 			});
// 	}

// 	return [
// 		{
// 			values: data,
// 			key: 'Total commit',
// 			color: '#7770ff',
// 			area: true      //area - set to true if you want this line to turn into a filled area chart.
// 		},
// 	];
// }



