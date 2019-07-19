import { Meteor } from 'meteor/meteor';
import { Promise } from "meteor/promise";
import { Githubcount, Githubitems, AllCoins, GitToken, GithubRanking } from '../imports/api/repo.js';


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
const bound = Meteor.bindEnvironment((callback) => { callback(); });
//wrap all non-Meteor (NPM packages for example) callbacks into the Fiber
var updatingRepoNew = false;
var updatingCommit = false;

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
	updatingRepoNew = false;
	updatingCommit = false;
	// code to run on server at startup'
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
		job: () => Meteor.call('searchAllGithubReposNew')
	});
	SyncedCron.add({
		name: 'Update git commits',
		schedule: function (parser) {
			// parser is a later.parse object
			return parser.text('every 1 hour');
		},
		job: () => Meteor.call('getAllCommitCount')
	});
	// SyncedCron.add({
	// 	name: 'Update git api call limit',
	// 	schedule: function (parser) {
	// 		// parser is a later.parse object
	// 		return parser.text('every 30 second');
	// 	},
	// 	job: () => getRateLimit().then((data) => {
	// 		searchCount = (data.resources.search.remaining);
	// 		nextSearchReset = (data.resources.search.reset * 1000);
	// 	}).catch()
	// });
	SyncedCron.add({
		name: 'Update git Hub Ranking',
		schedule: function (parser) {
			// parser is a later.parse object
			return parser.text('every 10 minutes');
		},
		job: () => Meteor.call('gitHubRanking')
	});

	SyncedCron.start();

	//update repo when boot up
	// getRateLimit().then((data) => {
	// 	searchCount = (data.resources.search.remaining);
	// 	nextSearchReset = (data.resources.search.reset * 1000);
	// 	Meteor.call('searchAllGithubReposNew');
	// 	Meteor.call('getAllCommitCount');
	// 	Meteor.call('gitHubRanking');
	// }).catch();
	Meteor.call("getCoinListCoinMarketCap");
	Meteor.call('searchAllGithubReposNew');
	Meteor.call('getAllCommitCount');
	Meteor.call('gitHubRanking');
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
					var date = new Date().toGMTString().slice(0, -12);
					date += "00:00:00 GMT";
					date = Date.parse(date);
					resp.data.data.forEach(element => {
						//store all coins into collection for later use
						AllCoins.upsert({
							name: element.name
						},
							{
								name: element.name,
								slug: element.slug,
								symbol: element.symbol,
								lastUpdate: date,
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
	searchAllGithubReposNew: () => {
		if (updatingRepoNew) {
			console.log("Already updaing repos, return");
			return;
		}
		updatingRepoNew = true;
		var date = new Date().toGMTString().slice(0, -12);
		date += "00:00:00 GMT";
		date = Date.parse(date);
		const coinNames = AllCoins.find({ lastUpdate: date }).fetch();
		var interval = 20000; // call between 20 sec, as github api recommended
		var promise = Promise.resolve();
		coinNames.forEach((coin) => {
			if (Githubcount.findOne({ coinSlug: coin.slug, time: date }) != undefined) {
				//updated
			}
			else {
				promise = promise.then(() => {
					console.log("start getting github repos for " + coin.slug);
					Meteor.call("searchGithubReposNew", coin.slug, 1, 0, 0, 0, 0, date, true);
					return new Promise(function (resolve) {
						setTimeout(resolve, interval);
					});
				})
			}
		})
		promise.then(() => {
			updatingRepoNew = false;
			console.log("done updating repos");
		})
	},
	//Use git hub api the get the coin repos detail and store it into collections 
	searchGithubReposNew: (coinSlug, pageNumber, star, watcher, fork, open_issue, now, firstCall) => {
		// console.log(coinSlug);
		var tmpstar = star;
		var tmpwatcher = watcher;
		var tmpfork = fork;
		var tmpOpenIssue = open_issue;
		var url = "https://api.github.com/search/repositories?q=" + coinSlug + "+in:readme&sort=stars&order=desc&page=" + pageNumber + "&per_page=100";
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
					if (resp.data.total_count >= 60000) {
						console.log("unusual data, cancel for " + coinSlug);
						return;
					}
					// Insert each repo into the repos collection
					for (const repo of resp.data.items) {
						//update the mongodatabase for the repo
						Githubitems.upsert(
							{
								repoId: repo.id,
							},
							{
								$set: {
									coinSlug: coinSlug,
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
							coinSlug: coinSlug,
							time: now,
						},
							{
								$set: {
									coinSlug: coinSlug,
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
						console.log("end for " + coinSlug);
					}
					else {
						setTimeout(function () {
							bound(() => {
								Meteor.call('searchGithubReposNew', coinSlug, pageNumber + 1, tmpstar, tmpwatcher, tmpfork, tmpOpenIssue, now, false);
							});
						}, 10);
					}
				}
			}
		);
	},
	//Loop through the repo items and search for the past 52 week commits
	getAllCommitCount: () => {
		if (updatingCommit) {
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
			if (Date.now() - repo.commitsUpdateAt > 604800000 || repo.commitsUpdateAt == undefined) {
				promise = promise.then(() => {
					//console.log("start getting github repos' commits for " + repo.name);
					Meteor.call('gitHubWeeklyCommits', repo);
					return new Promise(function (resolve) {
						setTimeout(resolve, interval);
					});
				})
			}
			else {
				//console.log(repo.name + " is updated within a week.")
			}
		})
		promise.then(() => {
			updatingCommit = false;
			console.log("done updating commits");
		})
	},
	//get the weekly commit count of the past 52 weeks
	gitHubWeeklyCommits: (repo) => {
		try {
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
		} catch (err) {
			console.log(err);
			setTimeout(function () {
				bound(() => {
					Meteor.call('gitHubWeeklyCommits', repo);
				});
			}, 1000);
		}
	},
	gitHubRanking: () => {
		var date = new Date().toGMTString().slice(0, -12);
		date += "00:00:00 GMT";
		date = Date.parse(date);
		var Counts = Githubcount.find({ time: date }).fetch();
		GithubRanking.upsert({
			time: date,
		},
			{
				time: date,
				repos: Counts,
			}
		);
	},
})