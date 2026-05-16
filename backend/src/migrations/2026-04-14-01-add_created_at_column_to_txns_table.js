import { DataTypes, Sequelize } from "sequelize";

export const up = async ({context: queryInterface }) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
        await queryInterface.addColumn('transactions', 'created_at', {
            type: DataTypes.DATE,
            allowNull: false,
            default: Sequelize.fn('now')
        }, { transaction })
    }
    catch {
        await transaction.rollback();
        throw error;
    }
}

export const down = async ({ context: queryInterface }) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
        await queryInterface.removeColumn('transactions', 'created_at', { transaction });
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
}