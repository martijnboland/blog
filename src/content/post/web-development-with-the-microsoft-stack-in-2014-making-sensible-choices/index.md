---
title: "Web Development on the Microsoft stack in 2014 - making sensible choices"
date: "2014-10-24"
categories: 
  - "net"
  - "web-development"
tags: 
  - "angular"
  - "asp-net"
  - "javascript"
  - "jquery"
  - "webforms"
---

In the early days of ASP.NET web development things were easy: Web Forms was the only option for building dynamic web applications. People were happy, people mocked, but life was simple and everybody carried on.  
Fast forward to 2014 and you see that ASP.NET has expanded into a huge family of web technologies (web pages, web forms, mvc, web api, signalr). It can be very difficult to see the forest through the trees. And then there is the ASP.NET [website itself](http://asp.net):

> ASP.NET is a free web framework for building web sites,  
> apps and services with HTML, CSS and JavaScript.

What? Doesn’t make it any clearer, does it? I always thought that ASP.NET was server-side technology (everything _except_ HTML, CSS and JavaScript), so this leaves me kind of confused too.

With so many choices available, picking the right one for your project is a very daunting task. In this post I’ll try to identify what, in my opinion, are the most important pieces in the current ASP.NET stack (leaving out non-Microsoft alternatives for another post) and when to use what and why (or why not).

### [ASP.NET Web Pages](http://www.asp.net/web-pages)

Let’s get this one out of the way first: don’t use it, just use [PHP](http://php.net) like everybody else does when you need a simple website with some dynamic content. Also hosting will be cheaper.

### [ASP.NET Web Forms](http://www.asp.net/web-forms)

Use it in existing projects that are build with it. Don’t start any new Web Forms project (please). Over the years it has served well, but in the end, the ‘familiar drag-and-drop, event-driven model’ just isn’t very compatible with how the web works and more importantly, there simply are better alternatives.

### [ASP.NET MVC](http://www.asp.net/mvc)

MVC should be your default option for rendering pages _server-side_. It’s mature, not too complicated, encourages a decent architecture and has just enough extensibility points to make it work for a broad range of scenarios. In my experience this is also (still) the most productive option, especially for CRUD-style applications. With a little sprinkle of jQuery on the client it’s also very suited for applications that require a _limited_ amount of interactivity on the client.

### [ASP.NET Web API](http://www.asp.net/web-api) [with](https://angularjs.org/) [a](http://facebook.github.io/react/) [JavaScript](http://backbonejs.org/) [Framework](http://emberjs.com/) [of](http://ampersandjs.com/) [choice](http://knockoutjs.com/)

So here it’s where it’s happening in 2014. According to blogs, articles etc. we should all be writing Single Page Applications (SPA’s) because the user experience is so much better when you don’t have those pages refreshing on you every time. This is true and yes, I’m enthusiastic too but please, don’t blindly jump on the SPA bandwagon. Two things to keep in mind:

- A Single Page Application with Web API backend has substantially more moving parts than a ‘classic’ server side application (MVC or Web Forms). Simply said: it’s harder to develop, takes more time and is more expensive, in my experience roughly 1.5-2 times;
- The JavaScript frameworks landscape is still Wild West. I’ve seen .NET shops go all in with the library or framework du jour (from [Knockout](http://knockoutjs.com/) to [Durandal](http://durandaljs.com/) and now [Angular](https://angularjs.org/) ) only to find out that these are not a perfect fit for everything. Choose very careful and don’t go all in;

### [ASP.NET vNext](http://www.asp.net/vnext)

The next version of the ASP.NET stack promises a leaner and faster platform that merges Web Pages, MVC and Web API into one [Open Source](https://github.com/aspnet/Mvc) framework. Changes are huge, especially in the runtime environment, but the differences between Web Pages, MVC and Web API as stated above still apply. Web Forms is left out, so that makes one less option to worry about :-).
