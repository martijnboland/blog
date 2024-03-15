---
title: "Hidden jewels in the Castle stack: Transaction Services"
date: "2008-12-03"
categories: 
  - "castle"
  - "cuyahoga"
tags: 
  - "castle"
  - "cuyahoga"
  - "transactions"
---

In [Cuyahoga](http://cuyahoga-project.org), we're using a lot of components from the [Castle](http://www.castleproject.org/) stack. Some of the most brilliant components are the [transaction services](http://www.jroller.com/hammett/entry/the_joys_of_castle_services) combined with the [automatic transaction facility](http://www.castleproject.org/container/facilities/trunk/atm/index.html).

With this post, I'm trying to bring some well-deserved attention to these undervalued components.

### The Context

Today, I was working on management of sites. In Cuyahoga 2.0, every site has its own set of content folders and templates. Now when creating a new site, we have to perform the following steps:

1. Save the new site object in the database;
2. Create a folder structure for the new site;
3. Copy the selected system template objects to the new site and save in the database;
4. Copy the template files that belong to the copied template objects to the templates folder of the site.

All steps have to be completed before we can start management of the new site, like adding pages and custom templates. Obviously, you'd like this series of steps to be completed  in a single transaction, so when something goes wrong somewhere, we don't end up with a broken site.

As you might have noticed, the transaction also includes file operations and we all have probably experienced situations where the database and the file system were out of sync because something went wrong, either in the database, or with the file system.

### Enter Castle Transactions

Castle Transaction Services makes it possible to run any arbitrary piece of code within the scope of a transaction. Components that are called in a transaction can support those transactions by requesting the current transaction via a transaction manager. This makes it very easy to write your own components that are transaction-aware.

### Transactional file operations: don't let the database and file system go out of sync

For file operations, we created a simple service that performs common file operations like writing new files, copying files and creating folders. When performing an operation, the service checks if there is a current transaction and if so, the actual operation is delegated to a class that performs the actual transactional operation. An excerpt of our transactional fileservice:

```csharp
public void CopyFile(string filePathToCopy, string directoryToCopyTo)
{
    ITransaction transaction = ObtainCurrentTransaction();
    if (transaction != null)
    {
        FileWriter fileWriter = new FileWriter(this._tempDir, transaction.Name);
        transaction.Enlist(fileWriter);
        fileWriter.CopyFile(filePathToCopy, directoryToCopyTo);
    }
    else
    {
        File.Copy(filePathToCopy, Path.Combine(directoryToCopyTo, Path.GetFileName(filePathToCopy)), true);
    }
}
```

In the example above, the FileWriter class performs the transactional file operations by implementing an IResource interface that has three methods: Start(), RollBack() and Commit(). The CopyFile() method copies the file to a temporary location. When the transaction manager commits the transaction, the Commit() method of the FileWriter is called and the file is copied from the temporary location to the actual location. RollBack() removes the temporary file.

The complete implementation of the file service can be found in Cuyahoga SVN at [https://cuyahoga.svn.sourceforge.net/svnroot/cuyahoga/trunk/Core/Service/Files](https://cuyahoga.svn.sourceforge.net/svnroot/cuyahoga/trunk/Core/Service/Files). Note that the implementation is very basic and there's much room for improvement but it already saved us lots of time when we didn't have to clean up the mess when something went wrong.

### Automatic transactions

One of the really great features of the Castle transaction services is that you just have to decorate your method with an attribute and everything is executed within the context of a transaction:

```csharp
[Transaction(TransactionMode.RequiresNew)]
```

```csharp
public virtual void CreateSite(Site site, string siteDataRoot, IList<Template> templatesToCopy, string systemTemplatesDirectory)
{
    // 1. Save new site object in the database.
    ..
    // 2. Create site directories.
    ..
    // 3. Copy template objects to new site and save in database.
    ..
    // 4. Copy template files to site templates directory.
    ...
}
```