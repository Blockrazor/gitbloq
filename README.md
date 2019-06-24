# gitbloq
ALL github activity related to ALL blockchain protocols

<details>
  <summary>How to run gitbloq locally</summary>
<p>

#### Install Meteor   
```
curl https://install.meteor.com/ | sh
```

#### Clone repository    
```
git clone https://github.com/Blockrazor/gitbloq.git
```

Note: if you want to edit things and send a pull request you should _fork_ this project on Github first and clone _your_ fork instead of https://github.com/Blockrazor/gitbloq.git.

#### Install Dependencies   
```
meteor npm install
```

#### Run meteor
`npm start`
(use `npm run prod` to minify everything and simulate production speeds)
(use `npm run debug` to start Meteor in debug mode)

If Meteor starts but you get a white screen:
```
meteor npm install --save core-js
```

#### Environment Variables

Create `.env` file on home directory and add your variables


#### Install Mongo DB

(You will need [Mongo](https://docs.mongodb.com/manual/installation/) to be installed on your system).


#### Mongo errors   
If Mongo exists with status 1:
Quick fix: `export LC_ALL=C`   
Proper fix: something is wrong with your OS locales, good luck.

#### Meteor errors
If you do a `git pull` and Meteor doesn't start, the first thing to do is run `meteor npm install` as there may be package updates.

</p>
</details>    


## Contributing to gitbloq    
A cardinal sin that many open source developers make is to place themselves above others. "I founded this project thus my intellect is superior to that of others". It's immodest and rude, and usually inaccurate. The contribution policy we use at gitbloq applies equally to everyone, without distinction.    

The contribution policy we follow is the [Collective Code Construction Contract (C4)](/CONTRIBUTING.MD)    

If you're wondering why any of the rules in the C4 are there, take a look at the [line by line explanation](/DESCRIPTIVE_C4.MD) of everything in the C4, this explains the rationale and history behind everything in the protocol and makes it easier to understand.

Take a look at past [pull requests](https://github.com/Blockrazor/gitbloq/pulls?q=is%3Apr+is%3Aclosed) to see how we usually do things.     


<details>
  <summary>Step-by-step guide to sending a pull request</summary>
<p>

1. Read the [contribution protocol](/CONTRIBUTING.MD) and the [line by line explanation](/DESCRIPTIVE_C4.MD) of the protocol.
2. Fork this github repository under your own github account.
3. Clone _your_ fork locally on your development machine.
4. Choose _one_ problem to solve. If you aren't solving a problem that's already in the issue tracker you should describe the problem there (and your idea of the solution) first to see if anyone else has something to say about it (maybe someone is already working on a solution, or maybe you're doing somthing wrong).

5. Add the Blockrazor repository as an upstream source and pull any changes:
```
@: git remote add upstream git@github.com:Blockrazor/gitbloq.git //only needs to be done once
@: git checkout master //just to make sure you're on the correct branch
@: git pull upstream master //this grabs any code that has changed, you want to be working on the latest 'version'
@: git push //update your remote fork with the changes you just pulled from upstream master
```
5. Create a local branch on your machine `git checkout -b branch_name` (it's usually a good idea to call the branch something that describes the problem you are solving). _Never_ develop on the `master` branch, as the `master` branch is exclusively used to accept incoming changes from `upstream:master` and you'll run into problems if you try to use it for anything else.
6. Solve the problem in the absolute most simple and fastest possible way with the smallest number of changes humanly possible. Tell other people what you're doing by putting _very clear and descriptive comments in your code every 2-3 lines_.    
Add your name to the AUTHORS file so that you become a part owner of Blockrazor.    
7. Commit your changes to your own fork:
Before you commit changes, you should check if you are working on the latest version (again). Go to the github website and open _your_ fork of Blockrazor, it should say _This branch is even with Blockrazor:master._    
If **not**, you need to pull the latest changes from the upstream Blockrazor repository and replay your changes on top of the latest version:
```
@: git stash //save your work locally
@: git checkout master
@: git pull upstream master
@: git push
@: git checkout -b branch_name_stash
@: git stash pop //_replay_ your work on the new branch which is now fully up to date with the Blockrazor repository
```

Note: after running `git stash pop` you should run Meteor and look over your code again and check that everything still works as sometimes a file you worked on was changed in the meantime.

Now you can add your changes:   
```
@: git add changed_file.js //repeat for each file you changed
```

And then commit your changes:
```
@: git commit -m 'problem: <50 characters describing the problem //do not close the '', press ENTER two (2) times
>
>solution: short description of how you solved the problem.' //Now you can close the ''. Be sure to mention the issue number if there is one (e.g. #6)    
@: git push //this will send your changes to _your_ fork on Github
```    
8. Go to your fork on Github and select the branch you just worked on. Click "pull request" to send a pull request back to the Blockrazor repository.
9. Send the pull request, be sure to mention the issue number with a # symbol at the front (e.g. #1014).  

#### What happens after I send a pull request?    
If your pull request contains a correct patch (read the C4) a maintainer will merge it.
If you want to work on another problem while you are waiting for it to merge simply repeat the above steps starting at:
```
@: git checkout master
```

#### Tests
To run tests:
```
meteor test --driver-package practicalmeteor:mocha
```

You should generally write a test for anything you don't want to break later, otherwise it will probably end up being broken by someone. We use [Mocha + Chai](https://guide.meteor.com/testing.html#mocha) for testing. You can see an example in [this](https://github.com/Blockrazor/blockrazor/pull/378/files) pull request.
</p>
</details>    

## License
The license and contribution policy are two halves of the same puzzle. This project is licensed under the [MPL v2.0 license](LICENSE). The code is owned (and Copyright) by _all_ contributors. Contributors are listed in the [AUTHORS](AUTHORS) file. Please add your name to the end of this file in your first pull request so that you also become an owner.

This license ensures that:
1. Contributors to Blockrazor cannot have their code stolen and used by closed-source projects without their permission. It's very common for corporate software merchants to steal code from open source projects and use it in their closed source or even patented products and services in direct competition with the original project. For example, anyone who contributes code to a project released under a BSD/MIT style license effectively has no rights to their own code or any improvements made upon it.
2. Anyone using any code from Blockrazor must also share their work under a _share-alike_ license so that anyone else can use their improvements.
3. No one can change the above, without explicit written permission from _all_ contributors, which is essentially impossible to get. That means even the founder of this project cannot ever relicense and sell Blockrazor and its code. It belongs to everyone who contributed to it (and it always will).

It is not permissible to use _any_ code from this codebase in _anything_ that isn't using a _share-alike_ license. Violations of the license will absolutely not be tolerated, and the terms of this license will be _brutally_ enforced through a variety of _very_ creative methods.****
