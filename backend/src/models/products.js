import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class products extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    product_id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    product_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "products_product_name_key"
    },
    product_unit_price: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    product_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    product_img_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_still_offered: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
  }, {
    sequelize,
    tableName: 'products',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "pk_product_id",
        unique: true,
        fields: [
          { name: "product_id" },
        ]
      },
      {
        name: "uq_product_name",
        unique: true,
        fields: [
          { name: "product_name" },
        ]
      },
    ]
  });
  }
}
