import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _SequelizeMeta from  "./SequelizeMeta.js";
import _products from  "./products.js";
import _transaction_items from  "./transaction_items.js";
import _transactions from  "./transactions.js";
import _users from  "./users.js";
import _activity_logs from "./activity_logs.js";

export default function initModels(sequelize) {
  const SequelizeMeta = _SequelizeMeta.init(sequelize, DataTypes);
  const users = _users.init(sequelize, DataTypes);
  const products = _products.init(sequelize, DataTypes);
  const transactions = _transactions.init(sequelize, DataTypes);
  const transaction_items = _transaction_items.init(sequelize, DataTypes);
  const activity_logs = _activity_logs.init(sequelize, DataTypes);

  transaction_items.belongsTo(products, { as: "product", foreignKey: "product_id"});
  products.hasMany(transaction_items, { as: "transaction_items", foreignKey: "product_id"});
  transaction_items.belongsTo(transactions, { as: "transaction", foreignKey: "transaction_id"});
  transactions.hasMany(transaction_items, { as: "transaction_items", foreignKey: "transaction_id"});
  transactions.belongsTo(users, { as: "created_by_user", foreignKey: "created_by"});
  users.hasMany(transactions, { as: "transactions", foreignKey: "created_by"});
  activity_logs.belongsTo(users, { as: "performed_by_user", foreignKey: "performed_by"});
  users.hasMany(activity_logs, { as: "activity_logs", foreignKey: "performed_by"});

  return {
    SequelizeMeta,
    products,
    transaction_items,
    transactions,
    users,
    activity_logs,
  };
}
