---
title: "The problem of data grids in your web application"
date: "2009-06-09"
categories: 
  - "web-development"
tags: 
  - "datagrid"
  - "excel"
---

I’m sure everybody who builds web applications uses grids to display data. There is nothing wrong with that per se, but you might not realize that you’re increasing the customers expectations to an unreachable level:

> Yes, all very nice and well, but can’t you make that thing work like Excel?

My first thought is always something like: “sure, if you supply us with the budget that the Excel team has”, but in practice we’ll always end up buying one of those bloated grid components or hacking our own solution where the customers is never 100% happy (because it still doesn’t work like Excel).

### The solution?

Don’t format the data in a grid, but in a nicely formatted list and stay away from anything that resembles column headers. Add some simple search and filter options and people are happy.
