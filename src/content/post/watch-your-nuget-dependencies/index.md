---
title: "Watch your NuGet dependencies"
date: "2014-03-31"
categories: 
  - "net"
tags: 
  - "nuget"
---

Since its introduction in 2010, the [NuGet](http://www.nuget.org) package manager has gradually become the default method of adding (Open Source) external libraries to .NET projects. Much easier than downloading all those libraries separately and keeping track of everything.

But be careful: always check the dependencies of the NuGet package you want to install. It might very well be possible that the package depends on a package that your own project already depends on. Even worse are packages that come with an additional 20 packages or so. There always comes a day when you want to upgrade just a single package and another package that also depends on this package prevents the possibility to upgrade or simply breaks with the new version.

Therefore, I always try to follow these rules when adding new NuGet packages:

- Don’t add packages with dependencies to other packages that your project _itself_ already depends on;
- Only add packages with a minimal amount of dependencies.

With these rules in mind you’ll find that future upgrades of NuGet packages are less problematic (and don’t install packages that depend on jQuery, but that’s for another post :-))
