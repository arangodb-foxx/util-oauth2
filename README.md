# The OAuth2 Authentication App

The OAuth2 authentication app provides authentication abstractions over OAuth2 providers like Facebook, GitHub and Google. If you want to support additional providers, you can easily define your own.

## Configuration

The app requires no configuration, but you need to update its *providers* collection with your client ID and client secret for each provider you wish to support.

### Registering your app with GitHub

If you want to use the *github* provider, you need to obtain a client ID and client secret from GitHub:

1. Create a regular account at [GitHub](https://github.com) or use an existing account you own.
2. Go to [Account Settings > Applications > Register new application](https://github.com/settings/applications/new).
3. Provide an *authorization callback URL*. This must match your *redirect_uri* later.
4. Fill in the other required details and follow the instructions provided.
5. Open the application page, then note down the *Client ID* and *Client Secret*.
6. Update the *github* provider by setting its *clientId* attribute to the *Client ID* and its *clientSecret* attribute to the *Client Secret*. Don't forget to save your changes.

### Registering your app with Facebook

If you want to use the *facebook* provider, you need to obtain a client ID and client secret from Facebook:

1. Create a regular account at [Facebook](https://www.facebook.com) or use an existing account you own.
2. Visit the [Facebook Developers](https://developers.facebook.com) page.
3. Click on *Apps* in the menu, then select *Register as a Developer* (the only option) and follow the instructions provided. You may need to verify your account by phone.
4. Click on *Apps* in the menu, then select *Create a New App* and follow the instructions provided.
5. Open the app dashboard, then note down the *App ID* and *App Secret*. The secret may be hidden by default.
6. Click on *Settings*, then *Advanced* and enter one or more *Valid OAuth redirect URIs*. At least one of them must match your *redirect_uri* later. Don't forget to save your changes.
7. Update the *facebook* provider by setting its *clientId* attribute to the *App ID* and its *clientSecret* attribute to the *App Secret*. Don't forget to save your changes.

### Registering your app with Google

If you want to use the *google* provider, you need to obtain a client ID and client secret from Google:

1. Create a regular account at [Google](https://www.google.com) or use an existing account you own.
2. Visit the [Google Developers Console](https://console.developers.google.com).
3. Click on *Create Project*, then follow the instructions provided.
4. When your project is ready, open the project dashboard, then click on *Enable an API*.
5. Enable the *Google+ API* to allow your app to distinguish between different users.
6. Open the *Credentials* page and click *Create new Client ID*, then follow the instructions provided. At least one *Authorized Redirect URI* must match your *redirect_uri* later. At least one *Authorized JavaScript Origin* must match your app's fully-qualified domain.
7. When the Client ID is ready, note down the *Client ID* and *Client secret*.
8. Update the *google* provider by settiing its *clientId* attribute to the *Client ID* and its *clientSecret* attribute to the *Client secret*. Don't forget to save your changes.

## JavaScript API: *providers*

This app exposes its functionality via a JavaScript API named *providers*.

```js
var providers = Foxx.requireApp('/_system/oauth2').providers;
```

### Exceptions

#### Provider Not Found

Indicates a provider could not be found in the database.

`new providers.errors.ProviderNotFound(providerId)`

Thrown by the provider storage's *delete* and *get* methods if passed a provider ID that does not exist in the database.

*Examples*

```js
try {
    providers.get(invalidProviderId);
} catch(err) {
    assertTrue(err instanceof providers.errors.ProviderNotFound);
}
```

### The provider object

Provider objects are instances of a Foxx model with the following attributes:

* *label*: a human-readable identifier for the provider (e.g. *"GitHub"*).
* *authEndpoint*: the fully-qualified URL of the provider's [authorization endpoint](http://tools.ietf.org/html/rfc6749#section-3.1).
* *tokenEndpoint*: the fully-qualified URL of the provider's [token endpoint](http://tools.ietf.org/html/rfc6749#section-3.2).
* *refreshEndpoint* (optional): the fully-qualified URL of the provider's [refresh token](http://tools.ietf.org/html/rfc6749#section-6) endpoint.
* *activeUserEndpoint* (optional): the fully-qualified URL of the provider's endpoint for fetching details about the current user.
* *usernameTemplate* (optional): An underscore.js template for extracting the user's permanent identifier from the user's details. Default: *"<%= id %>"*.
* *clientId*: the client ID of the app registered with the provider.
* *clientSecret*: the client secret of the app registered with the provider.

### List available OAuth2 providers

Returns a list of OAuth2 providers that can be presented to the front-end.

`providers.list()`

Each item in the list is an object with the following properties:

* *_key*: *_key* of the provider.
* *label*: a human-readable identifier that can be presented to the user.
* *clientId*: the client ID stored for the given provider.

If you wish to exclude providers you don't support in your app, you need to filter the result manually.

*Examples*

```js
var supportedProviders = providers.list().filter(function(obj) {
    return Boolean(obj.clientId);
});
```

### Define a new OAuth2 provider

Creates a new OAuth2 provider with the given data.

`providers.create(data)`

Saves and returns a new instance of the provider model with its attributes set to the properties of the given object.

*Parameter*

* *data*: an arbitrary object, see above.

*Examples*

```js
var provider = providers.create({
    _key: 'myoauth2',
    label: 'My OAuth2 Provider',
    authEndpoint: 'https://example.com/oauth2/authorize',
    tokenEndpoint: 'https://example.com/oauth2/access_token',
    refreshEndpoint: 'https://example.com/oauth2/access_token',
    activeUserEndpoint: 'https://example.com/api/v2/users/me',
    usernameTemplate: '<%= user_id %>',
    clientId: '1234567890',
    clientSecret: 'kEyBoArDcAt'
});
```

### Fetch an existing OAuth2 provider

Fetches an existing OAuth2 provider from the database.

`providers.get(providerId)`

Throws a *ProviderNotFound* exception if the provider does not exist.

*Parameters*

* *providerId*: the provider's *_key*.

*Examples*

```js
var provider = providers.get('github');
assertTrue(provider.get('_key'), 'github');
```

### Delete a provider

There are two ways to delete a provider from the database:

* calling the provider storage's *delete* method with a provider's *_key* directly
* telling a provider to delete itself

#### Delete a provider by its ID

Delete a provider with a given ID.

`providers.delete(providerId)`

Attempts to delete the provider with the given *providerId* from the database. If the provider does not exist, a *ProviderNotFound* exception will be thrown. The method always returns *null*.

*Parameter*

* *providerId*: a provider *_key*.

*Examples*

```js
providers.delete('github');
```

#### Tell a provider to delete itself

Delete a provider from the database.

`provider.delete()`

Attempts to delete the provider from the database.

Returns *true* if the provider was deleted successfully.

Returns *false* if the provider already didn't exist.

*Examples*

```js
var provider = providers.get('github');
provider.delete();
```

### Save a provider

Save a provider to the database.

`provider.save()`

In order to commit changes made to the provider in your code, you need to call this method.

*Examples*

```js
provider.set('clientId', '1234567890');
provider.set('clientSecret', 'kEyBoArDcAt');
provider.save();
```


### Get the authorization URL of a provider

Generates the authorization URL for the authorization endpoint of the provider.

`provider.getAuthUrl(redirect_uri, args)`

Returns a fully-qualified URL for the authorization endpoint of the provider by appending the provider object's client ID and any additional arguments from *args* to the provider object's *authEndpoint*.

*Parameter*

* *redirect_uri*: the fully-qualified URL of your app's OAuth2 callback.
* *args* (optional): an object with any of the following properties:
  * *response_type* (optional): See [RFC 6749](http://tools.ietf.org/html/rfc6749). Default: *"code"*.

### _getTokenRequest

(Internal.) Generates the token URL and request body for token endpoint of the provider.

`provider._getTokenRequest(code, redirect_uri, args)`

Returns an object with two properties:

* *url*: the fully-qualified URL for the token endpoint.
* *body*: the form-encoded request body for the token endpoint created by appending the provider object's client ID, client secret and any additional arguments from *args* to the provider object's *tokenEndpoint*.

*Parameter*

* *code*: a grant code returned by the provider's authorization endpoint.
* *redirect_uri*: the original callback URL with which the code was requested.
* *args* (optional): an object with any of the following properties:
  * *grant_type* (optional): see [RFC 6749](http://tools.ietf.org/html/rfc6749). Default: *"authorization_code"*.

### Exchange a grant code for an access token

Exchanges a grant code for an access token.

`provider.exchangeGrantToken(code, redirect_uri)`

Performs a *POST* response to the provider object's *tokenEndpoint* and returns the parsed response body.

Throws an exception if the remote server responds with an empty response body.

*Parameter*

* *code*: a grant code returned by the provider's authorization endpoint.
* *redirect_uri*: the original callback URL with which the code was requested.
* *args* (optional): an object with any of the following properties:
  * *grant_type* (optional): see [RFC 6749](http://tools.ietf.org/html/rfc6749). Default: *"authorization_code"*.

### Fetch the active user

Fetches details of the active user.

`provider.fetchActiveUser(access_token)`

Performs a *GET* response to the provider object's *activeUserEndpoint* and returns the parsed response body.

Throws an exception if the remote server responds with an empty response body.

Also throws an exception if the provider object has no *activeUserEndpoint*.

*Parameter*

* *access_token*: an OAuth2 access token as returned by *exchangeGrantToken*.

*Examples*

```js
var authData = provider.exchangeGrantToken(code, redirect_uri);
var userData = provider.fetchActiveUser(authData.access_token);
```

### Get a user's identifier

Fetches the user's identifier from a user object returned by the provider.

`provider.getUsername(userData)`

Applies the provider's *usernameTemplate* to the given user object.

*Parameter*

* *userData*: the object returned by *getActiveUser*.

*Examples*

```js
var userData = provider.fetchActiveUser(access_token);
var username = provider.getUsername(userData);
```
