// stripe/chekout.js
// ========
// Used environment variables:
// STRIPE_SECRET: The active stripe secret


/**
 * Require our config
 */
 require('dotenv').config()


/**
 * Get stripe secret from config
 */
 const STRIPE_SECRET = process.env.STRIPE_SECRET || 'STRIPE_SECRET';
 

 /**
 * Require stripe module
 */
 const stripe = require('stripe')(STRIPE_SECRET);


/**
 * 
 * Handle stripe checkout Request (called by parent API handler)
 * 
 */
 const checkout = async(body) => {

    // create stripe checkout session
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price: (body.purchase.plan == 'subscription') ? body.stripe.subscriptionPriceId: body.stripe.singlePriceId,
                quantity: body.purchase.quantity,
            },
        ],
        payment_method_types: [
            'card',
        ],
        mode: body.purchase.plan,
        success_url: body.env.successUrl,
        cancel_url: body.env.cancelUrl,
        customer_email: body.buyer.email,
        metadata: {
            'firstname': body.buyer.firstname, 
            'lastname': body.buyer.lastname,
            'email': body.buyer.email
        },
        //submit_type: 'donate'
    });

    // prepare redirect to success-url or cancel-url
    return session.url;
};


/**
 * Export functions
 */
 module.exports = {
    checkout: checkout
};