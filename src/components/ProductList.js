import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard.js';

export default function ProductList(props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [products, setProducts] = useState([]);
  const [prices, setPrices] = useState([]);

  const styles={
    products: {
      border: '1px solid silver',
      borderRadius:5,
      padding: '20px 20px 0 20px'
    }
  }

  useEffect(() => {
    fetch(`/products/${process.env.REACT_APP_CURRENCY}`)
      .then(res => res.json())
      .then(obj => {
        setProducts(obj);
        setIsLoaded(true);
      });
  }, []);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  else {
    return (
      <div style={styles.products}>
        {products.map((product, key) => (
          <ProductCard
            product={product}
            addToCart={props.addToCart}
            key={key} />
        ))}
      </div>
    );
  }
}


