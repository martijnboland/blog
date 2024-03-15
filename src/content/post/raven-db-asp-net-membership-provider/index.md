---
title: "Raven DB ASP.NET Membership Provider"
date: "2010-11-25"
categories: 
  - "net"
  - "aspnet-mvc"
tags: 
  - "aspnet-mvc"
  - "membership"
  - "nosql"
  - "ravendb"
---

During the last year I’ve been looking at various [NoSQL](http://en.wikipedia.org/wiki/NoSQL) databases. I’m particularly interested in the flexibility (no fixed schema) and I don’t care that much for scalability that some of these databases provide, therefore I focused on document databases like [CouchDB](http://couchdb.apache.org/), [MongoDB](http://www.mongodb.org/) and [Raven DB](http://ravendb.net/).

After some reading, I decided it was time for an experiment and took Raven DB to create an ASP.NET membership provider. The main reason I chose Raven DB is that you can run it embedded in your .NET application (for example in ~/App\_Data) without a separate server and it’s even possible to run the entire database in-memory, which is ideal for tests.

The result of the experiment can be found at [https://github.com/martijnboland/RavenDBMembership](https://github.com/martijnboland/RavenDBMembership "https://github.com/martijnboland/RavenDBMembership"). It’s a VS 2010 solution with the membership provider, some integration tests and an ASP.NET MVC 3 sample app. You can also directly [download it from here](https://github.com/martijnboland/RavenDBMembership/zipball/master).

_Disclaimer:_

_I’m not sure that creating a Membership provider was the right thing to do to experience NoSQL. Sure, the provider works, but the Membership API forces you into a direction that isn’t necessarily suitable for document databases and there might be some NoSQL anti-patterns here and there in the code_

_Oh, and the ASP.NET MVC sample app extends the Membership mess that comes with the default MVC project template. Don’t take this as some best practices example._
