import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo'


export const AllCoins = new Mongo.Collection('allcoins');
export const Githubitems = new Mongo.Collection('githubitems');
export const Githubcount = new Mongo.Collection('githubcount');
export const GithubRanking = new Mongo.Collection('githubRanking');
export const GitToken = new Mongo.Collection('gitToken');


if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('githubcount', (name) => {
    return Githubcount.find({coinSlug: name});
  });
  Meteor.publish('allcoins', () => {
    return AllCoins.find({}, {skip: 0, limit: 2000});
  });
  Meteor.publish('gitToken', () => {
    return GitToken.findOne();
  });
  Meteor.publish('gitRanking', (date) => {
    return GithubRanking.find({time: date});
  });
  Meteor.publish('githubitemsPerCoin', (date, name) => {
    return Githubitems.find({repoUpdatedAt: date ,coinSlug: name },{sort: {stargazers_count: -1}});
  });
}