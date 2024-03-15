---
title: "Custom Model Binders and Request Validation"
date: "2011-09-29"
categories: 
  - "aspnet-mvc"
tags: 
  - "aspnet-mvc"
  - "security"
  - "validation"
---

In ASP.NET MVC you can create your own model binders to control the way that models are constructed from an HTTP request. For example, if you don’t want any whitespace characters in your model, you can create a custom model binder that trims all whitespace characters when constructing  a model object. You only have to implement the [IModelBinder](http://msdn.microsoft.com/en-us/library/system.web.mvc.imodelbinder.aspx) interface and its BindModel method in a class and register it during application startup.

### Getting the value from the HTTP request

There are many examples online of how to build a custom model binder. In all these examples you can find a common way of getting a value from the HTTP request:

```
public class MyModelBinder: IModelBinder
{
    public object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
    {
        var valueProviderResult = bindingContext.ValueProvider.GetValue(bindingContext.ModelName);
        if (valueProviderResult != null)
        {
            var theValue = valueProviderResult.AttemptedValue;
    
            // etc...
        }
    }
}
```

The code above works nicely and you get protection for potential dangerous request values out of the box. Now let’s assume that we _want_ some potential dangerous values like HTML or XML tags in our model. The recommended way is to add an \[AllowHtml\] attribute to the model property that may contain HTML and no validation happens for that property. Alternatively, it’s possible to add an \[ValidateInput(false)\] attribute to the controller action that accepts the model with HTML content, but this turns off validation for all model properties.

### A potentially dangerous Request.Form value was detected from the client

Wait a minute! Didn’t we just explicitly say to allow those dangerous values? What’s happening?

It appears that a call to bindingContext.ValueProvider.GetValue() in the code above _always_ validates the data, regardless any attributes. Digging into the ASP.NET MVC sources revealed that the DefaultModelBinder first checks  if request validation is required and then calls the bindingContext.UnvalidatedValueProvider.GetValue() method with a parameter that indicates if validation is required or not.

Unfortunately we can’t use any of the framework code because it’s sealed, private or whatever to protect ignorant devs from doing dangerous stuff, but  it’s not too difficult to create a working custom model binder that respects the AllowHtml and ValidateInput attributes:

```
public class MyModelBinder: IModelBinder
{
    public object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
    {
        // First check if request validation is required
        var shouldPerformRequestValidation = controllerContext.Controller.ValidateRequest && bindingContext.ModelMetadata.RequestValidationEnabled;
        
        // Get value
        var valueProviderResult = bindingContext.GetValueFromValueProvider(shouldPerformRequestValidation);
        if (valueProviderResult != null)
        {
            var theValue = valueProviderResult.AttemptedValue;
    
            // etc...
        }
    }
}
```

The other required piece is a way to retrieve an unvalidated value. In this example we use an extension method for the ModelBindingContext class:

```
public static ValueProviderResult GetValueFromValueProvider(this ModelBindingContext bindingContext, bool performRequestValidation)
{
    var unvalidatedValueProvider = bindingContext.ValueProvider as IUnvalidatedValueProvider;
    return (unvalidatedValueProvider != null)
               ? unvalidatedValueProvider.GetValue(bindingContext.ModelName, !performRequestValidation)
               : bindingContext.ValueProvider.GetValue(bindingContext.ModelName);
}
```
