import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo'
import { Promise } from "meteor/promise";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Githubcommits, Githubcount, Githubitems, AllCoins } from '../imports/api/repo.js';


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

getRateLimit = ()=>{
	return new Promise((resolve, reject)=>{
		HTTP.call("GET",
		"https://api.github.com/rate_limit",
		{
			headers: {
				"User-Agent": "ioioio8888",
				"Authorization": "token " + accessToken,
			}
		},
		(err, resp) => {
			if(err){
				console.log(err);
				reject(error);
			}
			resolve(resp.data);
		}
		)
	});
}


var accessToken = ""; //please put your personal access token here
var searchCount = 29; //search api count is 30 calls/min
var nextSearchReset = 0;
const bound = Meteor.bindEnvironment((callback) => { callback(); }); //wrap all non-Meteor (NPM packages for example) callbacks into the Fiber

Meteor.startup(() => {
	// code to run on server at startup'
	if (AllCoins.find({}).fetch().length == 0) {
		Meteor.call('getCoinListCoinMarketCap'); //get coin list if nothing
	}
	SyncedCron.add({
		name: 'Update CoinList everyday at 0401',
		schedule: function (parser) {
			// parser is a later.parse object
			return parser.text('at 04:01am everyday');
		},
		job: () => Meteor.call('getCoinListCoinMarketCap')
	});
	SyncedCron.add({
		name: 'Update git repos',
		schedule: function (parser) {
			// parser is a later.parse object
			return parser.text('at 05:00am everyday');
		},
		job: () => Meteor.call('searchAllGithubRepos')
	});
	SyncedCron.add({
		name: 'Update git commits weekly',
		schedule: function (parser) {
			// parser is a later.parse object
			return parser.text('at 01:00am on Mon');
		},
		job: () => 	Meteor.call('getAllCommitCount')
	});
	SyncedCron.add({
		name: 'Update git api call limit',
		schedule: function (parser) {
			// parser is a later.parse object
			return parser.text('every 30 second');
		},
		job: () => 	getRateLimit().then((data)=>{
			searchCount = (data.resources.search.remaining);
			nextSearchReset = (data.resources.search.reset);
		}).catch()
	});

	SyncedCron.start();

	//you can also call the function manually

	//Meteor.call('getCoinListCoinMarketCap');
	Meteor.call('searchAllGithubRepos');
	//Meteor.call('getAllCommitCount');
});



Meteor.methods({
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
	searchAllGithubRepos: () => {
		const coinNames = AllCoins.find({}).fetch();
		searchCount = 30; //reset the search count
		nextSearchReset = Date.now() + 60000;
		console.log("start getting github repos for " + coinNames[0].slug);
		var date = new Date().toGMTString().slice(0, -12);
		date += "00:00:00 GMT";
		date = Date.parse(date);
		Meteor.call('searchGithubRepos', coinNames, 0, 1, 0, 0, 0, date, true);
	},
	searchGithubRepos: (coinNames, current, pageNumber, star, watcher, fork, now, firstCall) => {
		var tmpstar = star;
		var tmpwatcher = watcher;
		var tmpfork = fork;
		if (searchCount <= 0) {
			setTimeout(function () {
				bound(() => {
					Meteor.call('searchGithubRepos', coinNames, current, pageNumber, star, watcher, fork, now, firstCall);
				});
			}, nextSearchReset - Date.now() + 1000); //recall after next reset
			return;
		}
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
					if (firstCall) {
						//Githubitems.remove({ "coinSlug": coinNames[current].slug });
						Githubcount.upsert({
							coinSlug: coinNames[current].slug,
							time: now,
						}, {
								$set: {
									coinSlug: coinNames[current].slug,
									repoTotalCount: resp.data.total_count,
									time: now,
								}
							},
							{ multi: true }
						);
					}
					for (const repo of resp.data.items) {
						//update the mongodatabase for the repo
						Githubitems.upsert(
							{
								repoId: repo.id,
								createdAt: now,
							},
							{
								$set: {
									coinSlug: coinNames[current].slug,
									createdAt: now,
									repoId: repo.id,
									name: repo.name,
									full_name: repo.full_name,
									description: repo.description,
									url: repo.html_url,
									// commits_url: repo.commits_url.slice(0, -6) + "?per_page=100",
									open_issues_count: repo.open_issues_count,
									size: repo.size,
									stargazers_count: repo.stargazers_count,
									watchers_count: repo.watchers_count,
									forks_count: repo.forks_count,
									// pulls_url: repo.pulls_url.slice(0, -9) + "?per_page=100",
									// commits_count: 0,
								}
							},
							{ multi: true }
						);
						tmpfork += repo.forks_count;
						tmpstar += repo.stargazers_count;
						tmpwatcher += repo.watchers_count;
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
									forks_count: tmpfork,
									stargazers_count: tmpstar,
									watchers_count: tmpwatcher,
								}
							},
							{ multi: true }
						);
						console.log("end for " + coinNames[current].slug);
						if (current + 1 <= coinNames.length) {
							setTimeout(function () {
								bound(() => {
									console.log("start getting github repos for " + coinNames[current + 1].slug);
									Meteor.call('searchGithubRepos', coinNames, current + 1, 1, 0, 0, 0, now, true);
								});
							}, 1000);
							return;
						}
						console.log("all coins are updated");
						return;
					}
					setTimeout(function () {
						bound(() => {
							Meteor.call('searchGithubRepos', coinNames, current, pageNumber + 1, tmpstar, tmpwatcher, tmpfork, now, false);
						});
					}, 1000);
				}
			}
		);
	},
	getAllCommitCount: () => {
		var allRepos = Githubitems.find({}).fetch(); 

		var interval = 1000; // call between 1 sec.
		var promise = Promise.resolve();
		allRepos.forEach((repo) => { 
			promise = promise.then(() => {
				//console.log("start getting github repos for " + repo.name);
				var date = new Date().toGMTString().slice(0, -12);
				date += "00:00:00 GMT";
				date = Date.parse(date);
				Meteor.call('gitHubWeeklyCommits', repo, 0, date);
				return new Promise(function (resolve) {
					setTimeout(resolve, interval);
				});
			}
		)
		})
		promise.then(()=>{
			console.log("done");
		})
	},
	gitHubWeeklyCommits: (repo, current, now) => {
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
						createdAt: now,
					},
					{
						$set: {
							commits_count: resp.data.all,
						}
					},
					{ multi: true }
				);
			})
			//console.log("end getting commits for " + repo.name);
	},
	gitHubUrlCount: (url, pageNumber, Id, tmpcount, attempt) => {
		var requesturl = url + "&page=" + pageNumber;
		HTTP.get(
			requesturl,
			{
				headers: {
					"User-Agent": "ioioio8888",
					"Authorization": "token 1492770641d83c071bdac62ffdc3882e4ea9d6fb",
				}
			},
			(err, resp) => {
				if (resp.statusCode == 409) {
					//repo is empty
					console.log("empty repo: " + Id);
					return;
				}
				if (err) {
					console.log(err);
					return;
				}
				if (resp && resp.statusCode === 200) {
					if (attempt == 1) {
						var link;
						try {
							link = parse_link_header(resp.headers.link).last;
						}
						catch (error) { }
						if (link == undefined) //which means there are less then 100 commits in this response and calculate the no. of commits in this page
						{
							var Jresp = JSON.parse(resp.content);
							tmpcount += Jresp.length;
							console.log("total :" + tmpcount + "for repoId :" + Id);
							Githubitems.upsert(
								{
									repoId: Id
								},
								{
									$set: {
										commits_count: tmpcount
									}
								},
								{ multi: true }
							);
						}
						else //which means there are 100 commits in this response, get the last page - 1 and multiply it by 100, to get the number of commits before the last page
						{
							var match = /[(\&)]([^=]+)\=([^&#]+)/.exec(link);
							var page = match[2] - 1;
							tmpcount += page * 100;
							Meteor.call("gitHubUrlCount", url, match[2], Id, tmpcount, 2);
						}
					}
					else if (attempt == 2) { // add the commits in the last page with the previous result
						var Jresp = JSON.parse(resp.content);
						tmpcount += Jresp.length;
						console.log("total :" + tmpcount + "for repoId :" + Id);
						Githubitems.upsert(
							{
								repoId: Id
							},
							{
								$set: {
									commits_count: tmpcount
								}
							},
							{ multi: true }
						);
					}
				}
			}
		);

	}
})