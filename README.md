# ClimeChange Payment service handler

To be run on backendless.coom

## Local Dev setup

You need to creatre a local /.env file since this is part of.gitignore

### Content:

* STRIPE_SECRET = {String} ;The active stripe secret
* PP_CLIENT_ID = {String} ;The active PayPal ClientId
* PP_CLIENT_SECRET = {String} ;The active PayPal client secret
* PP_SANDBOX_LIVE = {String} ;The environment to use: Sandbox | Live
* PP_PARTNER_ID = {String} ;PayPal Partner ID given by account manager
* PP_CAPTURE_URL: local URL to paypal capture API endpoint starting with "/"

## API Doc

API doc to follow

## modules and backend documentation

### Sites

* Backendless: https://backendless.com/
* Stripe: https://dashboard.stripe.com/test/dashboard
* PayPal Developer Accounts: https://developer.paypal.com/developer/accounts
* PayPal Sandbox: https://www.sandbox.paypal.com/mep/dashboard
* NOWPayments: https://nowpayments.io

### APIs
* Backendless API: https://backendless.com/docs/bl-js/index.html
* Stripe API: https://stripe.com/docs/api
* PayPal API: https://developer.paypal.com/docs/api/overview/ and https://developer.paypal.com/docs/checkout/reference/server-integration/setup-sdk/
* NOWPayments API: https://documenter.getpostman.com/view/7907941/S1a32n38?version=latest#intro

### Modules

* Backendless node.js npm: https://www.npmjs.com/package/backendless
* Backendless Rest node.js and web client: https://github.com/Backendless/Request
* Stripe-node: https://www.npmjs.com/package/stripe
* PayPal Checkout API SDK for NodeJS: https://www.npmjs.com/package/@paypal/checkout-server-sdk
* NowPayments JS API: https://www.npmjs.com/package/@nowpaymentsio/nowpayments-api-js
* dotenv: https://www.npmjs.com/package/dotenv

