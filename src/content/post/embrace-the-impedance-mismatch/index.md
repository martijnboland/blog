---
title: "Embrace the impedance mismatch"
date: "2008-12-05"
categories: 
  - "general"
tags: 
  - "impedance-mismatch"
  - "software-development"
---

Maybe I'm a bit of a masochist, but I enjoy a good flamewar at times. For that reason, I still have [TheServerSide.com](http://theserverside.com) in my bookmarks to check out what our Java friends are bitching about. My favorite subjects are 'the new web framework of the month' and the occasional persistence framework rants. Today, I checked TheServerSide to see a post with the subject "[Criticism of Java Persistence Frameworks](http://www.theserverside.com/news/thread.tss?thread_id=52106)" that had a promising 46 comments. Yummie!

The comments were a little bit disappointing for my taste, but one from Robert Pappas was very interesting:

> **The gap between stateless HTTP and OOP is nearly as wide as the gap between OOP and RDMS.** This is why we have at least 6 major Web Frameworks for Java...and all of them have serious drawbacks (from my experience anyway). But yes, your concerns are valid. There is a mis-match, and I'm not sure if it can be address in a seamless way. (Without switching to Object Databases)

And he's right! The impedance mismatch that people often talk about, also exists in web programming. So instead of one impedance mismatch we have to deal with at least two of them! That makes a developers life even worse, according to the rest of the comment.

[![holygrail](images/holygrail_thumb.jpg)](https://blogs.taiga.nl/martijn/wp-content/uploads/subtext/WindowsLiveWriter/Embracetheimpedancemismatch_B235/holygrail_2.jpg)What struck me about this comment is the negative tone that might have been caused by frustrations when trying to bridge the gaps between relational databases, OO and web programming. Lots of developers are constantly searching for the one and only **Holy Grail of Software Development** and get frustrated when it appears that what they found is all but the Holy Grail.

### Embrace it

One day, I came to the conclusion that the Holy Grail of Software Development doesn't exist and that made developing software so much more fun. It's just the mind set! **Accept it and embrace it**, stop searching for the Holy Grail and use the tools that help to embrace the mismatch instead of fighting it.

Back to .NET web application development: choose a good [O/R mapping solution](http://www.nhibernate.org) and something like [ASP.NET MVC](http://www.asp.net/mvc/) or [Monorail](http://www.castleproject.org/MonoRail/). Definitely not the Holy Grail, but these tools embrace the impedance mismatch and that sure made development less frustrating and much more fun!
