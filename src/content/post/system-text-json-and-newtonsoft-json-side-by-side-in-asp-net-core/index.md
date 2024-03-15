---
title: "System.Text.Json and Newtonsoft.Json side-by-side in ASP.NET Core"
date: "2020-05-28"
categories: 
  - "net-core"
  - "web-development"
tags: 
  - "asp-net-core-json"
---

Since version 3.0, [ASP.NET Core](https://dotnet.microsoft.com/apps/aspnet) uses its own JSON serialization library [System.Text.Json](https://docs.microsoft.com/en-us/dotnet/api/system.text.json) instead of [Newtonsoft.Json](https://www.nuget.org/packages/Newtonsoft.Json). The reasons for this change are explained perfectly in [this blog post](https://devblogs.microsoft.com/dotnet/try-the-new-system-text-json-apis/) and generally, I think it’s working well in most cases.

However, there are situations where the transition from Newtonsoft.Json to System.Text.Json is not so straightforward. Think about having a lot of custom JsonConverters or a dependency on an external package that requires Newtonsoft.Json.  
For those cases, there is a simple solution: add the [Microsoft.AspNetCore.Mvc.NewtonsoftJson](https://www.nuget.org/packages/Microsoft.AspNetCore.Mvc.NewtonsoftJson/) NuGet package and call [AddNewtonsoftJson](https://docs.microsoft.com/en-us/aspnet/core/migration/22-to-30?view=aspnetcore-3.1&tabs=visual-studio#use-newtonsoftjson-in-an-aspnet-core-30-mvc-project) in the ConfigureServices method of the startup class.

```
[sourcecode language='csharp'  padlinenumbers='true']
services.AddControllers()
    .AddNewtonsoftJson();
[/sourcecode]

```

This will configure ASP.NET Core to use Newtonsoft.Json again for all its JSON handling just like before version 3.0.

### So it’s basically all or nothing?

Out of the box, yes. For example, there is no built-in way to make specific Controllers or Actions use a different JSON serializer than the globally configured one. This means that once you’ve configured the Newtonsoft.Json serializer, you won’t be able to benefit from the advantages that System.Text.Json has to offer. In my opinion, that’s very unfortunate. I don’t want to sacrifice modern features and performance improvements just because maybe a fraction of my application absolutely requires the ‘old’ way.

**What if we could configure which JSON serializer to use based on a controller or action? Just like you can apply action filter attributes to controllers, actions or via conventions?**

### Formatters and one attribute to rule them all

To (de)serialize objects that go in and out API controller actions ASP.NET Core uses the concept of Formatters. InputFormatters transform the body of an HTTP request (usually JSON or XML) to an object and OutputFormatters transform objects to data that goes into the HTTP response output stream (text, JSON, XML, etc.).

The AddNewtonsoftJson method that is mentioned above _globally_ replaces the default ASP.NET Core System.Text.Json formatters for JSON with specific implementations that use Newtonsoft.Json.

But we don’t want to set it globally. We want an ActionFilterAttribute  that replaces the System.Text.Json formatters with the Newtonsoft.Json formatters and use it on specific controllers or actions.

### An example: NewtonsoftJsonFormatterAttribute

As it turned out, replacing the **OutputFormatter** with an ActionFilterAttribute is very easy.

We still have to add the [Microsoft.AspNetCore.Mvc.NewtonsoftJson](https://www.nuget.org/packages/Microsoft.AspNetCore.Mvc.NewtonsoftJson/) NuGet package even though AddNewtonsoftJson is not called anymore because it contains the proper input and output formatter classes.

When the Result of an action is an ObjectResult (which happens when directly returning an object from a controller action or via the Ok() method) we can replace the formatter of the ObjectResult et voilà:

```
[sourcecode language='csharp' ]
public class NewtonsoftJsonFormatterAttribute : ActionFilterAttribute
{
   public override void OnActionExecuted(ActionExecutedContext context)
   {
       if (context.Result is ObjectResult objectResult)
       {
           var jsonOptions = context.HttpContext.RequestServices.GetService>();

            objectResult.Formatters.RemoveType();
            objectResult.Formatters.Add(new NewtonsoftJsonOutputFormatter(
                jsonOptions.Value.SerializerSettings,
                context.HttpContext.RequestServices.GetRequiredService>(),
                context.HttpContext.RequestServices.GetRequiredService>().Value));
        }
        else
        {
             base.OnActionExecuted(context);
        }
    }
}
[/sourcecode]

```

When we add this NewtonsoftJsonFormatterAttribute to a controller or action, that specific controller or action will use Newtonsoft.Json to serialize JSON:

```
[sourcecode language='csharp' ]
[HttpGet]
[NewtonsoftJsonFormatter]
public IActionResult Get()
{
	return Ok(new { text = "Hello" });
}
[/sourcecode]

```

Replacing the **InputFormatter** however turned out to be not so easy. In earlier versions of ASP.NET Core it was possible to replace the InputFormatter with an ActionFilterAttribute by implementing the IResourceFilter interface, but in recent versions this is not possible anymore. It seems it’s simply impossible to directly change InputFormatters from an ActionFilterAttribute. Please leave a comment if I’m wrong here.

In my quest for how to replace the InputFormatter however, I stumbled upon [a great post from Shannon Deminick](https://shazwazza.com/post/custom-body-model-binding-per-controller-in-asp-net-core/) that shows a neat trick how you can configure model binding on a per-controller basis. With an [application model convention](https://docs.microsoft.com/en-us/aspnet/core/mvc/controllers/application-model?view=aspnetcore-3.1#conventions), it’s possible to override model binders with your own implementations and here lies the key to success. Shannon’s post contains an example model binder that simply inherits BodyModelBinder (the model binder that binds the contents of an HTTP request body to an object) but allows to configure specific InputFormatters.

When an ActionFilterAttribute implements IControllerModelConvention or IActionModelConvention, these conventions are automagically applied by ASP.NET Core, so all we have to do is to implement these interfaces in our NewtonsoftJsonFormatterAttribute and hook up a custom model binder that uses NewtonsoftJsonInputFormatter and we’re good to go:

```
[sourcecode language='csharp' ]
public class NewtonsoftJsonFormatterAttribute : ActionFilterAttribute, IControllerModelConvention, IActionModelConvention
{
    public void Apply(ControllerModel controller)
    {
        foreach (var action in controller.Actions)
        {
            Apply(action);
        }
    }

    public void Apply(ActionModel action)
    {
        // Set the model binder to NewtonsoftJsonBodyModelBinder for parameters that are bound to the request body.
        var parameters = action.Parameters.Where(p => p.BindingInfo?.BindingSource == BindingSource.Body);
        foreach (var p in parameters)
        {
            p.BindingInfo.BinderType = typeof(NewtonsoftJsonBodyModelBinder);
        }
    }

    public override void OnActionExecuted(ActionExecutedContext context)
    {
        if (context.Result is ObjectResult objectResult)
        {
            var jsonOptions = context.HttpContext.RequestServices.GetService>();

            objectResult.Formatters.RemoveType();
            objectResult.Formatters.Add(new NewtonsoftJsonOutputFormatter(
                jsonOptions.Value.SerializerSettings,
                context.HttpContext.RequestServices.GetRequiredService>(),
                context.HttpContext.RequestServices.GetRequiredService>().Value));
        }
        else
        {
            base.OnActionExecuted(context);
        }
    }
}

public class NewtonsoftJsonBodyModelBinder : BodyModelBinder
{
    public NewtonsoftJsonBodyModelBinder(
        ILoggerFactory loggerFactory,
        ArrayPool charPool,
        IHttpRequestStreamReaderFactory readerFactory,
        ObjectPoolProvider objectPoolProvider,
        IOptions mvcOptions,
        IOptions jsonOptions)
        : base(GetInputFormatters(loggerFactory, charPool, objectPoolProvider, mvcOptions, jsonOptions), readerFactory)
    {
    }

    private static IInputFormatter[] GetInputFormatters(
        ILoggerFactory loggerFactory,
        ArrayPool charPool,
        ObjectPoolProvider objectPoolProvider,
        IOptions mvcOptions,
        IOptions jsonOptions)
    {
        var jsonOptionsValue = jsonOptions.Value;
        return new IInputFormatter[]
        {
            new NewtonsoftJsonInputFormatter(
                loggerFactory.CreateLogger(),
                jsonOptionsValue.SerializerSettings,
                charPool,
                objectPoolProvider,
                mvcOptions.Value,
                jsonOptionsValue)
        };
    }
}
[/sourcecode]

```

With the code above, all we have to do is to add a \[NewtonsoftJsonFormatter\] attribute to a controller or a method and that will then use Newtonsoft.Json instead of System.Text.Json for both input and output formatting.

Note that the custom NewtonsoftJsonBodyModelBinder class has quite a few dependencies in its constructor, but everything is properly injected by the DI container. No extra DI registrations where required in an empty ASP.NET Core webapi project (dotnet new webapi).

It’s still possible to configure Newtonsoft.Json via ConfigureServices:

```
[sourcecode language='csharp' ]
services.Configure(o =>
{
    o.SerializerSettings.ContractResolver = new DefaultContractResolver
    {
        NamingStrategy = new CamelCaseNamingStrategy()
    };
    o.SerializerSettings.Converters = new List { new StringEnumConverter() };

});
[/sourcecode]

```

### Bonus: register the attribute with a convention

It’s possible to apply ActionFilterAttributes such as our NewtonsoftJsonFormatterAttribute to many controllers and/or actions at once with [application model conventions](https://docs.microsoft.com/en-us/aspnet/core/mvc/controllers/application-model?view=aspnetcore-3.1#conventions). In one of the projects I’m working on, we’re using System.Text.Json but also a bunch of shared controllers from a shared assembly that require Newtonsoft.Json (registered as application part).  A single convention makes this possible:

```
[sourcecode language='csharp' ]
public class MyNewtonsoftJsonConvention : IControllerModelConvention
{
    private readonly Assembly _sharedAssembly;

    public MyNewtonsoftJsonConvention(Assembly sharedAssembly)
    {
        _sharedAssembly= sharedAssembly;
    }

    public void Apply(ControllerModel controller)
    {
        if (ShouldApplyConvention(controller))
        {
            var formatterAttribute = new NewtonsoftJsonFormatterAttribute();

            // The attribute itself also implements IControllerModelConvention so we have to call that one as well.
            // This way, the NewtonsoftJsonBodyModelBinder will be properly connected to the controller actions.
            formatterAttribute.Apply(controller);
            
            controller.Filters.Add(formatterAttribute);
        }
    }

    private bool ShouldApplyConvention(ControllerModel controller)
    {
        return controller.ControllerType.Assembly == _sharedAssembly &&
            !controller.Attributes.Any(x => x.GetType() == typeof(NewtonsoftJsonFormatterAttribute));
    }
}
[/sourcecode]

```

One caveat: when applying attributes via a convention and these attributes implement application model conventions themselves, these conventions are not automatically configured by ASP.NET Core anymore so we have to apply these ourselves explicitly.
