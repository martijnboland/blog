---
title: "Staying out of .NET Open Source dependency hell"
date: "2010-04-14"
categories: 
  - "net"
tags: 
  - "net"
  - "open-source"
---

Probably all consumers of Open Source .NET libraries have run into the following situation: you’re using specific versions of library X and library Y in your application but library X also uses library Y, but a different incompatible version. Aaarrrghh!!!

A classic example of [Dependency Hell](http://en.wikipedia.org/wiki/Dependency_hell).

There are technical solutions out there that address this issue such as [Horn](http://hornget.net) or [Maven](http://maven.apache.org/) for Java, but I think there is an alternative non-technical solution: Just reduce the amount of libraries that you depend on.

This might sound silly because why re-invent the wheel? Well, you don’t have to. Let’s take a concrete example. I was using [MvcContrib’s](http://mvccontrib.codeplex.com) [Castle Windsor](http://www.castleproject.org/container/) controller factory in a project, but then, when I upgraded Castle Windsor it didn’t work anymore. Of course there wasn’t a new version of MvcContrib released yet that depended on the new Castle Windsor, so I had to build a new version from source. Then I started looking at the code and realized that it was just one simple class from the library that I was using. So I created _copy & pasted_ a Windsor Controller factory class in my own project and got rid of one external dependency. Yes, I’m promoting Copy & Paste development here!

Of course, I’m not advocating that you should get rid of all your dependencies, but it might be wise to have a look at the dependencies and evaluate if you can get without some of them with just a little bit of work. This can save you from a lot of trouble, especially when you’re the type of programmer like me that wants to run the latest and greatest version of everything but _not_ wants to build everything from source over and over again.

What works for me is the following guideline: try to keep away from libraries that use other (non-Microsoft base class) libraries if there are reasonable alternatives.
