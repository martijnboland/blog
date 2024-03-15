---
title: "Loosely coupled events in .NET (and harvesting Open Source projects)"
date: "2011-07-28"
categories: 
  - "net"
tags: 
  - "net"
  - "events"
  - "ioc"
---

This post is about how Open Source projects can be very beneficial in creating the best solution for your own development challenges.

A little while ago, I needed something to handle events in a loosely coupled manner due to a plugin-like architecture. Since I’m not the first person on earth who needs this, I went out looking for what’s available in .NET land and ended up with the [EventAggregator from Caliburn Micro](http://devlicio.us/blogs/rob_eisenberg/archive/2011/05/30/caliburn-micro-soup-to-nuts-part-8-the-eventaggregator.aspx):

### 1\. [Caliburn Micro](http://caliburnmicro.codeplex.com/) (EventAggregator)

The nicest thing is that it allows subscribers to handle multiple events by just implementing an interface:

```csharp
public interface IHandle<TMessage> : IHandle 
{  
    void Handle(TMessage message);  
}  

public class MySubscriber : IHandle<SomeMessage>, IHandle<OtherMessage>
{  
    public void Handle(SomeMessage message){  
        // do something with the message  
    }

    public void Handle(OtherMessage message){  
        // do something with the other message  
    }  
}
```

Note that you can use ANY object as message. I like that!

Unfortunately, the application I’m working on is an ASP.NET MVC web application where the EventAggregator is more suitable for stateful environments like Silverlight or WPF. For example, I had to make the EventAggregator a Singleton to make sure that subscribers with different lifestyles (per web request, singleton, ASP.NET provider) could be called properly. Another issue was that I couldn’t find a nice way to instantiate all subscribers in the application.

### 2\. [FunnelWeb](http://www.funnelweblog.com/) (EventPublisher)

While browsing the [Funnelweb](http://www.funnelweblog.com/) source code, I stumbled upon an interesting [EventPublisher](https://bitbucket.org/FunnelWeb/release/src/c2b5b210ac2a/src/FunnelWeb/Eventing/INotifier.cs) class, [the EventAggregator of Funnelweb](http://www.funnelweblog.com/extensibility-and-events). This class takes a constructor dependency on a list of objects that implement IEventListener. So no subscribing here. The advantage of this is that an IoC container can take care of all subscriber creation and you don’t have to worry anymore if all subscribers are instantiated and are subscribed. When an event is published, the EventPublisher just goes through the list of IEventListener subscribers and calls their Handle() method. A small drawback is that the subscribers have to find out if they can handle the published event themselves. All events are published to all subscribers whatever type of event.

### 3\. Mix and Match and add a little sauce

I really like the approach that is  taken in Funnelweb so I’ve taken that as the base for my solution and added the parameterized event listeners of Caliburn Micro.

The event listener interface:

```csharp
/// <summary>
/// Event listener marker interface (for IoC convenience).
/// </summary>
public interface IEventListener
{}

/// <summary>
/// Event listener interface that is parameterized with the type of the payload (event data)
/// </summary>
/// <typeparam name="TPayload">The type of the event data</typeparam>
public interface IEventListener<in TPayload> : IEventListener where TPayload: class 
{
    /// <summary>
    /// Handle the published event with the given payload as event data.
    /// </summary>
    /// <param name="payload">The event data</param>
    void Handle(TPayload payload);
}
```

An event listener implementation:

```csharp
public class MyEventListenerClass: IEventListener<Foo>, IEventListener<Bar>
{
    // Snip initialization and other code.

    public void Handle(FooEvent payload)
    {
        // Do things with Foo event data
    }

    public void Handle(BarEvent payload)
    {
        // Do things with Bar event data
    }
}
```

The event publisher interface:

```csharp
/// <summary>
/// Publishes events to listeners.
/// </summary>
public interface IEventPublisher
{
    /// <summary>
    /// Publish an event with the given payload. This can be a specifically designed
    /// event class, but this is not required. We just don't allow primitives.
    /// </summary>
    /// <typeparam name="TPayload">The type of the event data</typeparam>
    /// <param name="payload">The event data</param>
    void Publish<TPayload>(TPayload payload) where TPayload : class;
}
```

The event publisher implementation:

```csharp
public class EventPublisher : IEventPublisher
{
    private readonly IEnumerable<EventListener> _listeners;

    public EventPublisher(IEnumerable<IEventListener> listeners)
    {
        _listeners = listeners;
    }

    public void Publish<TPayload>(TPayload payload) where TPayload : class
    {
        var handlersForPayload = _listeners.OfType<IEventListener<TPayload>>();
        foreach (var handler in handlersForPayload)
        {
            handler.Handle(payload);
        }
    }
}
```

By creating a generic Publish<TPayload> method we are able to publish the event only to listeners that implement IEventListener<TPayload> .

### 4\. Use it!

To be honest, you pretty much need an IoC container to use the full power of this EventPublisher, and to be more specific: an IoC container that can inject the IEnumerable<EventListener> parameter in the constructor of the EventPublisher, but I think most modern IoC containers can do that (Castle Windsor, Autofac, StructureMap). In the example below, we’re using [Autofac](http://code.google.com/p/autofac/).

Let’s say we have an application service IMyService and a plugin IPlugin, implemented by MyService and MyPlugin. MyService publishes an event with the type of MyEvent and MyPlugin handles that event. IMyService is being used in an ASP.NET MVC controller.

Event, Service and Plugin:

```csharp
public class MyEvent
{
    public string Message { get; set; }
}

public interface IMyService
{
    void DoSomething();
}

pubic class MyService : IMyService
{
    private IEventPublisher _eventPublisher;

    public MyService(IEventPublisher eventPublisher)
    {
        _eventPublisher = eventPublisher;
    }

    public void DoSomething()
    {
        // Do things
        ...

        // Notify with MyEvent as event data
        _eventPublisher.Publish(new MyEvent { Message = "Something is done" });
    }
}

public interface IPlugin
{
    ...
}

public class MyPlugin : IPlugin, IEventListener<MyEvent>
{
    public void Handle(MyEvent myEvent)
    {
        var publisherMessage = myEvent.Message;
        // Do things with the event data.
        ...
    }
}
```

Wire things together in the IoC container (Autofac):

```csharp
var builder = new ContainerBuilder();

// IEventPublisher
builder.RegisterType<EventPublisher>().As<IEventPublisher>().InstancePerLifetimeScope();

// Services. Name has to end with "Service" by convention.
builder.RegisterAssemblyTypes(Assembly.GetExecutingAssembly())
    .Where(t => t.Name.EndsWith("Service"))
    .AsImplementedInterfaces()
    .InstancePerLifetimeScope();

// Plugins. Name has to end with "Plugin" by convention.
foreach (var assembly in pluginAssemblies)
{
    builder.RegisterAssemblyTypes(pluginAssemblies)
        .Where(t => t.Name.EndsWith("Plugin"))
        .AsImplementedInterfaces()
        .SingleInstance();
}

var container = builder.Build();DependencyResolver.SetResolver(new AutofacDependencyResolver(container));
```

Note that the plugins (our IEventListener) can have a different lifestyle (Singleton) than the IEventPublisher (Instance per HTTP request). This should be fine as long as the IEventListeners live longer or have the same lifestyle  as the IEventPublisher.

Finally the ASP.NET MVC controller:

```csharp
public class MyController : Controller
{
    private IMyService _myService;

    public MyController(IMyService myService)
    {
        _myService = myService;
    }

    public ActionResult DoSomething()
    {
        // This call will automagically call MyPlugin.Handle
        _myService.DoSomething();
        return View();
    }
}
```

That’s it! Thank you both Caliburn Micro and Funnelweb! I’m pretty happy with this solution and use it for multiple scenario’s:

- Plugins that need to respond on events of the core system;

- Separation of concerns in Application Services: I often have an Application Service that needs to do a little more than it was originally designed for, for example post-processing of an order. Now I only need to publish an event with the order as data and the appropriate application services pick it up and perform the post-processing;

- Dirty things with custom ASP.NET providers. Just implement one or more IEventListener<T> interfaces and register the provider _instance_ in the IoC container with the interfaces it implements.

Just one thing that worries me a little is the dependency of the EventPublisher to _all_ classes that implement IEventListener<T> . These can potentially grow into a huge list and I don’t know what overhead that creates. I already experimented with a IEnumerable<Lazy<IEventListener>> parameter in the constructor of the EventPublisher so object creation is delayed until the moment we actually publish something and that seems to work fine with Autofac.
