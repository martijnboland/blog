---
title: "ASP.NET Web API / OWIN authenticated integration tests without authorization server"
date: "2016-03-10"
categories: 
  - "net"
  - "web-development"
tags: 
  - "asp-net-web-api"
  - "integration-testing"
  - "oauth"
  - "owin"
---

Integration testing of OWIN Web API services is super easy with the [MIcrosoft.Owin.Testing.TestServer](https://blogs.msdn.microsoft.com/webdev/2013/11/26/unit-testing-owin-applications-using-testserver/) component. It is basically an in-memory OWIN host that runs together with the HttpClient without needing any network calls.

## Authentication

Aaron Powell has written [an extensive post](http://www.aaron-powell.com/posts/2014-01-12-integration-testing-katana-with-auth.html) about to test Web API services that require OAuth token authentication. With the method described in this post, tokens are requested from the /token resource (provided by the OWIN OAuth Authorization Server) before executing the actual API. This method works great for situations where the Web API service that is being tested also contains the authorization server. But sometimes the Web API service under test doesn’t contain the authorization server, so authentication tokens have to be requested from an external authorization server. This highly complicates the integration tests because the external server has to be setup for the tests. It would be great if we could get an authorization token for tests without the need for an external authorization server.

## Generate an OAuth token without authorization server

To generate and use a token in the integration tests, we create a base class (BaseAuthenticatedApiTestFixture) for our authenticated test fixtures that borrows some of the logic of the Owin  OAuthAuthorizationServerMiddleware internals. This base class inherits again from BaseApiTestFixture. This class contains all logic for creating the Owin TestServer and calling the API and is very much inspired by the BaseServerTest class in Aaron Powell’s [post](http://www.aaron-powell.com/posts/2014-01-12-integration-testing-katana-with-auth.html).

```csharp
/// <summary>
/// Base class for integration tests that require authentication.
/// </summary>
public abstract class BaseAuthenticatedApiTestFixture : BaseApiTestFixture
{
    private string _token;

    /// <summary>
    /// Token for authenticated requests.
    /// </summary>
    protected virtual string Token
    {
        get { return _token ?? (_token = GenerateToken()); }
    }

    protected override HttpRequestMessage CreateRequest(HttpMethod method, object data)
    {
        var request = base.CreateRequest(method, data);
        if (!String.IsNullOrEmpty(this.Token))
        {
            request.Headers.Add("Authorization", "Bearer " + this.Token);
        }
        return request;
    }

    private string GenerateToken()
    {
        // Generate an OAuth bearer token for ASP.NET/Owin Web Api service that uses the default OAuthBearer token middleware.
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, "WebApiUser"),
            new Claim(ClaimTypes.Role, "User"),
            new Claim(ClaimTypes.Role, "PowerUser"),
        };
        var identity = new ClaimsIdentity(claims, "Test");

        // Use the same token generation logic as the OAuthBearer Owin middleware. 
        var tdf = new TicketDataFormat(this.DataProtector);
        var ticket = new AuthenticationTicket(identity, new AuthenticationProperties { ExpiresUtc = DateTime.UtcNow.AddHours(1) });
        var accessToken = tdf.Protect(ticket);

        return accessToken;
    }
}
```

The GenerateToken() method in the code above creates the token in three steps:

1. Create a ClaimsIdentity that contains the username and claims (like roles);
2. Create an AuthenticationTicket based on the ClaimsIdentity;
3. Convert the AuthenticationTicket into a token with the TicketDataFormat class that uses a DataProtector to encrypt the ticket.

To make sure the token is accepted by the Owin OAuthBearer middleware, the DataProtector in step 3 needs to be the same as the one that is used for decrypting the token. Luckily we can create one during initialization of the Owin TestServer. This is set in a protected property of the BaseApiTestFixture so we can access it in BaseAuthenticatedApiTestFixture the subclass:

```csharp
protected BaseApiTestFixture()
{
    // Normally you'd create the server with:
    //
    //    Server = TestServer.Create<Startup>();
    //
    // but in this case we need to get hold of a DataProtector that can be 
    // used to generate compatible OAuth tokens.

    Server = TestServer.Create(app =>
    {
        var apiStartup = new Startup();
        apiStartup.Configuration(app);
        DataProtector = app.CreateDataProtector(typeof(OAuthAuthorizationServerMiddleware).Namespace, "Access_Token", "v1");
    });
    AfterServerSetup();
}
```

## Testing

To execute authenticated tests, just inherit from BaseAuthenticatedApiTestFixture and call the test methods in the base class. This is the controller we’re testing:

```csharp
public class AuthenticatedController : ApiController
{
    [HttpGet]
    [Authorize]
    [Route("userinfo")]
    public IHttpActionResult GetUserInfo()
    {
        var currentPrincipal = Request.GetOwinContext().Authentication.User;

        var userInfo = new UserInfoDto
        {
            Name = currentPrincipal.Identity.Name,
            Roles = currentPrincipal.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value ).ToArray()
        };
        return Ok(userInfo);
    }

    [HttpGet]
    [Authorize(Roles = "PowerUser")]
    [Route("poweruserhello")]
    public IHttpActionResult GetPowerUserHello()
    {
        return Ok("hello poweruser");
    }
}
```

As you can see, there are Authorize attributes that require authorization. The actual test code (using XUnit) is super simple:

```csharp
public class AuthenticatedApiTests : BaseAuthenticatedApiTestFixture
{
    private string _uri;

    protected override string Uri
    {
        get { return _uri; }
    }

    [Fact]
    public async void Get_UserInfo_Returns_200_And_UserInfo()
    {
        // Arrange
        _uri = "userinfo";

        // Act
        var response = await GetAsync();
        var result = await response.Content.ReadAsAsync<UserInfoDto>();

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(result.Name, "WebApiUser");
        Assert.Equal(2, result.Roles.Length);
    }

    [Fact]
    public async void Get_PowerUserHello_Returns_200_And_UserInfo()
    {
        // Arrange
        _uri = "poweruserhello";

        // Act
        var response = await GetAsync();
        var result = await response.Content.ReadAsAsync<string>();

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("hello poweruser", result);
    }
}
```

## Example solution

Check out the complete example solution at [https://github.com/martijnboland/AuthenticatedOwinIntegrationTests](https://github.com/martijnboland/AuthenticatedOwinIntegrationTests "https://github.com/martijnboland/AuthenticatedOwinIntegrationTests")
