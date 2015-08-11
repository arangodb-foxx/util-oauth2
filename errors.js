'use strict';
class ProviderNotFound extends Error {
  constructor(key) {
    super();
    this.name = this.constructor.name;
    this.message = `Provider with key ${key} not found.`;
    Error.captureStackTrace(this, this.constructor);
  }
}

exports.ProviderNotFound = ProviderNotFound;
