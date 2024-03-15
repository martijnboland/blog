---
title: "Appoints-Api - A simple example appointment scheduler REST API"
date: "2014-05-28"
categories: 
  - "javascript"
  - "web-development"
tags: 
  - "expressjs"
  - "hypermedia"
  - "mongodb"
  - "nodejs"
  - "rest"
---

Appoints is one of my pet projects. It’s an appointment scheduler application and I’m using it to explore new technologies and to refine existing development methods.  
To stay buzzword-compliant, Appoints needs a REST API. I’ve been in some projects lately where we have had mixed results with REST API’s and client apps, so I decided to do it properly this time. Some requirements:

- Keep it simple;
- Design API-first;
- Accessible for both JavaScript and native (mobile) clients;
- 3rd party authentication: no need for user registration and management;
- Testable;
- Keep it simple.

The result is at GitHub: [https://github.com/martijnboland/appoints-api-node](https://github.com/martijnboland/appoints-api-node "https://github.com/martijnboland/appoints-api-node"). I have to say that I’m pretty pleased with how it turned out :-). It’s build with [NodeJS](http://nodejs.org/), [Express](http://expressjs.com/) and [MongoDB](http://www.mongodb.org/) via [Mongoose](http://mongoosejs.com/). In my opinion, this is currently the most productive technology stack for this kind of applications. I also managed to sprinkle some Hypermedia functionality on top of the API by conforming to the [HAL specification](http://stateless.co/hal_specification.html).

You can find a live version of the API at [https://appoints-api.azurewebsites.net](https://appoints-api.azurewebsites.net). For more information about the usage of the API, head over to the [GitHub site](https://github.com/martijnboland/appoints-api-node). I‘d love to add an API documentation site, but I am still looking for solutions.

Next, I’ll probably create an example JavaScript client so we have a full example. At the same time, it would be very nice if anyone would be able to build a native client. Shouldn’t be too hard.
