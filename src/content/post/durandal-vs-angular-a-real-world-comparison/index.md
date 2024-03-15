---
title: "Durandal vs Angular - a real world comparison"
date: "2013-12-19"
categories: 
  - "javascript"
  - "web-development"
tags: 
  - "angular"
  - "durandal"
  - "javascript"
---

**Update feb 2015:** Things are moving fast. Rob Eisenberg has left the Angular team and is now working on [Aurelia](http://aurelia.io/). In the meanwhile, the Angular team announced that version 2.0 will be pretty different from the current 1.x version. See also [this post](../angular-is-the-new-uncool/ "Angular is the new uncool?").

**Update may 2014:** Rob Eisenberg, the creator of Durandal has joined the Angular team to build Angular 2.0, see [http://eisenbergeffect.bluespire.com/angular-and-durandal-converge/](http://eisenbergeffect.bluespire.com/angular-and-durandal-converge/ "http://eisenbergeffect.bluespire.com/angular-and-durandal-converge/"). This makes this post kind of obsolete. Angular is the safe choice for the future. I wouldn’t start any new projects based on Durandal 2.x anymore.

\--

[![durandal-240](./images/durandal-240.png "durandal-240")](http://durandaljs.com/)[![angular-240](./images/angular-240.png "angular-240")](http://angularjs.org)

As promised in [my previous post](../moped-a-web-client-for-the-mopidy-music-server/), I’ve also built an [AngularJS](http://angularjs.org) version of the [Moped](https://github.com/martijnboland/moped/tree/durandal-vs-angular) web client for [Mopidy](http://mopidy.com). Moped is an HTML 5 music player app that uses Web Sockets to communicate with the Mopidy music server.

![moped-all-720](./images/moped-all-720_thumb.png "moped-all-720")

The first version of Moped was built with the [DurandalJS](http://durandaljs.com) framework and I’ve built another version with Angular. These two JavaScript frameworks are getting a lot of attention these days (Durandal especially among .NET developers) and are very alike feature-wise. Of course, building the same application twice is  pretty dumb, but at least I learned a lot and it makes up for a nice comparison. The code of both versions can be found at GitHub: [https://github.com/martijnboland/moped/tree/durandal-vs-angular/angular](https://github.com/martijnboland/moped/tree/durandal-vs-angular/angular) for the Angular version and [https://github.com/martijnboland/moped/tree/durandal-vs-angular/durandal](https://github.com/martijnboland/moped/tree/durandal-vs-angular/durandal). Oh and before you ask: I’m not going to do an [Ember](http://emberjs.com/) or [Backbone](http://backbonejs.org/) version ;-).

### Getting started

I’ll put this simply: Angular is easier to get started with than Durandal. There are no dependencies, almost no ceremony. Just a single .js file and a massive amount of tutorials on the web. BUT: while Durandal might be a little bit more complex to setup, it does a better job of leading developers [into to the pit of success](http://www.codinghorror.com/blog/2007/08/falling-into-the-pit-of-success.html) by choosing sensible defaults and conventions that scale better when your projects grows in size. With Angular it’s surely possible to choose [a structure that scales well](http://joshdmiller.github.io/ng-boilerplate) but most examples are pretty naïve and are only suited for small apps that will likely grow into big mess.

### Data binding

Both Durandal and Angular support two-way data binding of JavaScript objects with HTML elements, but they use a different technique. Durandal uses [KnockoutJS](http://knockoutjs.com) for binding and Angular has its own binding system. See [this post by John Papa](http://www.johnpapa.net/compare-durandal-to-angular-not-knockout-to-angular/) for a more in-depth comparison. I think, from a development perspective, the Angular way is superior to Durandal. The binding syntax is cleaner and easier to learn and you don’t have to deal with observables. People often warn that the Angular way of binding is slow with many bound elements, but I didn’t notice that up until a couple of thousand bound elements.

### Code size

The amount of lines of code that you have to write don’t say all that much, but we’re all lazy developers aren’t we? Well, the Angular version of Moped has 1200 lines of JavaScript and the Durandal version 1030. The difference is mainly because the Angular version has some unit tests and the Durandal version has none (yes, shame on me).

### Testing

Angular makes testing so easy that it’s almost impossible to not do it. Even the simplest tutorials already show how to test. I wouldn’t say that testing with Durandal is that hard, but it’s a different ball game.

### Documentation & examples

Official Angular docs are great and official Durandal docs are great. Angular has one problem however: there are many articles and blog posts that can be considered either outdated or simply not so good. Be careful and always check post dates and comments.

### Community / momentum

No doubt, Angular is the no. 1 JavaScript framework of the moment in terms of users/followers. The Durandal community is much smaller and seems to be populated mainly by (former) .NET developers. This isn’t bad per se. The discussions and answers in the Google Groups for both platforms mainly differ in volume and not so much in quality. If you’re a fan of 3rd party plugins however, you’ll find that the smaller Durandal community results in way less plugins (even with the available KnockoutJS plugins).

## And the winner is…

There is no clear winner. Technically both frameworks are equally capable with only relatively small differences left and right.

My pick _at this moment_ would be Angular. For me, it has a few edges over Durandal that are mostly related to personal preferences but I also find the small community of Durandal and the fact that it is developed by only one person a little bit worrying. We’ll have to see what future brings.

However, at the time of writing, Durandal runs a [kickstarter campaign](http://www.kickstarter.com/projects/eisenbergeffect/durandal-2014) to fund the next generation of the framework. I really hope that this next generation of Durandal is going to kick the butts of all the other frameworks. The plans look promising and I think that Google doesn’t need another monopoly with Angular.

Opinions? Please leave a comment.
