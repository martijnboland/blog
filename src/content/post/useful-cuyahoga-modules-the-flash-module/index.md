---
title: "Useful Cuyahoga Modules &ndash; The Flash module"
date: "2009-04-23"
categories: 
  - "cuyahoga"
tags: 
  - "cuyahoga"
  - "flash"
---

Last weeks, I’ve been working on a project that uses [Cuyahoga](http://cuyahoga-project.org) as the CMS. For this occasion, I’ve (temporarily) turned from Cuyahoga framework developer to a Cuyahoga consumer. In this role I’ve learned to appreciate some contributed modules that I didn’t really know that well, but appeared to be very valuable.

Today, I’d like to pay some attention to the Flash module that comes with Cuyahoga 1.6.0. It allows to embed Flash content in your site, but it also gives you some nice extra’s:

- Optionally add a text representation of the Flash content for search engines or users that don’t have Flash installed;
- It uses [swfobject.js](http://blog.deconcept.com/swfobject/) for automatic plugin detection and prohibiting the nasty ‘Click to activate’ message in IE;
- It allows adding Flash parameters and FlashVars per section.

With the last option, you can for example embed a Flash movie player (the .swf file) and then point it to a .flv movie via FlashVars. Even with the absence of a cool media module in Cuyahoga, you can still dynamically add media content to your site this way.

Very nice!
