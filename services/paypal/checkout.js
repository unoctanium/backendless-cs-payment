// paypal/chekout.js
// ========
// Used environment variables:
// PP_CLIENT_ID: The active PayPal ClientId
// PP_CLIENT_SECRET: The active PayPal client secret
// PP_SANDBOX_LIVE: The environment to use: Sandbox | Live
// PP_PARTNER_ID: PayPal Partner ID given by account manager
// PP_CAPTURE_URL: local URL to paypal capture API endpoint starting with /
// envvironment set by code
// PP_SINGLE_PURCHASE_SUCCESS_URL: PayPal Success Url ti redirect to  after successful capture

/**
 * Require our config
 */
 require('dotenv').config()


/**
 * Require PayPal module
 * Assign to va because we will extend this module with subscription functions
 */
var paypal = require('@paypal/checkout-server-sdk');


/**
 * Require my extentions to paypal lib to support subscriptions in PayPaly library
 */
 paypal.subscriptions = require('./subscriptions/lib.js'); 
 module.exports = paypal;


/**
 *
 * Set up and return PayPal JavaScript SDK environment with PayPal access credentials.
 * This sample uses SandboxEnvironment. In production, use LiveEnvironment.
 * Set environment var in apps config GUI to either Sandbox or Live
 *
 */
 const environment = () => {
    let clientId = process.env.PP_CLIENT_ID || 'PP_CLIENT_ID';
    let clientSecret = process.env.PP_CLIENT_SECRET || 'PP__CLIENT_SECRET';
    if (process.env.PP_SANDBOX_LIVE == "Live") {
        return new paypal.core.LiveEnvironment(
            clientId, clientSecret
        );
    }
    else {
        return new paypal.core.SandboxEnvironment(
            clientId, clientSecret
        );
    }
}


/**
 *
 * Returns PayPal HTTP client instance with environment that has access
 * credentials context. Use this instance to invoke PayPal APIs, provided the
 * credentials have access.
 */
const ppclient = () => {
    let e = environment();
    return new paypal.core.PayPalHttpClient(e);
}


//
// Helper functions to handle paypal payment
//


/**
 * 
 * Handle PayPal Single purchase
 * 
 */
const handlePaypalSinglePurchase = async(body) => {
  
    // create request
    let request = new paypal.orders.OrdersCreateRequest();

    // Option: enable extended results. Comment out to use standard results
    //request.headers["prefer"] = "return=representation";
    
    // set PayPal Partner ID if available
    if (process.env.PP_PARTNER_ID) {
        request.headers["PayPal-Partner-Attribution-Id"] = process.env.PP_PARTNER_ID;
    }

    //request.headers["location"] = "http://www.google.de";
 
    // define request body
    request.requestBody({
        intent: 'CAPTURE',
        payer: {
            email_address: body.buyer.email,
            name: {
              given_name: body.buyer.lastname,
              surname: body.buyer.firstname
            },
            //name: {
            //  name: body.firstname + ' ' + body.lastname
            //}
        },
        application_context: {
            return_url: body.env.ppSinglePurchaseCaptureUrl,
            cancel_url: body.env.cancelUrl,
            brand_name: 'Donate trees',
            user_action: 'PAY_NOW',
            landing_page: 'LOGIN',
            shipping_preference: 'NO_SHIPPING',
            payment_method: {
                payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
            }
        },
        purchase_units: [
            {
                reference_id: 'default',
                description: body.paypal.product,
                amount: {
                    currency_code: 'EUR',
                    value: body.purchase.quantity * body.paypal.price,
                },
            },
        ],
    });
  
    // Call PayPal checkoput API to create checkout and redirect client to PayPals approval webpage
    // After client approves checkout, PayPal will send him to our capture function (API call to captureUrl un this Site) to collect payment
    let createOrder = async function () {

        let response = await ppclient().execute(request);
        
        // call approval webpage
        for (let i = 0; i < response.result.links.length; i++) {
            if (response.result.links[i].rel === 'approve') {
                // return url to redirect client for approval
                return (response.result.links[i].href);
            }
        }

        // Just in case of any problem, we return cancel_url here to redirect to merchants cancel page
        return body.env.cancelUrl; // error
    };

    // Create the order
    return createOrder(); 
  }
  

  /**
   * 
   * Handle PayPal Subscription Purchase
   * 
   */
  const handlePaypalSubscriptionPurchase = async(body) => {
  
    // create timestamp for paypal subscription start (4 seconds after 'now')
    var d = new Date(Date.now() + 1*60*1000);
    d.setSeconds(d.getSeconds() + 4);
    var isDate = d.toISOString();
    var isoDate = isDate.slice(0, 19) + 'Z';
  
    // create request
    let request = new paypal.subscriptions.SubscriptionsCreateRequest();

    // Option: enable extended results. Comment out to use standard results
    //request.headers["prefer"] = "return=representation";
    
    // set PayPal Partner ID if available
    if (process.env.PP_PARTNER_ID) {
        request.headers["PayPal-Partner-Attribution-Id"] = process.env.PP_PARTNER_ID;
    }

    // define request body
    request.requestBody({
      plan_id: body.paypal.subscriptionId,
      start_time: isoDate,
      quantity: body.purchase.quantity,
      /*shipping_amount: {
          currency_code: "EUR",
          value: body.paypal.price,
      },*/
      subscriber: {
          name: {
              given_name: body.buyer.lastname,
              surname: body.buyer.firstname
          },
          email_address: body.buyer.email,
      },
      application_context: {
          brand_name: "Tree donation",
          //"locale": "en-US",
          shipping_preference: 'NO_SHIPPING',
          payment_method: {
            payer_selected: "PAYPAL",
            payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
          },
          user_action: "SUBSCRIBE_NOW",
          return_url: body.env.successUrl,
          cancel_url: body.env.cancelUrl
      }
    });
  
    // Call PayPal checkoput API to create checkout and redirect client to PayPals approval webpage
    // after approval, no further capture is requires. client will be redirected to successUrl or cancelUrl depending on his approval
    let createSubscription = async function () {
      let response = await ppclient().execute(request);      
      // call approval webpage
      for (let i = 0; i < response.result.links.length; i++) {
          if (response.result.links[i].rel === 'approve') {
              return (response.result.links[i].href);
          }
    }

    // Just in case of any problem, we return cancel_url here to redirect to merchants cancel page
    return body.env.cancelUrl; // error
    };

    // Create the Subscription
    return createSubscription(); 
  };


/**
 * 
 * Handle paypal checkout Request (called by parent API handler)
 * 
 */
const checkout = async(body) => {

    // Call correct handler and return redirect to success-url or cancel-url
 
    if (body.purchase.plan == 'subscription') {
        return await handlePaypalSubscriptionPurchase(body);
    } else if (body.purchase.plan == 'payment') {
        return await handlePaypalSinglePurchase(body);
    }
}


/**
 * 
 * Handle paypal capture (called by parent API handler)
 * 
 */
 const capture = async(token) => {
    request = new paypal.orders.OrdersCaptureRequest(token);
    request.requestBody({});
    // Call API and get a response for call
    let response = await ppclient().execute(request);
    return response;
}


/**
 * Export functions
 */
module.exports = {
    checkout: checkout,
    capture: capture
};