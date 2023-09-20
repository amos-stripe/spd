import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';

export default function ProductCard(props) {
    const styles = {
        product: {
            marginBottom: 20,
            fontSize: 16
        },
        img: {
            height: 120
        },
        clickable: {
            cursor: 'pointer'
        },
        light: {
            marginTop: 5,
            fontWeight: 300,
        }
    };

    const addToCart = (e) => {
        e.preventDefault();
        props.addToCart(props.product);
    }

    const displayPrice = (amount) => {
        return amount.toLocaleString('en-US', {
            style: 'currency',
            currency: process.env.REACT_APP_CURRENCY
        });
    }

    return (
        <>
            <div className="row" style={styles.product}>
                <div className="col-3">
                    <img src={props.product.images[0]} style={styles.img} />
                </div>
                <div className="col-6">
                    {props.product.name}
                    <div style={styles.light}>Ref: {props.product.id}</div>
                </div>
                <div className="col-2">
                    {displayPrice(props.product.price.amount)}
                </div>
                <div className="col-1">
                    <FontAwesomeIcon icon={faCartPlus} style={styles.clickable} onClick={addToCart}/>
                </div>
            </div>
        </>
    );
}