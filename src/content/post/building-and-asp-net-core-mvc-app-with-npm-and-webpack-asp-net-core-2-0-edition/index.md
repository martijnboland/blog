---
title: "Building the minimal ASP.NET Core MVC app with NPM and webpack - the 2.0 edition"
date: "2017-11-24"
categories: 
  - "net-core"
  - "aspnet-mvc"
tags: 
  - "asp-net-core"
  - "npm"
  - "webpack"
---

![image](./images/image_thumb.png "image")

_Update: ASP.NET Core 2.1 and webpack 4 are released. I've written a new post, [Lean ASP.NET Core 2.1 - manually setup a Razor Pages project with Bootstrap, NPM and webpack](../lean-asp-net-core-2-1-manually-setup-a-razor-pages-project-with-bootstrap-npm-and-webpack/)._

A while ago I wrote about [building an ASP.NET Core MVC app with NPM and webpack](https://blogs.taiga.nl/martijn/?p=1703).  Since then, [ASP.NET Core 2.0 was released](https://blogs.msdn.microsoft.com/webdev/2017/08/14/announcing-asp-net-core-2-0/). Compared with ASP.NET Core 1.x, things have become easier, especially configuration. Quite a few settings that had to be added manually before are now the default. This post is an update of the [previous post](https://blogs.taiga.nl/martijn/?p=1703) that is compatible with ASP.NET Core 2.0.

Contents:

- [Step 1: Add configuration files and configure ASP.NET](#step1)
- [Step 2: Add controller, views and a layout](#step2)
- [Step 3: Add client-side libs from NPM](#step3)
- [Step 4: Bundle with webpack](#step4)
- [Step 5: Publish](#step5)

A little bit of knowledge of ASP.NET MVC and Visual Studio is assumed. If you already know how to create an ASP.NET Core MVC app from scratch or if you’re mainly interested in the NPM/webpack thing you might skip the first paragraphs and jump right to step 3.

The source code of the project is at [https://github.com/martijnboland/MinimalAspNetCore](https://github.com/martijnboland/MinimalAspNetCore "https://github.com/martijnboland/MinimalAspNetCore").

### Starting from scratch

**The goal of this exercise is to start with the empty ASP.NET Core template and add just enough to have a basic ASP.NET Core MVC app with a home page that is styled with [Bootstrap](http://getbootstrap.com/) and can be deployed to production environments.**

Let’s start with the empty template:

![image_thumb[2]](./images/image_thumb2_thumb.png "image_thumb[2]")

resulting in the following project:

![image](./images/image_thumb_4.png "image")

### Step 1: Add configuration files and configure ASP.NET

We’ll add the files appsettings.json and appsettings.Development.json to the root of the project. These files contain our logging configuration, together with other configuration options. See [https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration "https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration") for an overview of ASP.NET Core configuration and [https://docs.microsoft.com/en-us/aspnet/core/fundamentals/logging](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/logging "https://docs.microsoft.com/en-us/aspnet/core/fundamentals/logging") for ASP.NET Core logging. The file Startup.cs is the place where everything is wired together:

```
public class Startup
{
    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddMvc();
    }

    public void Configure(IApplicationBuilder app, IHostingEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }
        app.UseStaticFiles();
        app.UseMvcWithDefaultRoute();
    }
}

```

At this point we have our base infrastructure in place for ASP.NET Core MVC pages. However, running the application, now results in a 404 not found error. What we need are a controller, some views and a layout.

_As it turns out, this looks remarkably similar to the ASP.NET Core Web API template. An nice alternative is to take the Web API template as the starting point, and add app.UseStaticFiles() to Startup.cs._

### Step 2: Add controller, views and a layout

![image](./images/image_thumb_7.png "image") for an introduction:

- Create folder ‘Controllers’ and add a file HomeController.cs with actions Index() and Error()
- Create folder ‘Views’ and add \_ViewStart.cshtml (Add New Item –> MVC View Start Page) and \_ViewImports.cshtml (Add New Item –> MVC View Imports Page)
- In the Views folder create the folders ‘Home’ and ‘Shared’
- Add ‘Index.cshtml’ to the ‘Views/Home’ folder and \_Layout.cshtml and Error.cshtml to the ‘Views/Shared’ folder

The layout page (\_Layout.cshtml) already has some bootstrap-specific markup:

```
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@ViewData["Title"]</title>
</head>
<body>
<nav class="navbar navbar-inverse navbar-fixed-top">
    <div class="container">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a asp-area="" asp-controller="Home" asp-action="Index" class="navbar-brand">MinimalAspNetCore</a>
        </div>
        <div class="navbar-collapse collapse">
            <ul class="nav navbar-nav">
                <li><a asp-area="" asp-controller="Home" asp-action="Index">Home</a></li>
            </ul>
        </div>
    </div>
</nav>
<div class="container body-content">
    @RenderBody()
</div>
</body>
</html>

```

This results in a working page without styles:

![image](./images/image_thumb_8.png "image")

To make this page a bit prettier, we’re adding [Bootstrap](http://getbootstrap.com/) (and [jQuery](https://jquery.com/) because the Bootstrap JavaScript plugins depend on jQuery).

### Step 3: Add client-side libs from NPM

Bootstrap and jQuery are installed from the NPM repository. NPM is the package manager of Node.js. We have to make sure that a reasonably recent version of [Node.js](https://nodejs.org) (version 6 or higher will do) is installed on our system and that it is on our path so we can run the node and npm commands from a console:

![image](./images/image_thumb_9.png "image")

NPM requires a package.json file in the root of the project, so we’re adding that (Add New Item –> npm Configuration file, or from the command line in the root folder with ‘npm init’). After that, we’ll install our client libs with the following command (from the application root folder):

```
npm install –save jquery bootstrap
```

The libraries are installed, but how can we use these? The files are installed in the ‘node\_modules’ folder, but we cannot simply reference those in our layout page, because scripts and css files need to be in the ‘wwwroot’ folder. What we need is a tool that bundles all required client-side scripts and styles and copies the bundle to the ‘wwwroot’ folder.

### Step 4: Bundle with webpack

[Webpack](https://webpack.js.org) is becoming the standard for bundling and minification of client-side scripts, but it can do much, much more. Many people complain that setting up webpack is complex, but I honestly think that it is not. Let’s continue with our project.

For simplicity we’re going to create a single bundle that contains both our scripts and also our css styles. This way we only have to reference a single file in our layout page. The following code goes into the \_Layout.cshtml file just before the </body> tag (in Staging and Production environments, a version is added for cache busting):

```
<environment names="Development">
    <script src="~/dist/main.js"></script>
</environment>
<environment names="Staging,Production">
    <script src="~/dist/main.js" asp-append-version="true"></script>
</environment>
```

Thus our goal becomes to create a single bundle ‘main.js’ that goes into the ‘wwwroot/dist’ folder.

Add webpack and some loaders to our project:

```
npm install --save-dev webpack style-loader css-loader url-loader file-loader
```

After that we can add the [webpack configuration file](https://webpack.js.org/configuration/) to the root of our project (webpack.config.js):

```
var path = require('path');
var webpack = require('webpack');

module.exports = function (env) {

  env = env || {};
  var isProd = env.NODE_ENV === 'production';

  // Setup base config for all environments
  var config = {
    entry: {
      main: './Client/js/main'
    },
    output: {
      path: path.join(__dirname, 'wwwroot/dist'),
      filename: '[name].js'
    },
    devtool: 'eval-source-map',
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    plugins: [
      new webpack.ProvidePlugin({ $: 'jquery', jQuery: 'jquery' })
    ],
    module: {
      rules: [
        { test: /\.css?$/, use: ['style-loader', 'css-loader'] },
        { test: /\.(png|jpg|jpeg|gif|svg)$/, use: 'url-loader?limit=25000' },
        { test: /\.(png|woff|woff2|eot|ttf|svg)(\?|$)/, use: 'url-loader?limit=100000' }
      ]
    }
  }

  // Alter config for prod environment
  if (isProd) {
    config.devtool = 'source-map';
    config.plugins = config.plugins.concat([
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true
      })
    ]);
  }

  return config;
};

```

The essential parts in the webpack configuration are the ‘entry’ and the ‘output’ fields. We’re basically saying: ‘analyze the entry file (‘Client/js/main’), resolve all references from there, put everything together in a single file and write that to the ‘wwwroot/dist’ folder with the name of the entry as file name (‘main.js’).

For the other config options, please check the [webpack configuration reference](https://webpack.js.org/configuration/) and the [loaders documentation](https://webpack.js.org/loaders/) to see what those are all about. It goes beyond the scope of this post to explain that all in detail.

![image](./images/image_thumb_10.png "image"). The file ‘Client/js/main.js’ contains:

```
import '../css/site.css';
import 'bootstrap/dist/css/bootstrap.css'
import 'jquery';
import 'bootstrap';
```

There is no code in this file apart from some ES6-style imports. However, exactly these imports are used by webpack to determine what goes into the bundle. Also notice that our css file and the bootstrap css file are imported just as if they were JavaScript files.

Now we can create the bundle, but how do we instruct webpack to do that? The easiest way to do it is by adding commands to the scripts section of the NPM package.json file:

```
"scripts": {
  "start": "webpack --config webpack.config.js --watch --progress --profile",
  "build": "webpack --config webpack.config.js --progress --profile",
  "prod": "webpack --env.NODE_ENV=production --config webpack.config.js --progress"
}

```

To create a development bundle enter:

```
npm run build
```

To create a minified production bundle:

```
npm run prod
```

During development, it’s convenient that bundles are updated when something changes. This can be accomplished with:

```
npm start
```

After having created the bundle with one of the above commands we see this when we run the application:

![image](./images/image_thumb_11.png "image")

Looks like Bootstrap doesn’t it? :)

_Note: you can fully integrate the NPM commands in your Visual Studio workflow with the Task Runner Explorer and the [NPM task runner extension](https://marketplace.visualstudio.com/items?itemName=MadsKristensen.NPMTaskRunner)._

### Step 5: Publish

So there we have it. An ASP.NET Core MVC web application with NPM and webpack. Finally, we need something that creates our production bundle during publish. This can simply be done by just adding a few lines to the .csproj file:

```
<Target Name="BuildClientAssets" AfterTargets="ComputeFilesToPublish">
  <Exec Command="npm install" />
  <Exec Command="npm run prod" />

  <!-- Include the newly-built files in the publish output -->
  <ItemGroup>
    <DistFiles Include="wwwroot\dist\**" />
    <ResolvedFileToPublish Include="@(DistFiles->'%(FullPath)')" Exclude="@(ResolvedFileToPublish)">
      <RelativePath>%(DistFiles.Identity)</RelativePath>
      <CopyToPublishDirectory>PreserveNewest</CopyToPublishDirectory>
    </ResolvedFileToPublish>
  </ItemGroup>

</Target>

```

After having published the production bundle is in the wwwroot/dist/ folder of the published web app.

### And now?

Like this title already says: this is the minimal app. The source code is at [https://github.com/martijnboland/MinimalAspNetCore](https://github.com/martijnboland/MinimalAspNetCore "https://github.com/martijnboland/MinimalAspNetCore"). There is some room for improvement. The first thing to do is to extract the css from the production bundle and move that to its own file to prevent the flicker when loading the app. Also, when the app grows it’s probably wise to extract the shared vendor libraries into its own bundle. But this is probably something for a follow-up post.
