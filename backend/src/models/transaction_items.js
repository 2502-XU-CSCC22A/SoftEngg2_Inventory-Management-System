import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class transaction_items extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    item_id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'transactions',
        key: 'transaction_id'
      }
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'product_id'
      }
    },
    product_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    product_unit_price: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity_bought: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'transaction_items',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "pk_item_id",
        unique: true,
        fields: [
          { name: "item_id" },
        ]
      },
    ]
  });
  }
}
