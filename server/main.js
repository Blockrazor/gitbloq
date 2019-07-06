import { Meteor } from 'meteor/meteor';
import { Promise } from "meteor/promise";
import {  Githubcount, Githubitems, AllCoins, GitToken } from '../imports/api/repo.js';


function parse_link_header(header) {
	if (header.length === 0) {
		throw new Error("input must not be of zero length");
	}

	// Split parts by comma
	var parts = header.split(',');
	var links = {};
	// Parse each part into a named link
	for (var i = 0; i < parts.length; i++) {
		var section = parts[i].split(';');
		if (section.length !== 2) {
			throw new Error("section could not be split on ';'");
		}
		var url = section[0].replace(/<(.*)>/, '$1').trim();
		var name = section[1].replace(/rel="(.*)"/, '$1').trim();
		links[name] = url;
	}
	return links;
}

var accessToken = GitToken.findOne().token; 
//please put your personal access token into GitToken collection with "token" parameter 
var searchCount = 29; 
//search api count is 30 calls/min, use 29 to prevent any inaccurate count
var nextSearchReset = 0;
const bound = Meteor.bindEnvironment((callback) => { callback(); });
var updatingRepo = false;
var updatingCommit = false;
//wrap all non-Meteor (NPM packages for example) callbacks into the Fiber

//update the rate limit of git-hub api
getRateLimit = () => {
	return new Promise((resolve, reject) => {
		HTTP.call("GET",
			"https://api.github.com/rate_limit",
			{
				headers: {
					"User-Agent": "ioioio8888",
					"Authorization": "token " + accessToken,
				}
			},
			(err, resp) => {
				if (err) {
					console.log(err);
					reject(error);
				}
				resolve(resp.data);
			}
		)
	});
}

Meteor.startup(() => {
	updatingRepo = false;
	updatingCommit = false;
	// code to run on server at startup'
	if (AllCoins.find({}).fetch().length == 0) {
		Meteor.call('getCoinListCoinMarketCap'); //get coin list if nothing
	}
	SyncedCron.add({
		name: 'Update CoinList',
		schedule: function (parser) {
			// parser is a later.parse object
			return parser.text('at 00:01 everyday');
		},
		job: () => Meteor.call('getCoinListCoinMarketCap')
	});
	SyncedCron.add({
		name: 'Update git repos',
		schedule: function (parser) {
			// parser is a later.parse object
			return parser.text('every 1 hour');
		},
		job: () => Meteor.call('searchAllGithubRepos')
	});
	SyncedCron.add({
		name: 'Update git commits',
		schedule: function (parser) {
			// parser is a later.parse object
			return parser.text('every 1 hour');
		},
		job: () => Meteor.call('getAllCommitCount')
	});
	SyncedCron.add({
		name: 'Update git api call limit',
		schedule: function (parser) {
			// parser is a later.parse object
			return parser.text('every 30 second');
		},
		job: () => getRateLimit().then((data) => {
			searchCount = (data.resources.search.remaining);
			nextSearchReset = (data.resources.search.reset * 1000);
		}).catch()
	});

	SyncedCron.start();

	//update repo when boot up
	Meteor.call('searchAllGithubRepos');
	Meteor.call('getAllCommitCount');

	//^^^^^^you can also call the function manually^^^^^^^ 

});



Meteor.methods({
	//get a list of avaliable coin from coin market cap and store it into collection
	getCoinListCoinMarketCap: () => {
		console.log("storing coin list");
		HTTP.call(
			'GET',
			'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
			{
				params: {
					'limit': '5000',
				},
				headers: {
					'X-CMC_PRO_API_KEY': '5e801824-f58d-4994-a34e-19ba135e0edb'
				}
			},
			(err, resp) => {
				if (!err) {
					resp.data.data.forEach(element => {
						//store all coins into collection for later use
						AllCoins.upsert({
							name: element.name
						},
							{
								name: element.name,
								slug: element.slug,
								symbol: element.symbol,
							});
					})
					console.log("store list done");
				}
				else {
					console.log(err);
				}
			}
		)
	},

	//Get the github repos by the coin name
	searchAllGithubRepos: () => {
		if(updatingRepo){
			console.log("Already updaing repos, return");
			return;	
		}
		updatingRepo = true;
		const coinNames = AllCoins.find({}).fetch();
		searchCount = 29; 
		//search api count is 30 calls/min, use 29 to prevent any inaccurate count
		nextSearchReset = Date.now() + 60000;
		var date = new Date().toGMTString().slice(0, -12);
		date += "00:00:00 GMT";
		date = Date.parse(date);
		Meteor.call('searchGithubRepos', coinNames, 0, 1, 0, 0, 0,0, date, true);
	},
	//Use git hub api the get the coin repos detail and store it into collections 
	searchGithubRepos: (coinNames, current, pageNumber, star, watcher, fork, open_issue, now, firstCall) => {
		try {
			if(firstCall && Githubcount.findOne({ coinSlug: coinNames[current].slug, time: now }) != undefined){
				//console.log(coinNames[current].slug + " is already updated today.");
				//console.log("start getting github repos for " + coinNames[current + 1].slug);
				Meteor.call('searchGithubRepos', coinNames, current + 1, 1, 0, 0, 0, 0, now, true);
				return;
			}
			if(firstCall){
				console.log("start getting github repos for " + coinNames[current].slug);
				}

			if (searchCount <= 0) {
				setTimeout(function () {
					bound(() => {
						Meteor.call('searchGithubRepos', coinNames, current, pageNumber, star, watcher, fork, open_issue, now, firstCall);
					});
				}, nextSearchReset - Date.now() + 1000); //recall after next reset
				return;
			}
			var tmpstar = star;
			var tmpwatcher = watcher;
			var tmpfork = fork;
			var tmpOpenIssue = open_issue;
			searchCount -= 1;
			var url = "https://api.github.com/search/repositories?q=" + coinNames[current].slug + "&sort=stars&order=desc&page=" + pageNumber + "&per_page=100";
			HTTP.call("GET",
				url,
				{
					headers:
					{
						"User-Agent": "ioioio8888",
						"Authorization": "token " + accessToken,
					}
				},
				(err, resp) => {
					if (err) {
						console.log(err);
						return;
					}
					if (resp && resp.statusCode === 200) {
						// Insert each repo into the repos collection
						for (const repo of resp.data.items) {
							//update the mongodatabase for the repo
							Githubitems.upsert(
								{
									repoId: repo.id,
								},
								{
									$set: {
										coinSlug: coinNames[current].slug,
										repoUpdatedAt: now,
										repoId: repo.id,
										name: repo.name,
										full_name: repo.full_name,
										description: repo.description,
										url: repo.html_url,
										open_issues_count: repo.open_issues_count,
										size: repo.size,
										stargazers_count: repo.stargazers_count,
										watchers_count: repo.watchers_count,
										forks_count: repo.forks_count,
									}
								},
								{ multi: true }
							);
							tmpfork += repo.forks_count;
							tmpstar += repo.stargazers_count;
							tmpwatcher += repo.watchers_count;
							tmpOpenIssue += repo.open_issues_count;
						}
						var nextUrl = undefined;
						try {
							nextUrl = parse_link_header(resp.headers.link).next;
						} catch (error) {

						}

						if (nextUrl == undefined) {
							Githubcount.upsert({
								coinSlug: coinNames[current].slug,
								time: now,
							},
								{
									$set: {
										coinSlug: coinNames[current].slug,
										repoTotalCount: resp.data.total_count,
										time: now,
										forks_count: tmpfork,
										stargazers_count: tmpstar,
										watchers_count: tmpwatcher,
										open_issues_count: tmpOpenIssue,
									}
								},
								{ multi: true }
							);
							console.log("end for " + coinNames[current].slug);
							if (current + 1 <= coinNames.length) {
								setTimeout(function () {
									bound(() => {
										Meteor.call('searchGithubRepos', coinNames, current + 1, 1, 0, 0, 0, 0, now, true);
									});
								}, 1000);
								return;
							}
							console.log("all coins are updated");
							updatingRepo = false;
							return;
						}
						setTimeout(function () {
							bound(() => {
								Meteor.call('searchGithubRepos', coinNames, current, pageNumber + 1, tmpstar, tmpwatcher, tmpfork, tmpOpenIssue ,now, false);
							});
						}, 1000);
					}
				}
			);

		} catch (err) {
			console.log(err);
			setTimeout(function () {
				bound(() => {
					Meteor.call('searchGithubRepos', coinNames, current, 1, 0, 0, 0, 0, now, true);
				});
			}, 1000);
			return;
		}
	},
	//Loop through the repo items and search for the past 52 week commits
	getAllCommitCount: () => {
		if(updatingCommit){
			console.log("Already updaing commits, return");
			return;	
		}
		updatingCommit = true;
		var date = new Date().toGMTString().slice(0, -12);
		date += "00:00:00 GMT";
		date = Date.parse(date);
		var allRepos = Githubitems.find({ repoUpdatedAt: date }).fetch();

		var interval = 1000; // call between 1 sec, as github api recommended
		var promise = Promise.resolve();
		allRepos.forEach((repo) => {
			if(Date.now() - repo.commitsUpdateAt > 604800000 || repo.commitsUpdateAt == undefined){
			promise = promise.then(() => {
				console.log("start getting github repos' commits for " + repo.name);
				var date = new Date().toGMTString().slice(0, -12);
				date += "00:00:00 GMT";
				date = Date.parse(date);
				Meteor.call('gitHubWeeklyCommits', repo);
				return new Promise(function (resolve) {
					setTimeout(resolve, interval);
				});
			}
			)
			}
			else{
				//console.log(repo.name + " is updated within a week.")
			}
		})
		promise.then(() => {
			updatingCommit = false;
			console.log("done");
		})
	},
	//get the weekly commit count of the past 52 weeks
	gitHubWeeklyCommits: (repo) => {
		try{
		HTTP.get(
			"https://api.github.com/repos/" + repo.full_name + "/stats/participation",
			{
				headers: {
					"User-Agent": "ioioio8888",
					"Authorization": "token " + accessToken,
				}
			}, (err, resp) => {
				if (err) {
					console.log(err);
					return;
				}
				Githubitems.upsert(
					{
						repoId: repo.repoId,
					},
					{
						$set: {
							commitsUpdateAt: Date.now(),							
							commits_count: resp.data.all,
						}
					},
					{ multi: true }
				);
			})
		}catch(err){
			console.log(err);
			setTimeout(function () {
				bound(() => {
					Meteor.call('gitHubWeeklyCommits', repo);
				});
			}, 1000);
		}
	},
})