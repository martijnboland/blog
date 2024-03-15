---
title: "Migrate Entity Framework migrations from automatic to code-based"
date: "2013-02-01"
categories: 
  - "net"
  - "or-mapping"
tags: 
  - "entity-framework"
  - "migrations"
---

Users of Entity Framework (EF) [migrations](http://msdn.microsoft.com/en-us/data/jj591621) must have noticed that there are two ways to perform migrations: [automatic](http://msdn.microsoft.com/en-US/data/jj554735) and code based.  
With automatic migrations, EF compares the code-first model to the latest version that is stored in the \_\_MigrationHistory system table in the database. After that, EF synchronizes the database with the code-first model and then stores a new model version in the \_\_MigrationHistory table.  
With code-based migrations, you have to explicitly specify all changes in code en EF doesn’t compare the models to detect changes.

In a project, we started using automatic migrations. Why automatic? Simply: it’s less work and at the time the drawbacks weren’t very clear. Unfortunately, after a year, we realized that this was the wrong choice. A new product version required changes that couldn’t simple be handled by automatic migrations without data loss. Time to move to code based migrations. This is easy with an existing database. Just create an initial migration with Add-Migration and the –IgnoreChanges flag and you have baseline. But this doesn’t work when you also a a requirement to create new databases from the migrations.

The solution is to script the database just before you’re moving to code-based migrations and execute this script in the Up() method of the initial migration. The key here is that this script has to check if database objects exist before creating them. This way it can also be used with existing databases.

Summary of migrations migration steps (SQL Server database):

1. Before the migration, ensure that the database(s) and code-first model are in sync;
2. Script the existing tables (in SQL Server Management Studio: Generate Scripts and then under Scripting Options –> Advanced, ensure that ‘Check for object existence’ is set to True). Add the script to your VS project that has the migrations. We need this later;
3. In \\Migrations\\Configuration.cs turn off Automatic Migrations:  
    
    ```
    internal sealed class Configuration : DbMigrationsConfiguration<PortalDbContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = false;
        }
    }
    
    ```
    
4. In the Package Manager Console enter ‘Add-Migration –IgnoreChanges’ and enter a name for the initial migration. This will create the baseline migration in the \\MIgrations directory.
5. Now the tricky bit: ensure that the script created in step 2 is executed in the Up() method of the initial migration. My Up() method looks like this:  
    
    ```
    public override void Up()
    {
        // Run script that creates the tables while preserving
        // existing tables and data
        // The script is stored as embedded resource in the assembly
        var currentAssembly = Assembly.GetExecutingAssembly();
        using (var createScriptStream = 
            currentAssembly.GetManifestResourceStream("MyProject.Migrations.Scripts.CreateTablesFromAutomaticMigrations.sql"))
        {
            if (createScriptStream != null)
            {
                var createScript = new StreamReader(createScriptStream).ReadToEnd();
                // Get separate commands from the script (SQL Server uses GO as separator)
                var regex = new Regex(@"\r{0,1}\nGO\r{0,1}\n");            
                var commands = regex.Split(script);
                foreach (var command in commands)
                {
                    if (! string.IsNullOrEmpty(command))
                    {
                        Sql(command);
                    }
                }
            }
        }
    }
    
    
    ```
    
      
    In the Up() method you can execute arbitrary SQL commands with the Sql() method. Note that in the example, the script is read from an embbeded resource, but it’s also perfectly fine to store the script as a file somewhere and create a stream from that.
6. Ready. Migrations are migrated.

Please leave a comment if you you know a better solution. I think this is still a little bit clumsy although it works for us.
