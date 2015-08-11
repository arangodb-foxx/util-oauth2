/*global applicationContext */
'use strict';
var _ = require('underscore');
var url = require('url');
var querystring = require('querystring');
var request = require('org/arangodb/request');

var cfg = applicationContext.configuration;

module.exports = {
  getAuthUrl(redirect_uri, args) {
    if (redirect_uri && typeof redirect_uri === 'object') {
      args = redirect_uri;
      redirect_uri = undefined;
    }

    var endpoint = url.parse(cfg.authEndpoint);
    args = _.extend(querystring.parse(endpoint.query), args);

    if (redirect_uri) {
      args.redirect_uri = redirect_uri;
    }
    if (!args.response_type) {
      args.response_type = 'code';
    }

    args.client_id = cfg.clientId;
    endpoint.search = '?' + querystring.stringify(args);

    return url.format(endpoint);
  },
  _getTokenRequest(code, redirect_uri, args) {
    if (code && typeof code === 'object') {
      args = code;
      code = undefined;
      redirect_uri = undefined;
    } else if (redirect_uri && typeof redirect_uri === 'object') {
      args = redirect_uri;
      redirect_uri = undefined;
    }

    var endpoint = url.parse(cfg.tokenEndpoint);
    args = _.extend(querystring.parse(endpoint.query), args);

    if (code) {
      args.code = code;
    }
    if (redirect_uri) {
      args.redirect_uri = redirect_uri;
    }
    if (!args.grant_type) {
      args.grant_type = 'authorization_code';
    }

    args.client_id = cfg.clientId;
    args.client_secret = cfg.clientSecret;

    delete endpoint.search;
    delete endpoint.query;

    return {url: url.format(endpoint), body: args};
  },
  getActiveUserUrl(access_token, args) {
    var endpoint = cfg.activeUserEndpoint;
    if (!endpoint) {
      return null;
    }

    if (access_token && typeof access_token === 'object') {
      args = access_token;
      access_token = undefined;
    }

    endpoint = url.parse(endpoint);
    args = _.extend(querystring.parse(endpoint.query), args);

    if (access_token) {
      args.access_token = access_token;
    }

    endpoint.search = '?' + querystring.stringify(args);

    return url.format(endpoint);
  },
  exchangeGrantToken(code, redirect_uri) {
    var req = this._getTokenRequest(code, redirect_uri);
    var res = request.post(req.url, {
      headers: {accept: 'application/json'},
      form: req.body
    });
    if (!res.body) throw new Error(`OAuth2 provider returned empty response with HTTP status ${res.status}`);
    try {
      return JSON.parse(res.body);
    } catch (err) {
      if (err instanceof SyntaxError) {
        return querystring.parse(res.body);
      }
      throw err;
    }
  },
  fetchActiveUser(access_token) {
    var url = this.getActiveUserUrl(access_token);
    if (!url) throw new Error('OAuth2 provider does not support active user lookup');
    var res = request.get(url);
    if (!res.body) throw new Error(`OAuth2 provider returned empty response with HTTP status ${res.status}`);
    try {
      return JSON.parse(res.body);
    } catch (err) {
      if (err instanceof SyntaxError) {
        return querystring.parse(res.body);
      }
      throw err;
    }
  }
};
