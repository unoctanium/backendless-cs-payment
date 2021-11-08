'use strict';

const querystring = require('querystring'); // eslint-disable-line no-unused-vars
/**
 Captures a return that shows if subscription is activated.
 **/

class SubscriptionsActivatedRequest {

  constructor(orderId) {
    this.path = '/v1/billing/subscriptions/{order_id}?';
    this.path = this.path.replace('{order_id}', querystring.escape(orderId));
    this.verb = 'POST';
    this.body = null;
    this.headers = {
      'Content-Type': 'application/json'
    };
  }


  payPalClientMetadataId(payPalClientMetadataId) {
    this.headers['PayPal-Client-Metadata-Id'] = payPalClientMetadataId;
    return this;
  }

  payPalRequestId(payPalRequestId) {
    this.headers['PayPal-Request-Id'] = payPalRequestId;
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

module.exports = {SubscriptionsActivatedRequest: SubscriptionsActivatedRequest};