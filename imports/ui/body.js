import { Template } from 'meteor/templating';

import { Githubitems, GithubRanking, Githubcount, AllCoins } from '../api/repo.js';

import './body.html';

var randomColor = require('randomcolor');

Template.body.onCreated(function bodyOnCreated() {
	//this.state = new ReactiveDict();
	var date = new Date().toGMTString().slice(0, -12);
	date += "00:00:00 GMT";
	date = Date.parse(date);
	Session.set("slug", "bitcoin");
	Session.set("compare1", "bitcoin");
	Session.set("compare2", "ethereum");
	Session.set("rankingSort", "Total Repos");
	Meteor.subscribe('githubcount', Session.get("slug"));
	Meteor.subscribe('githubcount', Session.get("compare2"));
	Meteor.subscribe('githubcount', Session.get("compare1"));
	Meteor.subscribe('allcoins');
	Meteor.subscribe('githubitemsPerCoin', date, Session.get("slug"));
	Meteor.subscribe('gitRanking', date);
});

Template.dashboard.helpers({
	repos() {
		var date = new Date().toGMTString().slice(0, -12);
		date += "00:00:00 GMT";
		date = Date.parse(date);
		var repos = Githubitems.find({ coinSlug: Session.get("slug") }, { sort: { stargazers_count: -1 } }).fetch();
		return repos;
	},
	coinName() {
		var coinObj = AllCoins.findOne({ slug: Session.get("slug") });
		if (coinObj != undefined)
			return coinObj.name;
	},
	coinSymbol() {
		var coinObj = AllCoins.findOne({ slug: Session.get("slug") });
		// console.log(coinObj);
		if (coinObj != undefined)
			return coinObj.symbol;
	},
	openIssueCount() {
		var repo = Githubcount.findOne({ coinSlug: Session.get("slug") }, { sort: { time: -1 } });
		if (repo != undefined)
			return repo.open_issues_count;
	},
	forkCount() {
		var repo = Githubcount.findOne({ coinSlug: Session.get("slug") }, { sort: { time: -1 } });
		if (repo != undefined)
			return repo.forks_count;
	},
	starCount() {
		var repo = Githubcount.findOne({ coinSlug: Session.get("slug") }, { sort: { time: -1 } });
		if (repo != undefined)
			return repo.stargazers_count;
	},
	repoCount() {
		var repo = Githubcount.findOne({ coinSlug: Session.get("slug") }, { sort: { time: -1 } });
		if (repo != undefined)
			return repo.repoTotalCount;
	},
});


Template.coinlist.helpers({
	Allcoins() {
		// console.log(AllCoins.find({}).fetch());
		return AllCoins.find({}, { sort: { slug: 1 } }).fetch();
	}
})

Template.coinlist.events({
	"change #coinlist": function (evt) {
		var date = new Date().toGMTString().slice(0, -12);
		date += "00:00:00 GMT";
		date = Date.parse(date);
		var newValue = $(evt.target).val();
		Session.set("slug", newValue);
		Meteor.subscribe('githubcount', Session.get("slug"));
		Meteor.subscribe('githubitemsPerCoin', date, Session.get("slug"));
	}
})

Template.coinlistcompare1.helpers({
	Allcoins() {
		// console.log(AllCoins.find({}).fetch());
		return AllCoins.find({}, { sort: { slug: 1 }}).fetch();
	}
})

Template.coinlistcompare1.events({
	"change #coinlist": function (evt) {
		var date = new Date().toGMTString().slice(0, -12);
		date += "00:00:00 GMT";
		date = Date.parse(date);
		var newValue = $(evt.target).val();
		Session.set("compare1", newValue);
		Meteor.subscribe('githubcount', Session.get("compare1"));
		Meteor.subscribe('githubitemsPerCoin', date, Session.get("compare1"));
	}
})

Template.coinlistcompare2.helpers({
	Allcoins() {
		// console.log(AllCoins.find({}).fetch());
		return AllCoins.find({}, { sort: { slug: 1 }}).fetch();
	}
})

Template.coinlistcompare2.events({
	"change #coinlist": function (evt) {
		var date = new Date().toGMTString().slice(0, -12);
		date += "00:00:00 GMT";
		date = Date.parse(date);
		var newValue = $(evt.target).val();
		Session.set("compare2", newValue);
		Meteor.subscribe('githubcount', Session.get("compare2"));
		Meteor.subscribe('githubitemsPerCoin', date, Session.get("compare2"));
	}
})


Template.compare.helpers({
	coin1Name() {
		var coinObj = AllCoins.findOne({ slug: Session.get("compare1") });
		if (coinObj != undefined)
			return coinObj.name;
	},
	coin1Symbol() {
		var coinObj = AllCoins.findOne({ slug: Session.get("compare1") });
		// console.log(coinObj);
		if (coinObj != undefined)
			return coinObj.symbol;
	},
	openIssue1Count() {
		var repo = Githubcount.findOne({ coinSlug: Session.get("compare1") }, { sort: { time: -1 } });
		if (repo != undefined)
			return repo.open_issues_count;
	},
	fork1Count() {
		var repo = Githubcount.findOne({ coinSlug: Session.get("compare1") }, { sort: { time: -1 } });
		if (repo != undefined)
			return repo.forks_count;
	},
	star1Count() {
		var repo = Githubcount.findOne({ coinSlug: Session.get("compare1") }, { sort: { time: -1 } });
		if (repo != undefined)
			return repo.stargazers_count;
	},
	repo1Count() {
		var repo = Githubcount.findOne({ coinSlug: Session.get("compare1") }, { sort: { time: -1 } });
		if (repo != undefined)
			return repo.repoTotalCount;
	},
	coin2Name() {
		var coinObj = AllCoins.findOne({ slug: Session.get("compare2") });
		if (coinObj != undefined)
			return coinObj.name;
	},
	coin2Symbol() {
		var coinObj = AllCoins.findOne({ slug: Session.get("compare2") });
		// console.log(coinObj)
		if (coinObj != undefined)
			return coinObj.symbol;
	},
	openIssue2Count() {
		var repo = Githubcount.findOne({ coinSlug: Session.get("compare2") }, { sort: { time: -1 } });
		if (repo != undefined)
			return repo.open_issues_count;
	},
	fork2Count() {
		var repo = Githubcount.findOne({ coinSlug: Session.get("compare2") }, { sort: { time: -1 } });
		if (repo != undefined)
			return repo.forks_count;
	},
	star2Count() {
		var repo = Githubcount.findOne({ coinSlug: Session.get("compare2") }, { sort: { time: -1 } });
		if (repo != undefined)
			return repo.stargazers_count;
	},
	repo2Count() {
		var repo = Githubcount.findOne({ coinSlug: Session.get("compare2") }, { sort: { time: -1 } });
		if (repo != undefined)
			return repo.repoTotalCount;
	},
});

Template.ranking.events({
	"change #rankingSort": function (evt) {
		var newValue = $(evt.target).val();
		Session.set("rankingSort", newValue);
	}
})


Template.ranking.helpers({
	Ranking() {
		try {
			var date = new Date().toGMTString().slice(0, -12);
			date += "00:00:00 GMT";
			date = Date.parse(date);
			if(GithubRanking.findOne({time: date}) == undefined){
				date -= 86400000;
				Meteor.subscribe('gitRanking', date);
			}
			switch (Session.get("rankingSort")) {
				case "Total Repos":
					var arr = GithubRanking.findOne({ time: date }).repos.sort((a, b) => parseFloat(b.repoTotalCount) - parseFloat(a.repoTotalCount));
					return _.map(arr, function(value, index){
					  return {value: value, index: index + 1};
					});
				case "Total Stars":
					var arr = GithubRanking.findOne({ time: date }).repos.sort((a, b) => parseFloat(b.stargazers_count) - parseFloat(a.stargazers_count));
					return _.map(arr, function(value, index){
						return {value: value, index: index + 1};
					  });
				case "Total Forks":
					var arr = GithubRanking.findOne({ time: date }).repos.sort((a, b) => parseFloat(b.forks_count) - parseFloat(a.forks_count));
					return _.map(arr, function(value, index){
						return {value: value, index: index + 1};
					  });
				case "Total Open Issues":
					var arr =  GithubRanking.findOne({ time: date }).repos.sort((a, b) => parseFloat(b.open_issues_count) - parseFloat(a.open_issues_count));
					return _.map(arr, function(value, index){
						return {value: value, index: index + 1};
					  });
				}
		} catch (err) {

		}
	},
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
				y: gitcountdata.repoTotalCount ? gitcountdata.repoTotalCount : 0
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
				y: gitcountdata.repoTotalCount ? gitcountdata.repoTotalCount : 0
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
			var repoData = constructstardata();
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
				y: gitcountdata.stargazers_count ? gitcountdata.stargazers_count : 0
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
				y: gitcountdata.forks_count ? gitcountdata.forks_count : 0
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

Template.gitOpenIssueChart.rendered = function () {
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
			var repoData = constructOpenIssueData();
			d3.select('#openIssueChart svg').datum(
				repoData
			).call(chart);
			nv.utils.windowResize(function () { chart.update(); });
			return chart;
		});

		this.autorun(function () {
			var repoData = constructOpenIssueData();
			d3.select('#openIssueChart svg').datum(
				repoData
			).call(chart);
			chart.update();
		});
	} catch (error) {
		console.log(error);
	}
};

function constructOpenIssueData() {
	var data = [];
	for (const gitcountdata of Githubcount.find({ coinSlug: Session.get("slug") }).fetch()) {
		data.push(
			{
				x: gitcountdata.time,
				y: gitcountdata.open_issues_count ? gitcountdata.open_issues_count : 0
			});
	}
	return [
		{
			values: data,
			key: 'Total Open Issue',
			color: '#7770ff',
			area: true      //area - set to true if you want this line to turn into a filled area chart.
		},
	];
}


Template.gitcommitchart.rendered = function () {
	try {
		var chart = nv.models.stackedAreaChart()
			.margin({ right: 100 })
			.x(function (d) {
				return (new Date(d[0]))
			})   //We can modify the data accessor functions...
			.y(function (d) { return d[1] })   //...in case your data is formatted differently.
			.useInteractiveGuideline(true)    //Tooltips which show all data points. Very nice!
			.rightAlignYAxis(true)      //Let's move the y-axis to the right side.
			.transitionDuration(500)
			.showControls(true)       //Allow user to choose 'Stacked', 'Stream', 'Expanded' mode.
			.clipEdge(true);
		nv.addGraph(function () {

			//Format x-axis labels with custom function.
			chart.xAxis.axisLabel('Date').tickFormat(
				function (d) {
					return d3.time.format('%x')(new Date(d))
				});

			chart.yAxis
				.tickFormat(d3.format(',.2f'));

			var repoData = constructcommitdata();
			d3.select('#commitchart svg').datum(
				repoData
			).call(chart);
			nv.utils.windowResize(function () { chart.update(); });
			return chart;
		});

		this.autorun(function () {
			var repoData = constructcommitdata();
			d3.select('#commitchart svg').datum(
				repoData
			).call(chart);
			chart.update();
		});
	} catch (error) {
		console.log(error);
	}
};

function constructcommitdata() {
	var data = [];
	var date = new Date().toGMTString().slice(0, -12);
	date += "00:00:00 GMT";
	date = Date.parse(date);
	// console.log(date);
	var commits = Githubitems.find({ coinSlug: Session.get("slug") }, { sort: { stargazers_count: -1 }, limit: 10 }).fetch();
	//console.log(commits);
	for (const repo of commits) {
		// console.log(repo);
		var commits_count = repo.commits_count;
		var values = [];
		commits_count.forEach((element, index) => {
			values.push([date - (604800000 * (52 - index)), element]);
		});
		data.push(
			{
				key: repo.name,
				values: values,
			})
	}
	// console.log(data);
	return data;
}


Template.gitcommitchart.rendered = function () {
	try {
		var chart = nv.models.stackedAreaChart()
			.margin({ right: 100 })
			.x(function (d) {
				return (new Date(d[0]))
			})   //We can modify the data accessor functions...
			.y(function (d) { return d[1] })   //...in case your data is formatted differently.
			.useInteractiveGuideline(true)    //Tooltips which show all data points. Very nice!
			.rightAlignYAxis(true)      //Let's move the y-axis to the right side.
			.transitionDuration(500)
			.showControls(true)       //Allow user to choose 'Stacked', 'Stream', 'Expanded' mode.
			.clipEdge(true);
		nv.addGraph(function () {

			//Format x-axis labels with custom function.
			chart.xAxis.axisLabel('Date').tickFormat(
				function (d) {
					return d3.time.format('%x')(new Date(d))
				});

			chart.yAxis
				.tickFormat(d3.format(',.2f'));

			var repoData = constructcommitdata();
			d3.select('#commitchart svg').datum(
				repoData
			).call(chart);
			nv.utils.windowResize(function () { chart.update(); });
			return chart;
		});

		this.autorun(function () {
			var repoData = constructcommitdata();
			d3.select('#commitchart svg').datum(
				repoData
			).call(chart);
			chart.update();
		});
	} catch (error) {
		console.log(error);
	}
};

function constructcommitdata() {
	var data = [];
	var date = new Date().toGMTString().slice(0, -12);
	date += "00:00:00 GMT";
	date = Date.parse(date);
	// console.log(date);
	var commits = Githubitems.find({ coinSlug: Session.get("slug") }, { sort: { stargazers_count: -1 }, limit: 10 }).fetch();
	//console.log(commits);
	for (const repo of commits) {
		// console.log(repo);
		var commits_count = repo.commits_count;
		var values = [];
		commits_count.forEach((element, index) => {
			values.push([date - (604800000 * (52 - index)), element]);
		});
		data.push(
			{
				key: repo.name,
				values: values,
			})
	}
	// console.log(data);
	return data;
}



Template.compareRepo.rendered = function () {
	try {
		var chart = nv.models.lineChart()
			.margin({ right: 100 })
			.x(function (d) {
				return (new Date(d[0]))
			})   //We can modify the data accessor functions...
			.y(function (d) { if (d[1] != undefined) { return d[1] } else { return 0 } })   //...in case your data is formatted differently.
		nv.addGraph(function () {

			//Format x-axis labels with custom function.
			chart.xAxis.axisLabel('Date').tickFormat(
				function (d) {
					return d3.time.format('%x')(new Date(d))
				});

			chart.yAxis
				.tickFormat(d3.format(',.2f'));

			var repoData = constructCompareRepoData();
			d3.select('#compareRepoChart svg').datum(
				repoData
			).call(chart);
			nv.utils.windowResize(function () { chart.update(); });
			return chart;
		});

		this.autorun(function () {
			var repoData = constructCompareRepoData();
			d3.select('#compareRepoChart svg').datum(
				repoData
			).call(chart);
			chart.update();
		});
	} catch (error) {
		// console.log(error);
	}
};

function constructCompareRepoData() {
	var data = [];
	var date = new Date().toGMTString().slice(0, -12);
	date += "00:00:00 GMT";
	date = Date.parse(date);
	var compare1data = Githubcount.find({ coinSlug: Session.get("compare1") }).fetch();
	var c1counts = [];
	for (const c1 of compare1data) {
		// console.log(c1);
		c1counts.push([c1.time, c1.repoTotalCount]);
	}
	var compare2data = Githubcount.find({ coinSlug: Session.get("compare2") }).fetch();
	var c2counts = [];
	for (const c2 of compare2data) {
		// console.log(c2);
		c2counts.push([c2.time, c2.repoTotalCount]);
	}

	data.push(
		{
			key: Session.get("compare1"),
			values: c1counts,
		})
	data.push(
		{
			key: Session.get("compare2"),
			values: c2counts,
		})
	// console.log(data);
	return data;
}



Template.compareStar.rendered = function () {
	try {
		var chart = nv.models.lineChart()
			.margin({ right: 100 })
			.x(function (d) {
				return (new Date(d[0]))
			})   //We can modify the data accessor functions...
			.y(function (d) { if (d[1] != undefined) { return d[1] } else { return 0 } })   //...in case your data is formatted differently.
		nv.addGraph(function () {

			//Format x-axis labels with custom function.
			chart.xAxis.axisLabel('Date').tickFormat(
				function (d) {
					return d3.time.format('%x')(new Date(d))
				});

			chart.yAxis
				.tickFormat(d3.format(',.2f'));

			var repoData = constructCompareStarData();
			d3.select('#compareStarChart svg').datum(
				repoData
			).call(chart);
			nv.utils.windowResize(function () { chart.update(); });
			return chart;
		});

		this.autorun(function () {
			var repoData = constructCompareStarData();
			d3.select('#compareStarChart svg').datum(
				repoData
			).call(chart);
			chart.update();
		});
	} catch (error) {
		// console.log(error);
	}
};

function constructCompareStarData() {
	var data = [];
	var date = new Date().toGMTString().slice(0, -12);
	date += "00:00:00 GMT";
	date = Date.parse(date);
	var compare1data = Githubcount.find({ coinSlug: Session.get("compare1") }).fetch();
	var c1counts = [];
	for (const c1 of compare1data) {
		// console.log(c1);
		c1counts.push([c1.time, c1.stargazers_count]);
	}
	var compare2data = Githubcount.find({ coinSlug: Session.get("compare2") }).fetch();
	var c2counts = [];
	for (const c2 of compare2data) {
		// console.log(c2);
		c2counts.push([c2.time, c2.stargazers_count]);
	}
	data.push(
		{
			key: Session.get("compare1"),
			values: c1counts,
		})
	data.push(
		{
			key: Session.get("compare2"),
			values: c2counts,
		})
	// console.log(data);
	return data;
}

Template.compareFork.rendered = function () {
	try {
		var chart = nv.models.lineChart()
			.margin({ right: 100 })
			.x(function (d) {
				return (new Date(d[0]))
			})   //We can modify the data accessor functions...
			.y(function (d) { if (d[1] != undefined) { return d[1] } else { return 0 } })   //...in case your data is formatted differently.
		nv.addGraph(function () {

			//Format x-axis labels with custom function.
			chart.xAxis.axisLabel('Date').tickFormat(
				function (d) {
					return d3.time.format('%x')(new Date(d))
				});

			chart.yAxis
				.tickFormat(d3.format(',.2f'));

			var repoData = constructCompareForkData();
			d3.select('#compareForkChart svg').datum(
				repoData
			).call(chart);
			nv.utils.windowResize(function () { chart.update(); });
			return chart;
		});

		this.autorun(function () {
			var repoData = constructCompareForkData();
			d3.select('#compareForkChart svg').datum(
				repoData
			).call(chart);
			chart.update();
		});
	} catch (error) {
		// console.log(error);
	}
};

function constructCompareForkData() {
	var data = [];
	var date = new Date().toGMTString().slice(0, -12);
	date += "00:00:00 GMT";
	date = Date.parse(date);
	var compare1data = Githubcount.find({ coinSlug: Session.get("compare1") }).fetch();
	var c1counts = [];
	for (const c1 of compare1data) {
		// console.log(c1);
		c1counts.push([c1.time, c1.forks_count]);
	}
	var compare2data = Githubcount.find({ coinSlug: Session.get("compare2") }).fetch();
	var c2counts = [];
	for (const c2 of compare2data) {
		// console.log(c2);
		c2counts.push([c2.time, c2.forks_count]);
	}
	data.push(
		{
			key: Session.get("compare1"),
			values: c1counts,
		})
	data.push(
		{
			key: Session.get("compare2"),
			values: c2counts,
		})
	// console.log(data);
	return data;
}

Template.compareOpenIssue.rendered = function () {
	try {
		var chart = nv.models.lineChart()
			.margin({ right: 100 })
			.x(function (d) {
				return (new Date(d[0]))
			})   //We can modify the data accessor functions...
			.y(function (d) { if (d[1] != undefined) { return d[1] } else { return 0 } })   //...in case your data is formatted differently.
		nv.addGraph(function () {

			//Format x-axis labels with custom function.
			chart.xAxis.axisLabel('Date').tickFormat(
				function (d) {
					return d3.time.format('%x')(new Date(d))
				});

			chart.yAxis
				.tickFormat(d3.format(',.2f'));

			var repoData = constructCompareOpenIssueData();
			d3.select('#compareOpenIssueChart svg').datum(
				repoData
			).call(chart);
			nv.utils.windowResize(function () { chart.update(); });
			return chart;
		});

		this.autorun(function () {
			var repoData = constructCompareOpenIssueData();
			d3.select('#compareOpenIssueChart svg').datum(
				repoData
			).call(chart);
			chart.update();
		});
	} catch (error) {
		// console.log(error);
	}
};

function constructCompareOpenIssueData() {
	var data = [];
	var date = new Date().toGMTString().slice(0, -12);
	date += "00:00:00 GMT";
	date = Date.parse(date);
	var compare1data = Githubcount.find({ coinSlug: Session.get("compare1") }).fetch();
	var c1counts = [];
	for (const c1 of compare1data) {
		// console.log(c1);
		c1counts.push([c1.time, c1.open_issues_count]);
	}
	var compare2data = Githubcount.find({ coinSlug: Session.get("compare2") }).fetch();
	var c2counts = [];
	for (const c2 of compare2data) {
		// console.log(c2);
		c2counts.push([c2.time, c2.open_issues_count]);
	}
	data.push(
		{
			key: Session.get("compare1"),
			values: c1counts,
		})
	data.push(
		{
			key: Session.get("compare2"),
			values: c2counts,
		})
	// console.log(data);
	return data;
}

