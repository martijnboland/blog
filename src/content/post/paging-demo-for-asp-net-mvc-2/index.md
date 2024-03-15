---
title: "Paging demo for ASP.NET MVC 2"
date: "2010-01-27"
categories: 
  - "aspnet-mvc"
tags: 
  - "area"
  - "aspnet-mvc"
  - "paging"
---

During work, I discovered that the [pager that I created a while ago](../paging-with-aspnet-mvc/) didn’t work properly when using ASP.NET MVC2 area’s. The links that were generated didn’t count for the current area that the controller and views were in, resulting in wrong urls. Luckily the ASP.NET MVC team also ran into this issue and created an GetVirtualPathForArea() extension method on RouteCollection. Calling this one, instead of GetVirtualPath() made things work properly in area’s.

You can get the code for ASP.NET MVC 2 at [http://github.com/martijnboland/MvcPaging/tree/mvc2](http://github.com/martijnboland/MvcPaging/tree/mvc2 "http://github.com/martijnboland/MvcPaging/tree/mvc2") (mvc2 branch of the MvcPaging repository).
