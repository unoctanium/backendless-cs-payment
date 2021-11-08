ClimeChange Payment service handler
To be run on backendless.coom

You need to creatre a local /.env file since this is part of.gitignore
Content:
//STRIPE_SECRET = {String} ;The active stripe secret
//PP_CLIENT_ID = {String} ;The active PayPal ClientId
//PP_CLIENT_SECRET = {String} ;The active PayPal client secret
//PP_SANDBOX_LIVE = {String} ;The environment to use: Sandbox | Live
//PP_PARTNER_ID = {String} ;PayPal Partner ID given by account manager
//PP_CAPTURE_URL: local URL to paypal capture API endpoint starting with 

API doc to follow