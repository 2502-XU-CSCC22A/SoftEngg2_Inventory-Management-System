import React, { useState } from 'react';
import { Navbar } from './Navbar';
import EditAvailable from './editavailable';
import AddProduct from './addproduct';
import styles from './Available.module.css';
import { useProducts } from '../../hooks/useProducts.js';
import { formatToPesos } from '../../utils/utils.js';
import fallback from "../../assets/fallback.png"
import { MdFileUpload } from 'react-icons/md';

const Available = () => {
  const API_BASE_URL = 'http://localhost:3000';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showStillOffered, setShowStillOffered] = useState(false);

  const { query, updateMutation, insertMutation, updateImageMutation } = useProducts(!showStillOffered);
  const { query: queryAll } = useProducts(undefined);

  const isLoading = query.isLoading
  const isError = query.isError 

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
    setShowStillOffered(prev => !prev);
  };

  const saveProduct = (updatedValues) => {
    updateMutation.mutate({ product_id: selectedProduct.product_id, ...updatedValues });
    closeEdit();
  };

  const addProduct = (newValues) => {
    insertMutation.mutate(newValues);
    closeAdd();
  }

  const productsData = query.data?.data || [];

  const filteredProducts = productsData.filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_id.toString().includes(searchTerm)
  );

  const handleChangeImage = (e, productId) => {
    console.log(productId);
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    const img = new Image();

    img.onload = () => {
      const width = img.width;
      const height = img.height;

      if (width < 300 || height < 300) {
        alert(`Image too small! Please upload an image at least 300x300. Yours is ${width}x${height}.`);
        e.target.value = "";
        URL.revokeObjectURL(objectUrl);
        return;
      }

      // Example B: Reject extreme panoramas (e.g., width is more than 2x the height)
      if (width / height > 2 || height / width > 2) {
        alert("Image is too stretched! Please pick a more proportional photo.");
        e.target.value = "";
        URL.revokeObjectURL(objectUrl);
        return;
      }

      URL.revokeObjectURL(objectUrl);

      const formData = new FormData();
      formData.append('image', file);

      for (let [key, value] of formData.entries()) {
        console.log(`Sending FormData -> Key: ${key}, Value:`, value);
      }

      updateImageMutation.mutate({ productId, formData });

      e.target.value = "";
    };

    img.src = objectUrl;
  };

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
                <input id="show-hidden" htmlFor="show-hidden" type="checkbox" checked={showStillOffered} onChange={handleToggle} />
                <label htmlFor="show-hidden" className={styles['show-hidden-label']}>Show Hidden Only</label>
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
                    <div className={styles['img-container']}>
                      <img src={product.product_img_url === null ? `${fallback}` : `${API_BASE_URL}/images/${product.product_img_url}`}></img>
                      {
                        product.is_still_offered && (
                          <>
                            <input id={`upload-file-${product.product_id}`} type="file" hidden onChange={(e) => handleChangeImage(e, product.product_id)} />
                            <label htmlFor={`upload-file-${product.product_id}`} className={styles['upload-btn']}> <MdFileUpload className={styles['upload-icon']} /> </label>
                          </>
                        )
                      }
                    </div>
                    <h3 className={styles['product-name']}>{product.product_name}</h3>
                    <div className={styles['product-details']}>
                      <p className={styles.quantity}>Quantity: {product.product_quantity}</p>
                      <p className={styles['product-id']}>ID: {product.product_id}</p>
                    </div>
                    <p className={styles.price}>{formatToPesos(product.product_unit_price)}</p>
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
          <AddProduct onClose={closeAdd} onAdd={addProduct} productsList={queryAll.data?.data}/>
        )}
      </div>
    </div>
  );
};

export default Available;