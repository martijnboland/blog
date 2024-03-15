---
title: "MvcPaging 2.1"
date: "2014-01-23"
categories: 
  - "aspnet-mvc"
tags: 
  - "aspnet-mvc"
  - "open-source"
  - "paging"
---

Today, a new version of the [MvcPaging](http://www.nuget.org/packages/mvcpaging) library was released. The only new feature in this release is the option to add strongly typed route values.  
In the past you had to add extra route values for the page links like this:

```csharp
@Html.Pager(Model.Items.PageSize, Model.Items.PageNumber, Model.Items.TotalItemCount).Options(o => o
    .AddRouteValue("Filter.Name", Model.Filter.Name)
    .AddRouteValue("Filter.City", Model.Filter.City)
    .AddRouteValue("Filter.PostalCode", Model.Filter.PostalCode)
)
```

We’re assuming a viewmodel with an ‘Items’ property as the IPagedList and a ‘Filter’ property for extra filter attributes.

From version 2.1.0 you can use the new AddRouteValueFor method to get rid of the strings:

```csharp
@Html.Pager(Model.Items.PageSize, Model.Items.PageNumber, Model.Items.TotalItemCount).Options(o => o
    .AddRouteValueFor(m => m.Filter.Name)
    .AddRouteValueFor(m => m.Filter.City)
    .AddRouteValueFor(m => m.Filter.PostalCode)
)
```

It looks like a small new feature, but behind the scenes, we had to make the Pager and related classes model-aware by creating typed versions (Pager<TModel>). This was a relative big change and therefore the version number jump to 2.1. Adding the model-awareness opens up a lot of new extension possibilities.

See [https://github.com/martijnboland/MvcPaging](https://github.com/martijnboland/MvcPaging "https://github.com/martijnboland/MvcPaging") for more info or to get the code or get the NuGet package from [http://www.nuget.org/packages/mvcpaging](http://www.nuget.org/packages/mvcpaging "http://www.nuget.org/packages/mvcpaging").

**Update:** there is a live demo now at [http://demo.taiga.nl/mvcpaging](http://demo.taiga.nl/mvcpaging).
