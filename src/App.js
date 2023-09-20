// Modules
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Header from './components/Header';
import ProductList from './components/ProductList';
import Cart from './components/Cart.js';
import Customer from './components/Customer.js';
import CheckoutTerminal from './components/CheckoutTerminal';

import './styles/index.css';

//const promise = loadStripe(process.env.REACT_APP_PK);

export default function App() {
    const [orderNumber, setOrderNumber] = useState('');
    const [cart, setCart] = useState([]);
    const [custEmail, setCustEmail] = useState('');
    
    const addToCart = (obj) => {
        setCart([...cart, obj]);
    }

    const emptyCart = () => {
        setCart([]);
    }

    const generateOrderNumber = () => {
        setOrderNumber(Math.floor(100000 + Math.random() * 900000));
    }

    const resetAll = () => {
        emptyCart();
        generateOrderNumber();
        setCustEmail('');
    }

    useEffect(() => {
        generateOrderNumber();
    }, []);

    return (
        <>
            <Header />
            <div className="row">
                <div className="col-7">
                    <ProductList addToCart={addToCart} />
                </div>
                <div className="col-5">
                    <Cart cart={cart} orderNumber={orderNumber} emptyCart={emptyCart}/>
                    <Customer custEmail={custEmail} setCustEmail={setCustEmail}/>
                    <CheckoutTerminal custEmail={custEmail} cart={cart} orderNumber={orderNumber} resetAll={resetAll}/>
                </div>
            </div>
        </>
    );
}
