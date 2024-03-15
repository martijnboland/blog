---
title: "New adventures under medium trust"
date: "2009-06-24"
categories: 
  - "castle"
  - "cuyahoga"
tags: 
  - "castle"
  - "cuyahoga"
  - "lucene-net"
  - "medium-trust"
  - "nhibernate"
---

Many web hosting companies only allow ASP.NET applications to run under medium trust. This has been a major drawback for [Cuyahoga](http://cuyahoga-project.org) because it required full trust (or better: some libraries require full trust). This has already caused some nasty surprises when people deployed their site to the host to find out it would not run.

Well, I can finally say that Cuyahoga 2.0 will work under medium trust!

### Castle DynamicProxy

Last week, someone mentioned on the [Castle](http://castle-project.org) [users list](http://groups.google.com/group/castle-project-users) that [DynamicProxy](http://www.castleproject.org/dynamicproxy/index.html) was supposed to work under medium trust and this immediately triggered me. DynamicProxy had always been the key part that prevented Cuyahoga, [NHibernate](http://nhforge.org/Default.aspx), and lots of other software from running under medium trust because it generates assemblies on the fly and that’s not allowed (at least pre-NET 2.0 SP1).

So, I checked out a fresh version of the Castle trunk, built it with AllowPartiallyTrustedCallers and copied the assemblies to Cuyahoga that was set to run under medium trust.  
Unfortunately, still no luck. The dreaded SecurityException showed its yellow screen, but instead of giving up immediately, I took a deep breath and started digging the DynamicProxy sources. The solution was a simple one: DynamicProxy calls [AssemblyBuilder.DefineDynamicModule](http://msdn.microsoft.com/en-us/library/system.reflection.emit.assemblybuilder.definedynamicmodule.aspx) and used the overload that generates debug symbols. Changing that to not generate the debug symbols anymore made it work under medium trust! I send a patch to the Castle guys and lets hope it can be incorporated. This allows NHibernate to run under medium trust without turning off [lazy-load on class mappings](http://nhforge.org/wikis/howtonh/run-in-medium-trust.aspx) or using a special [proxy generator](http://blechie.com/WPierce/archive/2008/02/17/Lazy-Loading-with-nHibernate-Under-Medium-Trust.aspx).

One caveat: the Castle trunk requires .NET 3.5, so we can’t fix it for the 1.6.x branch of Cuyahoga which is .NET 2.0.

### Lucene.Net

Second, [Lucene.Net](http://incubator.apache.org/lucene.net/) didn’t work under medium trust and boy, that was easy to fix: a single call was made to a relative file path, which is not allowed. Changed that to use the full path and it worked. [Submitted a patch](http://issues.apache.org/jira/browse/LUCENENET-169) and I hope they will accept it.

### Cuyahoga

So, with the libraries working under medium trust, I was ready to roll, at least I thought so. It appeared however that Cuyahoga also did some nasty things that are not allowed under medium trust, such as requesting a HttpModule instance from the appdomain and some file access outside the application root. Fortunately these were easy fixes and now I have everything working just fine under medium trust.

I think, I’ll leave medium trust turned on in the development version to signal issues in an early state.
