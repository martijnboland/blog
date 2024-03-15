---
title: "JavaScript for .NET developers - September 2016 edition"
date: "2016-09-22"
categories: 
  - "net"
  - "javascript"
  - "web-development"
tags: 
  - "net"
  - "javascript"
---

[![imgres](./images/imgres_thumb.png "imgres")](https://en.wikipedia.org/wiki/JavaScript)[![newdotnetlogo_2](./images/newdotnetlogo_2_thumb.png "newdotnetlogo_2")](https://www.microsoft.com/net)

For .NET developers coming from the safe environment of Visual Studio and C#, the wild west that is the current JavaScript landscape can be very intimidating and confusing. Hopefully, this post will provide a little bit of guidance for your journey into this wild west.

Disclaimer: this post reflects my personal experiences from the last 1.5 years since the [previous post](../javascript-for-net-developers-march-2015-edition/) I wrote about this subject might and be a bit subjective. Feel free to comment!

_**tl;dr**_

_In 2016, Angular and React are the main frameworks. Don’t try migrating from Angular 1 to Angular 2. Consider Aurelia instead of Angular 2 because of simplicity and common sense.  
Substantial JavaScript apps are mostly written with ES2015/2016 or TypeScript. A compile step is required to be able to run these apps in all browsers. Whether you should use one language over the other is a matter of personal preference.  
Gulp and Grunt are still much used for building and packaging apps, but webpack is starting to take over. For package management, NPM has become the standard. Don’t use Bower (or NuGet).  
Visual Studio Code has become a very serious alternative for the full Visual Studio. It’s fast and support for either ES2015/2016 or TypeScript is superb._

## Frameworks

“Which JavaScript framework should we pick for the coming years?” I get this question a lot and the only sane advice I can give is to not put all your money on one single horse if possible. The future is still uncertain.

Todays main players are [Angular](https://angularjs.org/) and [React](https://facebook.github.io/react/) (with their ecosystems) and these will probably not go away in the coming years. You could just say: pick Angular if you favor two-way databinding and an Object-Oriented approach with enterprise-feel (similar to server-side .NET and JAVA). Choose React with some add-on libraries if you prefer a one-way data-flow and a more functional and light-weight approach. Unfortunately, the release of [Angular 2](https://angular.io/) has made things a bit more complex.

**Angular**

Before Angular 2 was announced two years ago, Angular 1 was getting massively popular and still is today. Its concepts of two-way databinding and dependency injection resonated with a lot of .NET developers and most people could live with its intricacies.  
However when Angular 2 was announced, it became clear that this was going to be a totally different framework with no straight upgrade path. For me, this meant that I put Angular ‘on-hold’ because Angular 1’s future was uncertain and Angular 2 was nowhere to be seen yet.

But today, Angular 2 is released and can be considered for new projects again. My feelings over it are mixed: I really like the concept of Components, working with TypeScript is quite nice (you can still choose ES5 or ES2015, but nobody does that) and gone are the days of $scope.apply() but on the other hand, the template syntax is strange and it has so many parts and abstraction layers that it has become almost impossible to grasp in a short time. For example: Angular 2 now relies on [RxJS](https://github.com/Reactive-Extensions/RxJS) for some of its core functionality and that alone already has a huge learning curve.  
Despite the efforts made to make the transition from Angular 1 to Angular 2 possible, I think it’s going to be very hard to migrate. I gave it a shot with an existing 1.x app, but that experience was the same as choosing a completely different framework.

Still, I think Angular 2 is going to be used a lot despite some objections I may have :-). The community around it looks quite healthy, there are plenty of resources and training courses and component vendors like [Telerik](https://www.nativescript.org/nativescript-is-how-you-build-native-mobile-apps-with-angular) and [Ionic](http://ionic.io/) already fully support and leverage Angular 2. It’s probably a safe bet for new projects.

**React**

The other big player at this moment is React. Some say you can’t compare React with Angular because React is just a view library, but in practice, most people also leverage the ecosystem of libraries around React like [Redux](http://redux.js.org/) or [React-Router](https://github.com/ReactTraining/react-router). That’s also the main drawback of React: choosing the right additional libraries is really hard because there are so many of them and the preference of the community seems to change by the week, resulting in the infamous [JavaScript-fatigue](https://medium.com/@ericclemmons/javascript-fatigue-48d4011b6fc4#.8rxilgdfr) problem.

Initially, many people are put off by the [JSX syntax](https://facebook.github.io/react/docs/jsx-in-depth.html) of React, including myself, but actually it works quite well. Otherwise the learning curve isn’t really steep because React itself is so small and focused. The addition of and interaction with other libraries can make it complex. Still, I find it very enjoyable to work with. Simple and easy to reason about due to the [one-way data-flow](https://facebook.github.io/react/docs/thinking-in-react.html). No magic.

Currently, React and its ecosystem is my to-go ‘framework’ for JavaScript apps except for one type: forms-heavy crud apps. Those scenarios are very well possible with React, but I find that two-way binding is just a lot more productive.

**Others**

There are many other frameworks and libraries like [Ember](http://emberjs.com), [Vue.js](https://vuejs.org/) and golden oldies like [Backbone](http://backbonejs.org/) and [Knockout](http://knockoutjs.com/) (which you really should not be using anymore for new projects) but I’d like to especially mention [Aurelia](http://aurelia.io/). This framework historically has a strong connection with the .NET community due to its creator Rob Eisenberg (in same way Ember has a strong link with the Ruby on Rails community). In my opinion Aurelia is the common-sense alternative for Angular 2. Supports two-way databinding, super clean template code and generally very straightforward to program against. My only concern is the relatively small community. Aurelia has a hard time attracting developers from other non .NET communities but on the other hand, the same can be said about Ember and that has proved to be a solid framework for many years already.

## Programming languages

The current version of JavaScript supported by all browsers is [ES5](http://kangax.github.io/compat-table/es5/) (ECMAScript 5). However, in the recent years [ES6](https://github.com/lukehoban/es6features) (later renamed to ES2015) and [TypeScript](https://www.typescriptlang.org/) have appeared and these offer a much better programming experience and solve some serious long-standing JavaScript issues such as variable scoping and native modules. Although it is not _exactly_ the case, I consider TypeScript ES2015 but with types. To be able to use ES2015 or TypeScript in your browser you’ll need at least a compiler that converts your code to ES5.

So whether you’d use one over the other depends on if you want types or not. Personally, I still prefer ES2015 with its flexibility but TypeScript doesn’t really get in your way because almost all of the extra type functionality is optional. For large projects, I’d probably pick TypeScript because of the better refactoring possibilities and tooling support.

## Build tools

Most people use [Babel](http://babeljs.io/) to compile ES2015 and TypeScript comes with its own compiler (tsc). You probably also want to use modules and therefore you’ll need a module loader/bundler such as [webpack](https://webpack.github.io/), [SystemJS](https://github.com/systemjs/systemjs), [Browserify](http://browserify.org/) or [RequireJS](http://requirejs.org/). Most of these also have the possibility (via plugins) to build and package stylesheets and include images in the resulting bundles.  
In theory it’s possible to hook compiling and bundling (the entire build process) together with batch/shell scripts, but many people prefer to use a task runner like [Gulp](http://gulpjs.com/) or [Grunt](http://gruntjs.com/).

As you can see, there are many options here and it takes a lot of time to figure out the best combination of tools for your situation. All I can say is that for me, webpack with just a couple of scripts just worked great where the others always required a lot of fiddling and tweaking. Apparently, I’m not the only one because we’re clearly seeing a trend towards the use of webpack in various Open Source projects and frameworks (for example, the [Angular-cli](https://github.com/angular/angular-cli) recently switched from SystemJS to webpack).

## Package management

[NPM](https://www.npmjs.com/) has become the standard for browsers. All major packages are published there. [Bower](https://bower.io/) had its time and [JSPM](http://jspm.io/), although great in theory, never delivered its promise because of too much moving parts and too complex.

It’s a bit unfortunate that Bower was introduced in Visual Studio 2015 as the default package manager for browser packages just when NPM took over. Oh and please stop (ab)using NuGet as package manager for browser packages. NuGet is for compiled .NET libraries, period.

## Development environment

[Visual Studio Code](https://code.visualstudio.com/) (VSCode) has become one of the main JavaScript editors in a very short period. Intellisense/navigation for ES2015 and TypeScript, Git integration and still pretty light-weight. When using ASP.NET Core for backend services, VSCode is the only editor you’ll need.

On the other hand, [Visual Studio 2015](https://www.visualstudio.com/en-us/products/vs-2015-product-editions.aspx) also has become better for JavaScript development. It has good TypeScript support and with the [Task Runner Extensions](https://blogs.msdn.microsoft.com/webdev/2016/01/06/task-runners-in-visual-studio-2015/) you can run any Gulp or Grunt tasks or launch NPM scripts.
