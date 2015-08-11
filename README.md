# The OAuth2 Client

The OAuth2 client utility service provides abstractions over OAuth2 providers like Facebook, GitHub and Google.

## Configuration

This utility has the following configuration options:

* *authEndpoint*: the fully-qualified URL of the provider's [authorization endpoint](http://tools.ietf.org/html/rfc6749#section-3.1).
* *tokenEndpoint*: the fully-qualified URL of the provider's [token endpoint](http://tools.ietf.org/html/rfc6749#section-3.2).
* *refreshEndpoint* (optional): the fully-qualified URL of the provider's [refresh token endpoint](http://tools.ietf.org/html/rfc6749#section-6).
* *activeUserEndpoint* (optional): the fully-qualified URL of the provider's endpoint for fetching details about the current user.
* *clientId*: The application's *Client ID* (or *App ID*) for the provider.
* *clientSecret*: The application's *Client Secret* (or *App Secret*) for the provider.

### Configuring OAuth2 for Facebook

If you want to use Facebook as the OAuth2 provider, use the following configuration:

* *authEndpoint*: `https://www.facebook.com/dialog/oauth`
* *tokenEndpoint*: `https://graph.facebook.com/oauth/access_token`
* *activeUserEndpoint*: `https://graph.facebook.com/v2.0/me`

You also need to obtain a client ID and client secret from Facebook:

1. Create a regular account at [Facebook](https://www.facebook.com) or use an existing account you own.
2. Visit the [Facebook Developers](https://developers.facebook.com) page.
3. Click on *Apps* in the menu, then select *Register as a Developer* (the only option) and follow the instructions provided. You may need to verify your account by phone.
4. Click on *Apps* in the menu, then select *Create a New App* and follow the instructions provided.
5. Open the app dashboard, then note down the *App ID* and *App Secret*. The secret may be hidden by default.
6. Click on *Settings*, then *Advanced* and enter one or more *Valid OAuth redirect URIs*. At least one of them must match your *redirect_uri* later. Don't forget to save your changes.
7. Set the configuration option *clientId* to the *App ID* and the option *clientSecret* to the *App Secret*.

### Configuring OAuth2 for GitHub

If you want to use GitHub as the OAuth2 provider, use the following configuration:

* *authEndpoint*: `https://github.com/login/oauth/authorize?scope=user`
* *tokenEndpoint*: `https://github.com/login/oauth/access_token`
* *activeUserEndpoint*: `https://api.github.com/user`

You also need to obtain a client ID and client secret from GitHub:

1. Create a regular account at [GitHub](https://github.com) or use an existing account you own.
2. Go to [Account Settings > Applications > Register new application](https://github.com/settings/applications/new).
3. Provide an *authorization callback URL*. This must match your *redirect_uri* later.
4. Fill in the other required details and follow the instructions provided.
5. Open the application page, then note down the *Client ID* and *Client Secret*.
6. Set the configuration option *clientId* to the *Client ID* and the option *clientSecret* to the *Client Secret*.

### Configuring OAuth2 for Google

If you want to use Google as the OAuth2 provider, use the following configuration:

* *authEndpoint*: `https://accounts.google.com/o/oauth2/auth?access_type=offline&scope=profile`
* *tokenEndpoint*: `https://accounts.google.com/o/oauth2/token`
* *activeUserEndpoint*: `https://www.googleapis.com/plus/v1/people/me`

You also need to obtain a client ID and client secret from Google:

1. Create a regular account at [Google](https://www.google.com) or use an existing account you own.
2. Visit the [Google Developers Console](https://console.developers.google.com).
3. Click on *Create Project*, then follow the instructions provided.
4. When your project is ready, open the project dashboard, then click on *Enable an API*.
5. Enable the *Google+ API* to allow your app to distinguish between different users.
6. Open the *Credentials* page and click *Create new Client ID*, then follow the instructions provided. At least one *Authorized Redirect URI* must match your *redirect_uri* later. At least one *Authorized JavaScript Origin* must match your app's fully-qualified domain.
7. When the Client ID is ready, note down the *Client ID* and *Client secret*.
8. Set the configuration option *clientId* to the *Client ID* and the option *clientSecret* to the *Client secret*.

## JavaScript API

This service exposes its functionality via a JavaScript API.

**Examples**

First add this utility service to your dependencies:

```js
{
  ...
  "dependencies": {
    "oauth2": "oauth2:^2.0.0"
  }
  ...
}
```

Once you've configured both services correctly, you can use it like this:

```js
var Foxx = require('org/arangodb/foxx');
var controller = new Foxx.Controller(applicationContext);
var oauth2 = applicationContext.dependencies.oauth2;

// later ...

var profile = oauth2.fetchActiveUser(req.session.get('userData').access_token);
```

### Get the authorization URL

Generates the authorization URL for the authorization endpoint.

`oauth2.getAuthUrl(redirect_uri, args)`

Returns a fully-qualified URL for the authorization endpoint of the provider by appending the client ID and any additional arguments from *args* to the *authEndpoint*.

*Parameter*

* *redirect_uri*: the fully-qualified URL of your application's OAuth2 callback.
* *args* (optional): an object with any of the following properties:
  * *response_type* (optional): See [RFC 6749](http://tools.ietf.org/html/rfc6749). Default: *"code"*.

### Exchange a grant code for an access token

Exchanges a grant code for an access token.

`oauth2.exchangeGrantToken(code, redirect_uri)`

Performs a *POST* response to the *tokenEndpoint* and returns the parsed response body.

Throws an exception if the remote server responds with an empty response body.

*Parameter*

* *code*: a grant code returned by the provider's authorization endpoint.
* *redirect_uri*: the original callback URL with which the code was requested.
* *args* (optional): an object with any of the following properties:
  * *grant_type* (optional): see [RFC 6749](http://tools.ietf.org/html/rfc6749). Default: *"authorization_code"*.

### Fetch the active user

Fetches details of the active user.

`oauth2.fetchActiveUser(access_token)`

Performs a *GET* response to the *activeUserEndpoint* and returns the parsed response body.

Throws an exception if the remote server responds with an empty response body.

Also throws an exception if the *activeUserEndpoint* is not configured.

*Parameter*

* *access_token*: an OAuth2 access token as returned by *exchangeGrantToken*.

*Examples*

```js
var authData = oauth2.exchangeGrantToken(code, redirect_uri);
var userData = oauth2.fetchActiveUser(authData.access_token);
```

## License

This code is distributed under the [Apache License](http://www.apache.org/licenses/LICENSE-2.0).
