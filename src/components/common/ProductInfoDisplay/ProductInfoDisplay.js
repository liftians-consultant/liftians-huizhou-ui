import React from 'react';
import PropTypes from 'prop-types';
import { Image, Label } from 'semantic-ui-react';
import './ProductInfoDisplay.css';
import ImageNotFound from '../../../assets/images/no_photo_available.jpg';

const productImgBaseUrl = process.env.REACT_APP_IMAGE_BASE_URL;

const ProductInfoDisplay = ({ product, amount, currentBarcode, showBox, binColor, unit }) => {
  const imageUrl = `${productImgBaseUrl}${product.productID}.png`;

  return (
    <div className="product-info-block">
      <div className="product-remain-container">
        <span className="remain-amount">
          {amount}
        </span>
        <div className="remain-unit">
          {unit}
        </div>
      </div>
      { !showBox ? (
        <div className="product-info-container">
          <div className="product-image-container">
            <Image className="product-image" src={imageUrl} onError={(e) => { e.target.src = ImageNotFound; }} />
          </div>

          <div className="product-name-container">
            <span className="product-name">
              {product.productName}
            </span>
            <br />
            <br />
            { currentBarcode !== '' && (
              <Label size="huge">
                {currentBarcode}
              </Label>
            )}
          </div>
        </div>
      ) : (
        <div className="product-info-container">
          <div className="bin-container">
            <div
              className="bin-object"
              style={({ backgroundColor: `#${binColor}` })}
            />
          </div>
        </div>
      )}
    </div>
  );
};

ProductInfoDisplay.defaultProps = {
  currentBarcode: '',
  showBox: false,
  binColor: 'fff',
  unit: 'item',
};

ProductInfoDisplay.propTypes = {
  product: PropTypes.object.isRequired,
  amount: PropTypes.number.isRequired,
  currentBarcode: PropTypes.string,
  showBox: PropTypes.bool,
  binColor: PropTypes.string,
  unit: PropTypes.string,
};

export default ProductInfoDisplay;
