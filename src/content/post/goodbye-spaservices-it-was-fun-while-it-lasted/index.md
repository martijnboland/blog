---
title: "Goodbye SpaServices, it was fun while it lasted"
date: "2019-10-11"
categories: 
  - "net-core"
  - "javascript"
  - "web-development"
tags: 
  - "asp-net-core"
  - "spaservices"
  - "webpack"
---

In August 2019, the [Microsoft ASP.NET Core team announced](https://github.com/aspnet/AspNetCore/issues/12890) that the [Microsoft.AspNetCore.SpaServices](https://www.nuget.org/packages/Microsoft.AspNetCore.SpaServices/) and [Microsoft.AspNetCore.NodeServices](https://www.nuget.org/packages/Microsoft.AspNetCore.NodeServices/) are obsoleted. Originally, these packages were used to integrate ASP.NET Core with frontend frameworks and libraries like Angular and React and were part of the Visual Studio SPA templates.

The introduction of the [Microsoft.AspNetCore.SpaServices.Extensions](https://www.nuget.org/packages/Microsoft.AspNetCore.SpaServices.Extensions/) package and the revisited SPA templates introduced a different way of integrating frontend frameworks by letting their CLI's do the heavy lifting. This package is still going to be supported.

### So, what's the problem then?

Besides integrating SPA frameworks, the SpaServices and NodeServices packages could be used for a lot of other tasks like integrating custom NodeJS libraries for charting or reporting and many people have been doing that according to the comments on the [GitHub issue that announced obsoleting NodeServices and SpaServices](https://github.com/aspnet/AspNetCore/issues/12890).

In my case, I have been heavily using the webpack middleware from SpaServices. It allows a very nice development workflow where you only have to build and run the ASP.NET Core project. Behind the scenes, the webpack middleware automatically builds the client-side code with the webpack configuration and even allows for hot-reloading of the client-side code. The webpack config is not tied to any SPA framework, library, CLI or whatever. I even use it to build older jQuery-based client code. All thanks to the webpack middleware that is going away with SpaServices.

_Note: SpaServices and NodeServices are still part of ASP.NET Core 3.0, so it will take quite a while before these packages are actually gone. Nobody is forbidding you to keep using these packages now, but they will go away with .NET 5._

### An alternative for the SpaServices webpack middleware:  
the [webpack development server](https://webpack.js.org/configuration/dev-server/) as a reverse proxy.

Historically, it has always been possible to use the webpack development server (NodeJS) for the frontend together with an ASP.NET Core backend for SPA applications, both running on different ports. However, this inherently introduces configuration complexity (CORS, authentication) and doesn't work for hybrid SPA/Server-Side applications.

If we want a serious alternative for the webpack middleware, it must be possible to run everything off a single server.

The solution is: [use the webpack development server as a reverse proxy](https://medium.com/@drgenejones/proxying-an-external-api-with-webpack-serve-code-and-a-restful-data-from-separate-endpoints-4da9b8daf430) for all requests that don't have anything to do with webpack bundles. This way, all traffic (pages, js, css, api calls) goes via a single host, the webpack development server.

For this to happen we have to install the webpack development server with

```
npm install webpack-dev-server --save-dev

```

and add a little bit extra configuration to the webpack configuration file (webpack.config.js):

```
module.exports = (env = {}, argv = {}) => {
  
  const isProd = argv.mode === 'production';

  const config = {
    // other...
  };

  if (! isProd) {
    // other...
    config.devServer = {
      index: '', // specify to enable root proxying
      contentBase: path.resolve(__dirname, '../wwwroot/dist'),
      proxy: {
        context: () => true, // proxy all requests
        target: 'https://localhost:5001', // to ASP.NET Core
        secure: false // don't verify the self-signed certificate
      },
      hot: true // enable hot reloading
    }
  }

  return config;
};
```

By default, the webpack development server uses port 8080. So instead of navigating directly to our ASP.NET Core application (in this case https://localhost:5001), we navigate to http://localhost:8080 to view our application while developing. When using Visual Studio, [http://localhost:8080](http://localhost:8080) can be set as launchUrl in /Properties/launchSettings.json, so(CTRL-)F5-ing opens the right url.

Apart from the proxy configuration, we have to make a few other changes to migrate from using the SpaServices webpack middleware to the webpack development server solution. You can find these changes in [a commit](https://github.com/martijnboland/LeanAspNetCore-React/commit/52c2fa0f00bc23a7507ee077d5fa88f0325b9686) in the sample project for my previous blog ([Lean ASP NET Core 2.1 – React forms, validation and Web API integration](https://blogs.taiga.nl/martijn/2018/08/13/lean-asp-net-core-2-1-react-forms-validation-and-web-api-integration/)). [This project](https://github.com/martijnboland/LeanAspNetCore-React) can also be used as an example for the webpack development server proxy solution.

### Are we happy again?

More or less, yes. Replacing the SpaServices webpack middleware with the webpack development server proxy solution allows us to maintain the same development workflow as before except from one thing: the initial onboarding experience.

In the past, we could just get the code from source control and start everything with ‘dotnet run’ or running the project in Visual Studio.  
Now, we have to manually start both the ASP.NET Core application _and_ go into the folder where the client app is located and start the webpack development server. For me personally this is not too big of a deal because I mostly use Visual Studio Code for client app development and conveniently use the terminal in VS Code to start and stop the webpack development server.
