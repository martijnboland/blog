---
title: "Entity Framework 4.0: a fresh start (with demo application)"
date: "2009-11-22"
categories: 
  - "or-mapping"
tags: 
  - "aspnet-mvc"
  - "castle"
  - "entity-framework"
---

Edited 2009-11-26: removed EF4 Feature CTP from demo package and added some code examples.

So, Entity Framework 1.0 pretty much sucks](../one-year-after-the-entity-framework-vote-of-no-confidence/) (compared to alternatives), but I’m glad to see that things have improved a lot in version 4.0 (we’ll call that EF4 from now). To see how the improvements work out, I did a quick [spike that also gave me the opportunity to test some new ASP.NET MVC 2 features that I might blog about later.

### What’s in it?

- Entity Framework 4 with POCO entity objects and [code-only configuration](http://blogs.msdn.com/efdesign/archive/2009/10/12/code-only-further-enhancements.aspx) (no edmx);
- Data access abstracted via repository interfaces;
- ASP.NET 2 MVC for the UI;
- Validation with Data Annotations;
- Castle Windsor IoC container to wire the various components together;

### EF4 POCO

In EF4, it’s now possible to use entity classes that don’t have to inherit from EntityObject. This allows for better testability and separation of concerns. This is how an entity looks in the demo:

```
public class Course
{
    public virtual int Id { get; set; }

    [Required(ErrorMessage="Course title is required")]
    public virtual string Title { get; set; }

    [Required(ErrorMessage = "Price is required")]
    [DataType(DataType.Currency)]
    [Range(10.00, double.MaxValue, ErrorMessage="The minimum price is {1}")]
    public virtual decimal Price { get; set; }

    public virtual ISet<Schedule> Schedules { get; set; }

    public Course()
    {
        this.Schedules = new HashSet<Schedule>();
    }
}
```

Note that all properties are marked virtual. This allows EF4 to do some magic with run-time proxy generation to allow lazy loading and change notification.

Also note that we can now easily add validation attributes (in this case from Sytem.ComponentModel.DataAnnotations). We don’t have to use those [dreadful ‘buddy classes’](http://ayende.com/Blog/archive/2009/05/04/the-buddy-classes-are-drowning-dry.aspx) anymore to hold the meta-data.

### Code-only configuration

EF4 now allows model-first design from the VS 2010 designer, but it can still get awkward with a lot of entities. Fortunately, the [EF4 Feature CTP](http://www.microsoft.com/downloads/details.aspx?displaylang=en&FamilyID=13fdfce4-7f92-438f-8058-b5b4041d0f01) makes it possible [to do everything in code](http://blogs.msdn.com/efdesign/archive/2009/10/12/code-only-further-enhancements.aspx).

So you now just create your POCO entity and add a mapping class that replaces the edmx designer:

```
public class CourseMapping : EntityConfiguration<Course>
{
    public CourseMapping()
    {
        HasKey(c => c.Id);
        Property(c => c.Id).IsIdentity();
        MapSingleType(c => new
        {
            courseid = c.Id,
            title = c.Title,
            price = c.Price
        }).ToTable("course");
        Property(c => c.Price).HasStoreType("money").HasPrecision(19, 4);
    }
}
```

Looks remarkably similar to [Fluent NHibernate](http://wiki.fluentnhibernate.org/Main_Page), doesn’t it? ;)

I’m not sure if this is the most optimal way to define the mapping, but it works. In the demo, there is a class CoursesContextBuilder that wraps the ContextBuilder from the EF4 Feature CTP where the mappings are added. It also serves as a factory for new ObjectContext instances () :

```
public class CoursesContextBuilder
{
    private ContextBuilder<ObjectContext> _builder;
    private string _defaultConnectionString;

    public CoursesContextBuilder(string defaultConnectionString)
    {
        this._defaultConnectionString = defaultConnectionString;
        this._builder = new ContextBuilder<ObjectContext>();
        ConfigureMappings();
    }

    private void ConfigureMappings()
    {
        _builder.Configurations.Add(new TeacherMapping());
        _builder.Configurations.Add(new CourseMapping());
        _builder.Configurations.Add(new ScheduleMapping());
    }

    public ObjectContext GetContext()
    {
        return GetContext(_defaultConnectionString);
    }

    public ObjectContext GetContext(string connectionString)
    {
        var context = _builder.Create(GetConnection(connectionString));
        context.ContextOptions.LazyLoadingEnabled = true;
        return context;
    }

    private DbConnection GetConnection(string connectionString)
    {
        // Hardcoded to SqlConnection for this demo.
        return new SqlConnection(connectionString);
    }
}
```

That’s all we need to get EF4 working. In theory, we can now do everything with the POCO classes and the ObjectContext that comes from the CoursesContextBuilder, but of course if we would use it this way, we are directly tied to EF again and there goes away our testability.

### Repository implementation

To make sure our application code isn’t tied to EF directly, data access goes through Repository interfaces. In the demo app you can find a generic IRepository<T> interface that is implemented by an EfRepository<T> class. The EfRepository implementation uses the EF ObjectContext to perform queries and so on. Note that we added an extra IContextManager interface that the EfRepository depends on. The IContextManager is responsible for managing the lifetime of the ObjectContext that is obtained from the ContextBuilder. This way, the repository implementations don’t have to worry about creating and disposing ObjectContext instances. It’s just always always available.All specific Repository interfaces inherit from IRepository<T> and the specific implementations inherit from EfRepository<T>.

```
public interface ICourseRepository : IRepository<Course>
{
    void DeleteCourseWithSchedule(Course course);
    Ef4Poco.Domain.Course GetCourseWithSchedulesAndTeachers(int courseId);
    void RemoveScheduleFromCourse(Schedule schedule, Course course);
}
```

```
/// <summary>
/// Course-specific repository.
/// </summary>
public class CourseRepository : EfRepository<Course>, ICourseRepository
{
    public CourseRepository(IContextManager contextManager)
        : base(contextManager)
    { }

    public Course GetCourseWithSchedulesAndTeachers(int courseId)
    {
        // Wouldn't it be nice to have strong-typed includes?
        var query = from c in ObjectSet.Include("Schedules").Include("Schedules.Teacher")
                    where c.Id == courseId
                    select c;
        return query.Single();
    }

    public void RemoveScheduleFromCourse(Schedule schedule, Course course)
    {
        course.Schedules.Remove(schedule);
        CurrentObjectContext.DeleteObject(schedule);
        CurrentObjectContext.SaveChanges();
    }

    public void DeleteCourseWithSchedule(Course course)
    {
        // Howto configure cascade delete via code? This is a little cumbersome.
        var schedules = new List<Schedule>(course.Schedules);
        foreach (var schedule in schedules)
        {
            CurrentObjectContext.DeleteObject(schedule);
        }
        CurrentObjectContext.DeleteObject(course);
        CurrentObjectContext.SaveChanges();
    }
}
```

### Consuming the data access interfaces

Now we have our data access interfaces in place, it’s time for consuming. This is plain simple. Below is an example of how a controller in the ASP.NET MVC app in the demo uses the interfaces:

```
public class TeachersController : Controller
{
    private ITeacherRepository _teacherRepository;

    public TeachersController(ITeacherRepository teacherRepository)
    {
        _teacherRepository = teacherRepository;
    }

    public ActionResult Index()
    {
        var teachers = _teacherRepository.Find().OrderBy(t => t.Name);
        return View(teachers);
    }

    [...snip other methods]
}
```

### The demo app

You can download the demo to see what’s possible. It’s by no means a best practices example. Just a spike to test out various new technologies.

To run the demo, you’ll need Visual Studio 2010 Beta 2, [the latest EF4 Feature CTP](http://www.microsoft.com/downloads/details.aspx?displaylang=en&FamilyID=13fdfce4-7f92-438f-8058-b5b4041d0f01) and SQL Server (Express).

Both, the web and the test project have a connection string in the config file that defaults to the .\\SQLEXPRESS instance. Change that if you want to use a different instance. The database name doesn’t matter because a new database will be created the first time you run the application. Note that the reference to the EF4 feature CTP (Microsoft.Data.Entity.CTP.dll) points to C:\\Program Files (x86)\\Microsoft ADO.NET Entity Framework Feature CTP2\\Binaries. On 32 bit machines, you’ll probably have to change that to C:\\Program Files\\…

### Some observations

- Entity Framework 4.0 is much, much better than version 1.0, especially for a model-first approach;
- It’s not on par yet with [NHibernate](http://nhforge.org) feature-wise (for example, I really miss cascade settings). Given the choice, I’d still opt for NHibernate, but it’s not a bad product anymore and I'd prefer it over LINQ to SQL at this time.
