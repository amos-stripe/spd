import React, { useState, useEffect } from 'react';
import Helmet from 'react-helmet';

export default function Header(props) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [shopName, setShopName] = useState();
    const [shopIcon, setShopIcon] = useState('logo.png');
    const [shopColor, setShopColor] = useState('#425466');

    const styles = {
        top: {
            borderTop: '20px solid ' + shopColor,
            marginTop: 30,
            paddingTop: 20,
            marginBottom: 40
        },
        cart: {
            color: shopColor,
            textAlign: 'right',
            fontSize: '2em',
            marginTop: 30
        },
        title: {
            color: shopColor,
            fontFamily: 'Roboto',
            fontSize: '4em',
            letterSpacing: '-2px',
            fontWeight: 400
        },
        subtitle: {
            fontSize: '1.5rem',
            fontStyle: 'italic'
        },
        icon: {
            height: 70,
            float: 'left',
            margin: '10px 20px 10px 10px'
        }
    }

    // On intitial load only, retrieve branding details
    useEffect(() => {
        fetch('/settings/')
            .then(res => res.json())
            .then(data => {
                setShopName(data.shop_name);
                if (data.icon) setShopIcon(data.icon);
                setShopColor(data.primary_color);
            })
            .then(() => setIsLoaded(true));
    }, []);

    if (isLoaded) {
        return (
            <>
                <Helmet>
                    <title>{shopName}</title>
                </Helmet>
                <div className="row" style={styles.top}>
                    <div className="col">
                        <a href='/' ><img src={shopIcon} style={styles.icon} alt="icon" /></a>
                        {/*<div style={styles.title}>{shopName} - POS</div>*/}
                    </div>
                </div>
            </>
        );
    }
    else {
        return '';
    }
}

