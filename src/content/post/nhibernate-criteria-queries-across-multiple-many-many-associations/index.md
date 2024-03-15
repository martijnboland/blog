---
title: "NHibernate criteria queries across multiple many-many associations"
date: "2008-11-20"
categories: 
  - "or-mapping"
tags: 
  - "nhibernate"
---

Recently, I ran into an issue with NHibernate Criteria queries. The scenario is the following:

![double-many-many](./images/double-many-many_thumb_1.png)

User has a many-many association with Role and Role has a many-many association with Site. I simply wanted all users that belong to a given site (and a whole slew of other optional parameters, therefore the Criteria query).

With hql this is simple:

```sql
select distinct u from User u join u.Roles r join r.Sites s where s.Id = :siteId
```

With a criteria query, it appeared a little bit harder. First I tried this:

```csharp
ICriteria crit = session.CreateCriteria(typeof(User))
    .CreateCriteria("Roles") // traverse into Roles
        .CreateCriteria("Sites") // traverse into Sites
            .Add(Expression.Eq("Id", siteId);
```

Note the absence of the _distinct_ keyword anywhere in the query. A nice Cartesian Product was the result due to the joins on the linking tables. Some googling showed that we can get distinct results with Criteria queries by applying the DistinctRootEntityResultTransformer via Criteria.SetResultTransformer() but that all happens in memory and not in the database query (call me old-fashioned, but I'd like my database results properly filtered :)).

Finally, I found the solution in using [subqueries](http://davybrion.com/blog/2008/10/querying-with-nhibernate/):

```csharp
ICriteria crit = session.CreateCriteria(typeof(User));
DetachedCriteria roleIdsForSite = DetachedCriteria.For(typeof (Role))
    .SetProjection(Projections.Property("Id"))
    .CreateCriteria("Sites", "site")
    .Add(Expression.Eq("site.Id", siteId.Value));
DetachedCriteria userIdsForRoles = DetachedCriteria.For(typeof(User))
    .SetProjection(Projections.Distinct(Projections.Property("Id")))
    .CreateCriteria("Roles")
        .Add(Subqueries.PropertyIn("Id", roleIdsForSite));
crit.Add(Subqueries.PropertyIn("Id", userIdsForRoles));
```

Yes, that's an insane amount of code to do something that simple, but it works and the generated SQL is highly efficient :). Notice the _distinct_ projection in the second DetachedCriteria (userIdsForRoles).

I'd really appreciate it if somebody has any suggestions for improvement.
