import React, { useState } from 'react';
import { Navbar } from './Navbar';
import EditAvailable from './editavailable';
import AddProduct from './addproduct';
import styles from './Available.module.css';
import { useProducts } from '../../hooks/useProducts.js';

const Available = () => {
  const { data: products, isLoading, isError, updateMutation, insertMutation } = useProducts();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

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

  const saveProduct = (updatedValues) => {
    updateMutation.mutate({ product_id: selectedProduct.product_id, ...updatedValues });
    closeEdit();
  };

  const addProduct = (newValues) => {
    insertMutation.mutate(newValues);
    closeAdd();
  }

  const filteredProducts = (products.data || []).filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_id.toString().includes(searchTerm)
  );

  return (
    <>
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
            <button className={styles.add} onClick={openAdd}>ADD</button>
          </div>

          <div className={styles.header}>
            <h1>Available Product</h1>
          </div>

          <div className={styles['product-grid-wrapper']}>
            <div className={styles['product-list']}>
              {filteredProducts.map((product) => (
                <div key={product.product_id} className={styles['product-card']}>
                  <div className={styles['card-content']}>
                    <h3 className={styles['product-name']}>{product.product_name}</h3>
                    <div className={styles['product-details']}>
                      <p className={styles.quantity}>Quantity: {product.product_quantity}</p>
                      <p className={styles['product-id']}>ID: {product.product_id}</p>
                    </div>
                    <p className={styles.price}>{product.product_unit_price}</p>
                  </div>
                  <button className={styles.edit} onClick={() => openEdit(product)}>Edit</button>
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
    </>
  );
};

export default Available;