---
title: "How can we make the SharePoint world a better world?"
date: "2009-02-20"
categories: 
  - "aspnet-mvc"
  - "sharepoint"
tags: 
  - "aspnet-mvc"
  - "moss"
  - "sharepoint"
  - "web-standards"
---

Lots of companies are positioning SharePoint as their preferred platform for everything that has to do with the web, both intranet and public facing websites. Now out-of-the-box, SharePoint delivers excellent value, but when building custom functionality or public facing sites, there are some serious issues.

My biggest gripes are:

- The whole development experience is awful. Yes, you can create custom webparts, but I've yet to come across the one that isn't a [big ball of mud](http://en.wikipedia.org/wiki/Big_ball_of_mud). Also, the entire cycle of compiling, deploying and testing takes way too long to be productive at all. One minute is pretty common. Gosh, I wonder why all these projects are late every time ;);
- The HTML output is a mess. Not so much a problem for intranets, but for public sites it is. With a zillion tweaks, it is possible to fix it, but then again, no wonder these projects are late every time;

I've been thinking how to improve this situation. Sure, I could say: "just don't use SharePoint for your public web sites", but companies are going to push everything to Sharepoint anyway. The whitepapers and consultants will tell them that everything is possible and it's from Microsoft, so it's a safe bet. We (as in Microsoft developers) simply have to deal with it the next years.

### A Cunning Plan

First: let's focus on publishing sites. I want to have:

- Clean standards-based HTML;
- Clean url's;
- The ability to add custom applications as a feature without being restricted to webparts, or even better: develop applications standalone and deploy to Sharepoint when they're ready;
- Leverage the SharePoint infrastructure (sites, lists, security, etc);

Looks impossible but is it really?

Couldn't we not drop in System.Web.Routing, create a special SharePointRouteHandler, that sets up required sharepoint infrastructure and delegates the request to a Controller to have ASP.NET MVC within the SharePoint context? I think it's hard and complex, but not impossible. We could leverage all strong points of ASP.NET MVC like separation of concerns, testability, clean HTML together with the huge foundation that SharePoint offers.

### Plan B

Microsoft is already working on this situation and the next version of SharePoint will address the situation properly.

Now, please tell me that I'm **a**: ambitious, **b**: naive or **c**: completely insane :).
