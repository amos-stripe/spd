import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

export default function Cart(props) {
    const styles = {
        header: {
            marginBottom: 20
        },
        panel: {
            border: '1px solid silver',
            borderRadius: 4,
            padding: 15
        },
        total: {
            marginTop: 20,
            fontWeight: 500,
        },
        clickable: {
            cursor: 'pointer'
        }
    }

    const displayPrice = (amount) => {
        return amount.toLocaleString('en-US', {
            style: 'currency',
            currency: process.env.REACT_APP_CURRENCY,
            minimumFractionDigits: 2
        });
    }


    return (
        <div style={styles.panel}>
            <div className="row">
                <div className="col-8">
                    <h4 style={styles.header}>Order #{props.orderNumber}</h4>
                </div>
                <div className="col-4 text-end">
                    {props.cart.length > 0 && <FontAwesomeIcon icon={faTrash} style={styles.clickable} onClick={props.emptyCart} />}
                </div>
            </div>
            {props.cart.length > 0 && props.cart.map((item, key) => (
                <div className="row mt-2" key={key}>
                    <div className="col-8">
                        {item.name}
                    </div>
                    <div className="col-4 text-end">
                        {displayPrice(item.price.amount)}
                    </div>
                </div>
            ))}
            {props.cart.length > 0 &&
                <div className="row" style={styles.total}>
                    <div className="col-8">
                        Total:
                    </div>
                    <div className="col-4 text-end">
                        {displayPrice(props.cart.reduce((total, item) => total + item.price.amount, 0))}
                    </div>
                </div>
            }
            {
                props.cart.length === 0 && (
                    <>
                        <div className="row">
                            <div className="col">
                                Order empty
                            </div>
                        </div>
                    </>
                )
            }
        </div >
    );

}

