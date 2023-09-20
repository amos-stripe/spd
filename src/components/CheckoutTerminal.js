import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUnlink, faLink, faSearch, faRedo } from '@fortawesome/free-solid-svg-icons';

export default function CheckoutTerminal(props) {
    const [readerMessages, setReaderMessages] = useState('');
    const [detailsShown, setDetailsShown] = useState(false);

    const [discoveredReaders, setDiscoveredReaders] = useState([]);
    const [connectedReader, setConnectedReader] = useState('');
    const [connectedReaderLabel, setConnectedReaderLabel] = useState('');
    const [clientSecret, setClientSecret] = useState();
    const [terminal, setTerminal] = useState();
    const [paymentIntentID, setPaymentIntentID] = useState('');
    const [showFinalizeButton, setShowFinalizeButton] = useState(true);
    const [showReceipt, setShowReceipt] = useState(true);

    const styles = {
        button: {
            color: 'white'
        },
        status: {
            fontSize: 'small'
        },
        disconnected: {
            fontStyle: 'italic',
            opacity: 0.5,
            cursor: 'pointer'
        },
        connected: {
            fontWeight: 600,
            cursor: 'pointer'
        },
        clickable: {
            cursor: 'pointer'
        },
        marginTop: {
            marginTop: 20
        },
        checkout: {
            border: '1px solid silver',
            borderRadius: 4,
            padding: 15,
            marginTop: 20
        }
    }

    const validEmail = (email) => {
        if (email === undefined) return false;
        return email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
    }

    const fetchConnectionToken = async (e) => {
        setReaderMessages("Getting connection token...");
        const response = await fetch('/connection_token', { method: "POST" });
        const data = await response.json();
        return data.secret;
    }

    const unexpectedDisconnect = () => {
        setReaderMessages("Disconnected from reader...");
        setDiscoveredReaders([]);
        setConnectedReader();
    }

    const resetAll = () => {
        setPaymentIntentID('');
        setDetailsShown(false);
        setShowFinalizeButton(true);
        props.resetAll();
    }

    let total = 0;
    if (props.cart.length > 0) {
        props.cart.forEach(item => {
            total += item.price.amount
        })
    }

    const displayPrice = (amount) => {
        return amount.toLocaleString('en-US', {
            style: 'currency',
            currency: process.env.REACT_APP_CURRENCY,
            minimumFractionDigits: 2
        });
    }

    // We only fetch the connection token once, so we don't disconnect at every re-render
    useEffect(() => {
        const terminal = window.StripeTerminal.create({
            onFetchConnectionToken: fetchConnectionToken,
            onUnexpectedReaderDisconnect: unexpectedDisconnect,
        });
        setTerminal(terminal);
    }, []);

    // Once the terminal is initialize, automatically discover connected readers
    useEffect(() => {
        if (terminal !== undefined)
            discoverReaders();
    }, [terminal]);

    // Find all connected readers and connect automatically if only one was found
    const discoverReaders = () => {
        setReaderMessages('');
        setDiscoveredReaders([]);
        const config = { simulated: false };
        terminal.disconnectReader();
        terminal.discoverReaders(config).then(discoverResult => {
            if (discoverResult.error) {
                setReaderMessages('Failed to discover: ' + discoverResult.error.message);
            } else if (discoverResult.discoveredReaders.length === 0) {
                setReaderMessages('No available readers.');
            } else {
                const discoveredReaders = discoverResult.discoveredReaders;
                setDiscoveredReaders(discoveredReaders);
                setReaderMessages('');

                // Auto connect if only one reader found
                if (discoveredReaders.length === 1) connectReader(discoveredReaders[0]);
            }
        });
    }

    const connectReader = async (reader) => {
        setReaderMessages("Connecting to " + reader.label + " (" + reader.ip_address + ")...");
        const connectResult = await terminal.connectReader(reader);
        if (connectResult.error) {
            setReaderMessages('Failed to connect: ' + connectResult.error.message);
        } else {
            setConnectedReader(connectResult.reader.id);
            setConnectedReaderLabel(connectResult.reader.label);
            setReaderMessages('');
        }
    }

    const disconnectReader = () => {
        terminal.disconnectReader();
        setConnectedReader();
    }

    const createAndCapture = () => {
        return fetch("/create-and-capture", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cart: props.cart,
                custEmail: props.custEmail,
                orderNumber: props.orderNumber,
                reader: connectedReaderLabel
            })
        })
            .then(res => res.json())
            .then(data => {
                // setClientSecret(data.clientSecret);
                return data.status;
            });
    }

    const createPaymentIntent = () => {
        return fetch("/create-payment-intent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cart: props.cart,
                custEmail: props.custEmail,
                orderNumber: props.orderNumber,
                reader: connectedReaderLabel
            })
        })
            .then(res => res.json())
            .then(data => {
                setClientSecret(data.clientSecret);
                return data.clientSecret;
            });
    }

    // Show cart details and allow pre-dipping the card (US only)
    const showCartDetails = () => {
        setDetailsShown(true);
        let total = 0;
        let line_items = [];
        props.cart.forEach(item => {
            total += item.price.amount * 100;
            line_items.push({
                description: item.name,
                amount: item.price.amount * 100,
                quantity: 1
            });
        });
        return terminal.setReaderDisplay(
            {
                type: 'cart',
                cart: {
                    line_items: line_items,
                    tax: 0,
                    total: total,
                    currency: process.env.REACT_APP_CURRENCY,
                }
            }
        )
    }

    const clearCartDetails = () => {
        terminal.clearReaderDisplay();
        setDetailsShown(false);
    }

    const collectPayment = () => {
        //showCartDetails()
        // createPaymentIntent()
        //     .then(client_secret => {
        //         terminal.collectPaymentMethod(client_secret).then(result => {
        //             if (result.error) {
        //                 // Placeholder for handling result.error
        //             } else {
        //                 terminal.processPayment(result.paymentIntent).then(result => {
        //                     if (result.error) {
        //                         console.log(result.error)
        //                     } else if (result.paymentIntent) {
        //                         setPaymentIntentID(result.paymentIntent.id);
        //                     }
        //                 });
        //             }
        //         });
        //     });
        createAndCapture().then(data => {
            setPaymentIntentID("smth")
            setShowFinalizeButton(false);
            setShowReceipt(true);
        });
    }

    const finalizePayment = () => {
        return fetch('/capture_payment_intent', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: paymentIntentID
            })
        })
            .then(res => res.json())
            .then(function (data) {
                setShowFinalizeButton(false);
                setShowReceipt(true);
            });
    }

    return (
        <div style={styles.checkout}>
            <div className="row" style={styles.header}>
                <div className="col-10">
                    <h4>Readers</h4>
                </div>
                <div className="col-2 text-end">
                    <FontAwesomeIcon icon={faRedo} title="Refresh readers" style={styles.clickable} onClick={discoverReaders} />
                </div>
            </div>
            {discoveredReaders.length === 0 && <>
                <div className="row">
                    <div className="col-10" style={styles.disconnected}>
                        No readers set-up. Note: this demo requires a hardware reader to be set up for the Stripe account.
                    </div>
                    <div className="col-2 text-end" style={styles.disconnected}>
                        <FontAwesomeIcon icon={faSearch} title="Find readers" style={styles.clickable} onClick={discoverReaders} />
                    </div>
                </div>
            </>}
            {discoveredReaders.length > 0 && discoveredReaders.map((reader, key) => (
                <div className="row py-1" key={key}>
                    {connectedReader === reader.id && <>
                        <div className="col-10" style={styles.connected}>
                            {reader.label}
                        </div>
                        <div className="col-2 text-end" style={styles.connected}>
                            <FontAwesomeIcon icon={faLink} title="Connected - click to disconnect" onClick={disconnectReader} />
                        </div>
                    </>}
                    {connectedReader !== reader.id && <>
                        <div className="col-10" style={styles.disconnected}>
                            {reader.label}
                        </div>
                        <div className="col-2 text-end" style={styles.disconnected}>
                            <FontAwesomeIcon icon={faUnlink} title="Disconnected - click to connect" onClick={e => connectReader(reader)} />
                        </div>
                    </>}
                </div>
            ))}
            <div className="row">
                <div className="col" style={styles.status}>{readerMessages}</div>
            </div>
            {connectedReader !== '' && readerMessages === '' && props.cart.length > 0 && props.custEmail !== '' && validEmail(props.custEmail) &&
                <div className="row" style={styles.marginTop}>
                    <div className="col">
                        {/* Reader cart details */}
                        <div className="row">
                            <div className="col">
                                {paymentIntentID === '' && !detailsShown && <button className="form-control btn btn-primary" style={{ color: 'white' }} onClick={showCartDetails}>Show Cart Details</button>}
                                {paymentIntentID === '' && detailsShown && <button className="form-control btn btn-secondary" style={{ color: 'white' }} onClick={clearCartDetails}>Clear Cart Details</button>}
                            </div>
                        </div>
                        {/* Create and process the PI */}
                        <div className="row mt-2">
                            <div className="col">
                                {paymentIntentID === '' && <button className="form-control btn btn-primary" style={{ color: 'white' }} onClick={collectPayment}>Pay {displayPrice(total)}</button>}
                                {paymentIntentID !== '' && showFinalizeButton && <button className="form-control btn btn-success" style={{ color: 'white' }} onClick={finalizePayment}>Finalize Payment</button>}
                                {paymentIntentID !== '' && !showFinalizeButton && showReceipt && <>
                                    <div>Payment successful - {paymentIntentID}</div>
                                    <button className="form-control btn btn-danger" style={{ marginTop: 20, color: 'white' }} onClick={resetAll}>Next Order</button>
                                </>}
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}