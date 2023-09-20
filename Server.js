const express = require('express');
const app = express();
app.use(express.json());

const path = require('path');
app.use(express.static(path.join(__dirname, 'build')));

const cors = require('cors');
const { log } = require('console');
app.use(cors());
require('dotenv').config();

const STRIPE_KEY = process.env.REACT_APP_SK;
const STRIPE_ADMIN = process.env.REACT_APP_ADMIN;
const PORT = process.env.REACT_APP_PORT;
const stripe = require('stripe')(STRIPE_KEY);

/*  ---------- */
app.use('/public', express.static('./public'))

/* ------ BUSINESS MODEL ------ */
app.get('/settings', async (req, res) => {
    const account = await stripe.accounts.retrieve(STRIPE_ADMIN);
    // let icon = false;
    // if (account.settings.branding.logo) {
    //     const logoFile = await stripe.files.retrieve(account.settings.branding.logo);
    //     icon = logoFile.links.data[0].url || false;
    // }

    res.send({
        shop_name: account.settings.dashboard.display_name,
        icon: '/public/stripepress.png',
        primary_color: account.settings.branding.primary_color
    })
});

app.get('/products/:currency', async (req, res) => {
    const currency = req.params.currency;
    const output = [];
    const prices = await stripe.prices.list({ limit: 100 });
    const products = await stripe.products.list({
        limit: 100,
        active: true
    });
    products.data.forEach(product => {
        const price = prices.data.find(x => (x.product === product.id && x.active && x.currency === req.params.currency)) || false;
        if (price) {
            product.price = {
                id: price.id,
                amount: price.unit_amount / 100,
                active: price.active
            }
            output.push(product);
        }
    });
    res.send(output);
})

/* ------ TERMINAL CHECKOUT ------ */
app.post("/create-payment-intent", async (req, res) => {
    const cart = req.body.cart;
    const custEmail = req.body.custEmail;
    const orderNumber = req.body.orderNumber;
    const reader = req.body.reader;
    let custId = '';

    // Create or reuse customer
    let customer = await stripe.customers.list({email: custEmail});
    if (customer.data.length > 0) {
        custId = customer.data[0].id;
    }
    else{
        customer = await stripe.customers.create({email: custEmail});
        custId = customer.id;
    }

    // We recalculate the total amount server side to prevent fraud, and we collate a lit of products being bought, to put into the metadata
    const prices = await stripe.prices.list({ limit: 100 });
    let total = 0;
    let summary = '';
    cart.forEach(item => {
        const price = prices.data.find(x => x.id === item.price.id) || 0;
        total += price.unit_amount;
        summary += item.id + ' [' + item.name + "]; "
    });

    const paymentIntent = await stripe.paymentIntents.create({
        amount: total,
        currency: process.env.REACT_APP_CURRENCY,
        customer: custId,
        metadata: {
            summary: summary,
            orderNumber: orderNumber,
            reader: reader
        },
        payment_method_types: ['card_present'],
        capture_method: 'manual'
    });

    res.send({
        clientSecret: paymentIntent.client_secret
    });
});

app.post("/create-and-capture", async (req, res) => {
    const cart = req.body.cart;
    const custEmail = req.body.custEmail;
    const orderNumber = req.body.orderNumber;
    const reader = req.body.reader;
    let custId = '';

    // Create or reuse customer
    let customer = await stripe.customers.list({email: custEmail});
    if (customer.data.length > 0) {
        custId = customer.data[0].id;
    }
    else{
        customer = await stripe.customers.create({email: custEmail});
        custId = customer.id;
    }

    // We recalculate the total amount server side to prevent fraud, and we collate a lit of products being bought, to put into the metadata
    const prices = await stripe.prices.list({ limit: 100 });
    let total = 0;
    let summary = '';
    cart.forEach(item => {
        const price = prices.data.find(x => x.id === item.price.id) || 0;
        total += price.unit_amount;
        summary += item.id + ' [' + item.name + "]; "
    });

    const paymentIntent = await stripe.paymentIntents.create({
        amount: total,
        currency: process.env.REACT_APP_CURRENCY,
        customer: custId,
        metadata: {
            summary: summary,
            orderNumber: orderNumber,
            reader: reader
        },
        payment_method_types: ['card_present'],
        capture_method: 'automatic'
    });

    let updated_reader = await stripe.terminal.readers.processPaymentIntent(
        'tmr_FQdalAWrC6bwW8',
        {
          payment_intent: paymentIntent.id,
        }
      );

    await pollReaderStatus('tmr_FQdalAWrC6bwW8')
    
    res.send({
        status: "OK"
    });
    // res.send({
    //     clientSecret: paymentIntent.client_secret
    // });
});

async function pollReaderStatus(terminalId) {
    try {
        log("Polling reader status");
        const reader = await stripe.terminal.readers.retrieve(terminalId);

        if (reader.action && reader.action.status === 'succeeded') {
            // Do whatever you need to do once the condition is met
            return;
            log("Reader action status succeeded!");
        } else {
            // If condition isn't met, wait for a while and then poll again
            log("Status: ", reader.action.status)
            setTimeout(() => pollReaderStatus(terminalId), 2000); // Polls every 2 seconds. Adjust the timing as needed.
        }
    } catch (error) {
        console.error("Error retrieving the reader:", error);
        // Handle error as needed, for example, you might want to retry after some time
        setTimeout(() => pollReaderStatus(terminalId), 2000);
    }
}

app.post("/connection_token", async (req, res) => {
    let connectionToken = await stripe.terminal.connectionTokens.create();
    res.json({ secret: connectionToken.secret });
})

// For card-present we need to manually capture
app.post("/capture_payment_intent", async (req, res) => {
    const paymentIntent = await stripe.paymentIntents.capture(req.body.id);
    res.send(paymentIntent);
})

app.get('/*', function(req,res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, (err) => {  
    if (err) {
      return log('something bad happened', err)
    }
    log(`server is listening on ${PORT}`)
  })
