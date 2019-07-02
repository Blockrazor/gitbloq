import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo'


export const AllCoins = new Mongo.Collection('allcoins');
export const Githubcommits = new Mongo.Collection('githubcommits');
export const Githubitems = new Mongo.Collection('githubitems');
export const Githubcount = new Mongo.Collection('githubcount');


if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('githubitems', (date) => {
    return Githubitems.find({createdAt: date},{sort: {stargazers_count: -1}},{limit:100});
  });
  Meteor.publish('githubcount', () => {
    return Githubcount.find();
  });
  Meteor.publish('githubcommits', (date) => {
    return Githubcommits.find({createdAt: date},{limit:100});
  });
  Meteor.publish('allcoins', () => {
    return AllCoins.find();
  });
}