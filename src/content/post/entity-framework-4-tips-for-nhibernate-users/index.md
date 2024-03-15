---
title: "Entity Framework 4 tips for NHibernate users"
date: "2011-12-15"
categories: 
  - "or-mapping"
tags: 
  - "entity-framework"
  - "nhibernate"
---

The last few weeks, I have worked on a project that uses [Entity Framework 4 Code First](http://msdn.microsoft.com/en-us/data/aa937723) (let’s call it EF from now). Normally, I use [NHibernate](http://nhforge.org/) for my OR-mapping needs and although EF works almost the same conceptually, there are differences. This post is about some of the issues that an NHibernate user can expect when working with EF.

### Many to one associations and introduce a foreign key property

Let’s say it bluntly: EF supports [Foreign Key associations](http://blogs.msdn.com/b/efdesign/archive/2009/03/16/foreign-keys-in-the-entity-framework.aspx)  (foreign key id’s in your entities, besides many to one associations)  and you better use them, or you’ll experience a lot of pain. I started to model my entities with ‘proper’ object references but ran into 2 problems:

- Filtering in collection properties causes select n+1 issues. So forget:  
    
    ```csharp
    Order.OrderLines.Where(ol => ol.Product.Id == productId)
    ```
    
    but do:
    
      
    
    ```csharp
    Order.OrderLines.Where(ol => ol.ProductId == productId)
    ```
    
    to filter a collection property because the first will load all product instances;

- When you override Equals() and GetHashCode()in your entities to use only the ID for object equality, you can assign an empty object with only the ID set as reference property in NHibernate but EF doesn’t fall for this trick. This is can be very useful, for example when setting references from a dropdownlist where you only have an ID of the referenced object.

It seems that EF just doesn’t leverage proxies like NHibernate does so it needs to have the actual object instance to do things instead of just the proxy.  
The good thing however is that when you’re having both a foreign key ID property and an object reference in EF, these are synced automatically and only one column will be generated in the database and the only real issue is a little pollution of your entity.

### Object reference not set to an instance of an object

So you’ve created a nice object graph and saved it in the database. Then after fetching the object graph back, some of the referenced objects are null even when the ID’s of the references are nicely sitting there in the database. WTF???  
Well, EF doesn’t automatically load a referenced object unless it’s marked as virtual (lazy) or loaded explicitly via Include(). If you forget both, you’ll end up with the NullReferenceExceptions.

### No Dictionary collection mapping

This is something not many people complain about, but I really miss the option to map dictionaries like Map in NHibernate. Also, NHibernate’s List mappings are not supported.

### Cascade is a big black box

EF doesn’t have a way to specify how changes in your entity are cascaded into related entities. I’m not sure if this is a good or a bad thing. On one hand I miss having control over this, but on the other hand EF seemed to do well without setting anything.  
Out of the box, EF code first generates CASCADE  DELETE database constraints on required associations but when your model gets only a little bit complex, you’ll get errors like “Introducing FOREIGN KEY constraint on table may cause cycles or multiple cascade paths”. Fortunately, you can turn this off in your DbContext:

```csharp
protected override void OnModelCreating(DbModelBuilder modelBuilder)
{
    // Remove cascade delete convention because it causes trouble when generating the DB.
    modelBuilder.Conventions.Remove<OneToManyCascadeDeleteConvention>();

    base.OnModelCreating(modelBuilder);
}
```

### Explicitly set state when attaching objects to the DbContext

In NHibernate you can simply update an object that isn’t associated with a Session via Session.Update(). EF can do the same via Attach() but you must not forget to explicitly set the object state to modified, otherwise no updates occur:

```csharp
dbContext.Customers.Attach(customer);
dbContext.Entry(customer).State = EntityState.Modified;
dbContext.SaveChanges();
```

### More?

Please leave a comment if you want to share your own experiences.
