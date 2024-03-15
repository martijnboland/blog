---
title: "Hey, something's changed!"
date: "2009-02-03"
categories: 
  - "general"
tags: 
  - "iis"
  - "php"
  - "subtext"
  - "wordpress"
---

![](./images/smbutton-blue-bg.png) Today, I moved this blog from [SubText](http://subtextproject.com/) to [WordPress](http://wordpress.org/). All was going fine with SubText, but WordPress is so much more sophisticated these days, I couldn't resist it :).

Since the server is running IIS6 and not the usual LAMP stack, I was prepared for some struggling, but it was pretty easy.

I started with installing the [IIS FastCGI extension](http://www.microsoft.com/DownLoads/details.aspx?FamilyID=2d481579-9a7c-4632-b6e6-dee9097f9dc5&displaylang=en), [PHP 5.2.8](http://www.php.net/) and [MySQL 5.1.30](http://www.mysql.com/). After that, I only had to install WordPress and things were ready to roll.

For pretty extensionless urls, I found the [Ionics Isapi Rewrite Filter](http://www.codeplex.com/IIRF) that also redirects the old SubText url's to the new pretty ones.

The most challenging part was migrating the old posts from SubText to WordPress, but [luckily, I wasn't the first one who attempted this](http://blog.digitaltinder.net/2008/12/exporting-blogml-from-subtext-21-and-importing-blogml-into-wordpress-27/).

Please leave a comment if something is broken, or when you find links that point to the old blog.
