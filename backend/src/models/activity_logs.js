import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class activity_logs extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    log_id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    previous_value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    new_value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    performed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('now')
    }
  }, {
    sequelize,
    tableName: 'activity_logs',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "pk_log_id",
        unique: true,
        fields: [
          { name: "log_id" },
        ]
      },
    ]
  });
  }
}
