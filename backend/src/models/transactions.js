import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class transactions extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    transaction_id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    prev_txn_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    transaction_timestamp: {
      type: DataTypes.DATE,
      allowNull: false
    },
    payment_type: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    payment_refstr: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('now')
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    voided_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'transactions',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "pk_transaction_id",
        unique: true,
        fields: [
          { name: "transaction_id" },
        ]
      },
    ]
  });
  }
}