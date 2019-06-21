
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

Meteor.startup(() => {
	//code to run on server at startup
	// SyncedCron.add({
	// 	name: 'Update githubdata everyday at 0401',
	// 	schedule: function (parser) {
	// 		// parser is a later.parse object
	// 		return parser.text('at 04:01am everyday');
	// 	},
	// 	job: () => updateGithubRepos.call({}, (err, data) => { })
	// });
	// SyncedCron.start();
	// updateGithubRepos.call({}, (err, data) => {});
	Meteor.call('getCoinListCoinMarketCap');

});


Meteor.methods({
	getCoinListCoinMarketCap:()=>{
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
			(err,resp) => {
				if(!err){
					resp.data.data.forEach(element => {
						AllCoins.upsert({
							name: element.name
						},
						{
							name: element.name,
							slug: element.slug,
						});
					})
					console.log("done");
				}
				else{
					console.log(err);
				}
			}
			)
	},
	getCoinList: () => {
		HTTP.call(
			'GET',
			'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=1&page=1&sparkline=false',
			{},
			(err, resp) => {
				if (!err) {
					resp.data.forEach(element => {
						var coinName = element.name.toLowerCase();
						var pageNumber = 1;
						console.log("start calling")
						Meteor.call('searchGithubRepos', coinName, pageNumber, true);
					});
				}
				else {
					console.log(err);
				}
			})
	},
	searchGithubRepos: (coinName, pageNumber, firstCall) => {
		var url = "https://api.github.com/search/repositories?q=" + coinName + "&sort=stars&order=desc&page=" + pageNumber + "&per_page=100";
		HTTP.call("GET",
			url,
			{
				headers: {
					"User-Agent": "ioioio8888"
				}
			},
			(err, resp) => {
				if (resp && resp.statusCode === 200) {
					// Insert each repo into the repos collection
					if (firstCall) {
						Githubcount.insert({
							coinName: coinName,
							repoTotalCount: resp.data.total_count,
							time: Date.now(),
						});
					}
					var nextUrl = parse_link_header(resp.headers.link).next;
					if (nextUrl == undefined) {
						console.log("end");
						return;
					}
					console.log("call again for" + coinName);
					Meteor.call('searchGithubRepos', pageNumber+1, false);
				}
			}
		);

	}

})



export const updateGithubRepos = new ValidatedMethod({
	name: "updateGithubRepos",
	validate: null,
	run({ }) {
		Reset();
		//while(!RepoUpdated)
		{
			loopthrougpages();
		}
	}
});


let loopthrougpages = async () => {
	while (searchUrl != undefined) {
		await CallGitHubSearchApi()
			.then(rslv => {
				console.log('test');
				RepoUpdated = true;
			})
			.catch(err => {
				console.log(err);
				RepoUpdated = false;
			});
	}
	//if(RepoUpdated)
	{
		await RemoveOldRepo().then(rslv => {
		});
		for (const repo of Githubitems.find().fetch())
		// const repo = Githubitems.findOne();
		{
			tmpcount = 0;	//reset the tmpcount to 0
			commitUrl = repo.commits_url;	//get the commit_url from mongodb
			console.log(commitUrl);
			done = false;
			await CallGitHubCommitApi(repo, 1)
				.then(rslv => {
					// it was successful
				})
				.catch(err => {
					// an error occurred, call the done function and pass the err message
					console.log(err);
				});
			if (!done) {
				await CallGitHubCommitApi(repo, 2)
					.then(rslv => {
						// it was successful

					})
					.catch(err => {
						// an error occurred, call the done function and pass the err message
						console.log(err);
					});
			}
			await AddNewCommit(repo).then(rslv => {
			});
		}
	}
	console.log(5);
}

function RemoveOldRepo() {
	return new Promise(function (resolve, reject) {
		Githubitems.remove({
			_id: { $nin: newreposids }
		});
		resolve();
	});
}


function AddNewCommit(repo) {
	return new Promise(function (resolve, reject) {
		Githubcommits.insert(
			{
				repoid: repo._id,
				name: repo.name,
				count: tmpcount,
				time: new Date(),
			}
		);
		resolve();
	});
}



function CallGitHubCommitApi(repo, attempt) {
	return new Promise(function (resolve, reject) {
		HTTP.get(
			commitUrl,
			{
				headers: {
					"User-Agent": "emurgo/bot",
					"Authorization": "token 4e94e233ae58d77a234c7504c2ebf83549b9097d"
				}
			},
			(err, resp) => {

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
							tmpcount = Jresp.length;
							done = true;
							console.log("total :" + tmpcount);

						}
						else //which means there are 100 commits in this response, get the last page - 1 and multiply it by 100, to get the number of commits before the last page
						{
							commitUrl = link;
							var match = /[(\&)]([^=]+)\=([^&#]+)/.exec(commitUrl);
							var page = match[2] - 1;
							tmpcount = page * 100;
						}
					}
					else if (attempt == 2) { // add the commits in the last page with the previous result
						var Jresp = JSON.parse(resp.content);
						tmpcount += Jresp.length;
						done = true;
						console.log("total :" + tmpcount);

					}
					resolve();
				} else {
					console.log("error");
					done = true;
					reject(err);
				}
			}
		);
	});
}

function CallGitHubSearchApi() {
	return new Promise(function (resolve, reject) {
		HTTP.get(
			searchUrl,
			{
				headers: {
					"User-Agent": "emurgo/bot"
				}
			},
			(err, resp) => {
				if (resp && resp.statusCode === 200) {
					// Insert each repo into the repos collection
					searchUrl = parse_link_header(resp.headers.link).next;
					if (firstupdate) {
						Githubcount.insert({
							repocount: resp.data.total_count,
							time: new Date(),
						});
						firstupdate = false;
					}
					for (const repo of resp.data.items) {
						//update the mongodatabase for the repo
						Githubitems.upsert(
							{
								_id: repo.id
							},
							{
								_id: repo.id,
								repoid: repo.id,
								name: repo.name,
								full_name: repo.full_name,
								description: repo.description,
								url: repo.html_url,
								commits_url: repo.commits_url.slice(0, -6) + "?per_page=100",
							}
						);

					}
					// Ready to remove all repos that were not in the result.
					const repoIds = resp.data.items.map(a => a.id);
					for (const id of repoIds) {
						newreposids.push(id);
					}

					resolve('success');
				} else {
					searchUrl = undefined;
					reject(err);
				}
			}
		);
	});
}

