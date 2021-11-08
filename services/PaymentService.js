'use strict';

/**
 * Require backendless arguments
 */
const { args } = require('commander');


/**
 * Require our config
 */
 require('dotenv').config()
/*
 * Content of .env file, located at project root
 STRIPE_SECRET = {String} ;The active stripe secret
 PP_CLIENT_ID = {String} ;The active PayPal ClientId
 PP_CLIENT_SECRET = {String} ;The active PayPal client secret
 PP_SANDBOX_LIVE = {String} ;The environment to use: Sandbox | Live
 PP_PARTNER_ID = {String} ;PayPal Partner ID given by account manager
 PP_CAPTURE_URL: local URL to paypal capture API endpoint starting with /
 * please ptovide locally. .env is git ignored in .gitignore
 */


/**
 * Require backendless Models
 */
//const PaymentModel = require('../models/PaymentModel');


/**
 * Require our stripe submodule to handle stripe checkout requests
 */
 const stripe = require('./stripe/checkout');


/**
 * Require our paypal submodule to handle paypal checkout requests
 */
 const paypal = require('./paypal/checkout');


 /**
 * getPaymentProvider
 * examine which payment provider was requested in API call
 * @param {String} query //"Credit Card" || "PayPal" 
 * @returns {String} //stripe || paypal
 */
function getPaymentProvider (query) {
  if (query == "Credit Card") {
      return "stripe";
  }
  if (query == "PayPal") {
      return "paypal";
  }
}


/**
 * getPaymentPlan
 * examine which payment plan was requested in API call
 * @param {String} query //"Monthly Subscription" || "Single Donation" 
 * @returns {String} //subscription || payment
 */
 function getPaymentPlan (query) {
  if (query == "Monthly Subscription") {
      return "subscription";
  }
  if (query == "Single Donation") {
      return "payment";
  }
}


/**
 * getUrl
 * examine which successUrl or cancelUrl was requested in API call
 * and set it or annotate it with fallbackUrl if not provided correctily
 * @param {String} url //requested url
 * @param {String} httpRequest // fallback url from this.request.
 * @returns {String} //corrected url:
 */
 function getUrl (url) {
  if (url.startsWith("http")){
    return url;
  } else {
      return httpRequest.headers.Origin + url;
  }
}


/**
 * Payment Service
 * The service to be exported to backendless
 */
class PaymentService {
  

  /**
   * 
   * checkoutPost API endpoint
   * Accepts an Url encoded sring or a JSON object as parameter to call provider speific checkout and redirects to client's success or cancel URL
   *
   * @route POST /v1/checkoutPost
   * 
   * @param {String} body // request body in JSON or UrlEncode Form
   *
   * @returns {String} //Result code
   */
  async checkoutPost(body) {

    // parse request body to json
    let params = {}
    try {
      params = JSON.parse(body)
    } catch (e) {
      const urlParams = new URLSearchParams(body);
      params = Object.fromEntries(urlParams);
    }

    // fall thru. call checkout API with parameters to continue processinf
    await this.checkoutApi(
      params.quantity || 0,
      params.paymentPlan || '',
      params.paymentProvider || '',
      params.stripeSinglePriceId || '',
      params.stripeSubscriptionPriceId || '',
      params.paypalPrice || '',
      params.paypalProduct || '',
      params.paypalSubscriptionId || '',
      params.successUrl || '',       
      params.cancelUrl || '', 
      params.firstname || '',
      params.lastname || '',
      params.email || ''
    )
  }


  /**
   * checkoutApi API endpoint
   * Accepts a list of parameters to call provider speific checkout and redirects to client's success or cancel URL
   *
   * @route POST /v1/checkoutApi
   * 
   * @param {String} quantity // number of products to donate per period or once
   * @param {String} paymentPlan // "Monthly Subscription" || "Single Donation"
   * @param {String} paymentProvider // "Credit Card" || "PayPal"
   * @param {String} stripeSinglePriceId //Stripe product(price) to be used in stripe sinngle donation checkout
   * @param {String} stripeSubscriptionPriceId //Stripe product(price) to be used in stripe subscription checkout
   * @param {String} paypalPrice // Price in EUR to be shown in PayPal Singe Donation
   * @param {String} paypalProduct // String to be shown in PayPal Single Donation Checkout
   * @param {String} paypalSubscriptionId // ID of PayPal subscription
   * @param {String} successUrl //Redirection URL if checkout was successful
   * @param {String} cancelUrl //Redirection URK if checkout was canelled by the user
   * @param {String} firstname //Clients first name (will be passed to PayPal and Stripe checkouts for convenience)
   * @param {String} lastname //Clients last name (will be passed to PayPal and Stripe checkouts for convenience)
   * @param {String} email //Clients email (will be passed to PayPal and Stripe checkouts for convenience)
   * 
   * @returns {String} //Result code
   */
  async checkoutApi(
    quantity, paymentPlan, paymentProvider,
    stripeSinglePriceId, stripeSubscriptionPriceId,
    paypalPrice, paypalProduct, paypalSubscriptionId,
    successUrl, cancelUrl, 
    firstname, lastname, email
  ) {

    // set body strucure to pass it to the checkout handlers
    const body = {
      buyer: {
        firstname: firstname || '',
        lastname: lastname || '',
        email: email || ''
      },
      purchase: {
        quantity: quantity || 0,
        // mode will be set to "payment" or "subscription"
        plan: getPaymentPlan(paymentPlan),  
        // payment will be set to "paypal" or "stripe"
        provider: getPaymentProvider(paymentProvider), 
      },
      stripe: {
        singlePriceId: stripeSinglePriceId || '',
        subscriptionPriceId: stripeSubscriptionPriceId || ''
      },
      paypal: {
        // paypal price is in EUR !!
        price: paypalPrice || 0,
        product: paypalProduct || '',
        subscriptionId: paypalSubscriptionId
      },
      env: {
        // urls in parameters can be local or remote (starting with http). Local ones will be completed with this sites base url
        successUrl: getUrl(successUrl, this.request),
        cancelUrl:  getUrl(cancelUrl, this.request),
        ppSinglePurchaseCaptureUrl: "https://" + this.request.context.customDomain + process.env.PP_CAPTURE_URL
      }
    };

    // check for payment method and call correct checkout and get redirectUrl
    let redirectUrl;
    if (body.purchase.provider == "stripe") {
      redirectUrl =  await stripe.checkout(body);
    } else if (body.purchase.provider == "paypal") {

      // In case we use PayPal, we must set the success URL as an process.env variable. 
      // This is a hack, because the PayPal API doesn't provide a mechanism to pass it thru 
      process.env.PP_SINGLE_PURCHASE_SUCCESS_URL = body.env.successUrl;

      redirectUrl =  await paypal.checkout(body);
    }

    // redirect to success-url or cancel-url
    this.response.statusCode = 303;
    this.response.headers.location = redirectUrl;

  }



  /**
   * 
   * paypalCapture API endpoint
   * Process PayPal redirect after capture form was filled out and was confirmed
   * This "hack" is necessary because PayPal single purchase API doesn't allow to pass success Url
   *
   * @route GET /v1/paypalCapture
   * 
   * @param {String} token // PayPal session token
   *
   */
  async paypalCapture(token) {

    // capture Single PaypalOrder
    await paypal.capture(token);

    // redirect to success-url
    this.response.statusCode = 303;
    this.response.headers.location = process.env.PP_SINGLE_PURCHASE_SUCCESS_URL;
    
  }
  
}


/**
 * Add service to backendless
 */
PaymentService.version = '1.0.2';
Backendless.ServerCode.addService(PaymentService);