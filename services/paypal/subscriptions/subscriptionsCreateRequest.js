'use strict';

const querystring = require('querystring'); // eslint-disable-line no-unused-vars
/**
 Creates a aubscription.
 **/

class SubscriptionsCreateRequest {

  constructor() {
    this.path = '/v1/billing/subscriptions?';
    this.verb = 'POST';
    this.body = null;
    this.headers = {
      'Content-Type': 'application/json'
    };
  }


  payPalPartnerAttributionId(payPalPartnerAttributionId) {
    this.headers['PayPal-Partner-Attribution-Id'] = payPalPartnerAttributionId;
    return this;
  }

  prefer(prefer) {
    this.headers['Prefer'] = prefer;
    return this;
  }

  requestBody(subscription) {
    this.body = subscription;
    return this;
  }
}

module.exports = {SubscriptionsCreateRequest:SubscriptionsCreateRequest};