# Simple POS application

### Spun off a separate demo from @bnuttin's for Stripe tour with Server Driven integration.

## The app

The application provides a basic point of sales system, to demonstrate Terminal.

All users, products, prices, images are kept in the Stripe test account itself - the app does not need a local database.

## Preparing your demo

- Ensure you have a customer already set in your dashboard, so you can tag the purchase to them; if not, the app will just create a customer with the email address you enter.
- You will need at least one physical terminal to be registered to the Stripe account under which you are running the demo. The app will connect to the first reader it finds online. To add a reader, go into the admin mode and enter the admin password (07139), generate a pairing code, and enter that in the dashboard (https://dashboard.stripe.com/test/terminal then go into a specific location).  

## Preview    
<img src='src/images/pos-checkout.gif' width="800"/>  

## Running the app

Prior to running the app, ensure you have an `.env` file with the API keys in your root directory (similar to `.env.example`). You will also want to make sure your Stripe account has branding settings, and that the primary color is somewhat dark.  

Install all the necessary Node modules via:  
   `npm install`

Then to start the app, launch two Terminal windows from the *root* directory:  
    `node Server.js`  
    `npm run local`   

The app will then load at [http://localhost:3000](http://localhost:3000) (note the server itself runs out of port 8081, so we have a `proxy` property in the `package.json` file so React knows where to route the server requests).

You can also run the built version of the app - though if you do that, changes to components will not show until the next build:  
    `npm run build`  
    `npm start`

When running the app from the built version, the URL will be [http://localhost:8081](http://localhost:8081)
