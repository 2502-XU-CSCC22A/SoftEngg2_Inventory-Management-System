import React, { useState } from 'react';
import { Navbar } from './Navbar';
import EditAvailable from './editavailable';
import AddProduct from './addproduct';
import styles from './Available.module.css';
import { useProducts } from '../../hooks/useProducts.js';

const Available = () => {
  const { query, queryAll, updateMutation, insertMutation } = useProducts();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const isLoading = query.isLoading || (isChecked && queryAll.isLoading);
  const isError = query.isError || (isChecked && queryAll.isError);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading products.</div>;

  const openEdit = (product) => {
    setSelectedProduct(product);
    setIsEditing(true);
    setIsAdding(false);
  };
  const openAdd = () => {
    setIsAdding(true);
    setIsEditing(false);
    setSelectedProduct(null);
  };
  const closeEdit = () => {
    setIsEditing(false);
    setSelectedProduct(null);
  };
  const closeAdd = () => {
    setIsAdding(false);
  };

  const handleToggle = () => {
    setIsChecked(!isChecked);
  };

  const saveProduct = (updatedValues) => {
    updateMutation.mutate({ product_id: selectedProduct.product_id, ...updatedValues });
    closeEdit();
  };

  const addProduct = (newValues) => {
    insertMutation.mutate(newValues);
    closeAdd();
  }

  const filteredProducts = ((isChecked ? queryAll.data?.data : query.data?.data) || []).filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_id.toString().includes(searchTerm)
  );

  const formatPrice = (price) => {
    if (price === null || price === undefined) return "N/A";
    const priceStr = String(price);
    if (priceStr.length <= 2) {
      return `0.${priceStr.padStart(2, '0')}`;
    }
    const pesosPart = priceStr.slice(0, -2);
    const centsPart = priceStr.slice(-2);
    return `${pesosPart + "." + centsPart}`;
  }

  return (
    <div className={styles.wrapper}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles['content-card']}>
          <div className={styles['top-bar']}>
            <input
              type="text"
              placeholder="Search.."
              className={styles['search-bar']}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className={styles['action-buttons']}>
              <span className={styles['show-hidden-box']}>
                <input id="show-hidden" htmlFor="show-hidden" type="checkbox" checked={isChecked} onChange={handleToggle} />
                <label htmlFor="show-hidden" className={styles['show-hidden-label']}>Show Hidden</label>
              </span>
              <button className={styles.add} onClick={openAdd}>ADD</button>
            </div>
          </div>

          <div className={styles.header}>
            <h1>Available Product</h1>
          </div>

          <div className={styles['product-grid-wrapper']}>
            <div className={styles['product-list']}>
              {filteredProducts.map((product) => (
                <div key={product.product_id} className={styles[`${product.is_still_offered ? 'product-card' : 'product-card-hidden'}`]}>
                  <div className={styles['card-content']}>
                    <h3 className={styles['product-name']}>{product.product_name}</h3>
                    <div className={styles['product-details']}>
                      <p className={styles.quantity}>Quantity: {product.product_quantity}</p>
                      <p className={styles['product-id']}>ID: {product.product_id}</p>
                    </div>
                    <p className={styles.price}>{formatPrice(product.product_unit_price)}</p>
                  </div>
                  <div className={styles['card-actions']}>
                    { product.is_still_offered === true && <button className={styles.edit} onClick={() => openEdit(product)}>Edit</button> }
                    { product.is_still_offered === true && <button className={styles.hide} onClick={() => updateMutation.mutate({ product_id: product.product_id, is_still_offered: false })}>Hide</button> }
                    { product.is_still_offered === false && <button className={styles.show} onClick={() => updateMutation.mutate({ product_id: product.product_id, is_still_offered: true })}>Show</button> }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isEditing && selectedProduct && (
          <EditAvailable
            key={selectedProduct.product_id}
            product={selectedProduct}
            onClose={closeEdit}
            onSave={saveProduct}
          />
        )}
        {isAdding && (
          <AddProduct onClose={closeAdd} onAdd={addProduct} />
        )}
      </div>
    </div>
  );
};

export default Available;