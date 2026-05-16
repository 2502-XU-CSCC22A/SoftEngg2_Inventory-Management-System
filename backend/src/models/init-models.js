import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _SequelizeMeta from  "./SequelizeMeta.js";
import _products from  "./products.js";
import _transaction_items from  "./transaction_items.js";
import _transactions from  "./transactions.js";
import _users from  "./users.js";

export default function initModels(sequelize) {
  const SequelizeMeta = _SequelizeMeta.init(sequelize, DataTypes);
  const users = _users.init(sequelize, DataTypes);
  const products = _products.init(sequelize, DataTypes);
  const transactions = _transactions.init(sequelize, DataTypes);
  const transaction_items = _transaction_items.init(sequelize, DataTypes);

  transaction_items.belongsTo(products, { as: "product", foreignKey: "product_id"});
  products.hasMany(transaction_items, { as: "transaction_items", foreignKey: "product_id"});
  transaction_items.belongsTo(transactions, { as: "transaction", foreignKey: "transaction_id"});
  transactions.hasMany(transaction_items, { as: "transaction_items", foreignKey: "transaction_id"});
  transactions.belongsTo(users, { as: "created_by_user", foreignKey: "created_by"});
  users.hasMany(transactions, { as: "transactions", foreignKey: "created_by"});

  return {
    SequelizeMeta,
    products,
    transaction_items,
    transactions,
    users,
  };
}
