import { DataTypes, Sequelize } from "sequelize";

export const up = async ({ context: queryInterface }) => {
    // 1. STEP ONE: The Destructive Phase
    const tx1 = await queryInterface.sequelize.transaction();
    try {
        // Drop the constraint first
        await queryInterface.removeConstraint('transaction_items',
            'transaction_items_transaction_id_fkey', { transaction: tx1 });

        // Change types using Raw SQL (Avoids the Identity Column error)
        await queryInterface.sequelize.query(
            'ALTER TABLE transaction_items ALTER COLUMN item_id TYPE INTEGER;', { transaction: tx1 });
        await queryInterface.sequelize.query(
            'ALTER TABLE transactions ALTER COLUMN transaction_id TYPE INTEGER;', { transaction: tx1 });

        // Change foreign key columns
        await queryInterface.changeColumn('transactions', "prev_txn_id",
            { type: DataTypes.INTEGER, allowNull: true }, { transaction: tx1 });
        await queryInterface.changeColumn('transaction_items', 'transaction_id',
            { type: DataTypes.INTEGER, allowNull: false }, { transaction: tx1 });

        await tx1.commit();
    } catch (e) {
        await tx1.rollback();
        throw e;
    }

    // 2. STEP TWO: The Constructive Phase
    // Re-adding constraints requires a fresh lock on the updated types
    const tx2 = await queryInterface.sequelize.transaction();
    try {
        await queryInterface.addConstraint('transaction_items', {
            fields: ['transaction_id'],
            type: 'foreign key',
            name: 'transaction_items_transaction_id_fkey',
            references: { table: 'transactions', field: 'transaction_id' },
            onDelete: "CASCADE", onUpdate: "CASCADE",
        }, { transaction: tx2 });

        await queryInterface.addConstraint('transactions', {
            fields: ['prev_txn_id'],
            type: "foreign key",
            name: "transactions_prev_txn_id_fk",
            references: { table: "transactions", field: "transaction_id" },
            onDelete: "RESTRICT", onUpdate: "CASCADE",
        }, { transaction: tx2 });

        await tx2.commit();
    } catch (e) {
        await tx2.rollback();
        throw e;
    }
}

export const down = async ({ context: queryInterface }) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
        await queryInterface.removeConstraint('transactions', 'transactions_prev_txn_id_fk', { transaction });
        await queryInterface.removeConstraint('transaction_items', 'transaction_items_transaction_id_fkey', { transaction });

        await queryInterface.sequelize.query(
            'ALTER TABLE transactions ALTER COLUMN transaction_id TYPE BIGINT;',
            { transaction }
        );

        await queryInterface.changeColumn('transactions', 'prev_txn_id', {
            type: DataTypes.BIGINT,
            allowNull: true
        }, { transaction });

        await queryInterface.changeColumn('transactions', 'transaction_id', {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true
        }, { transaction });

        await queryInterface.changeColumn('transaction_items', 'item_id', {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true
        }, { transaction });

        // 4. Re-add the original FK constraint between items and transactions
        await queryInterface.addConstraint('transaction_items', {
            fields: ['transaction_id'],
            type: 'foreign key',
            name: 'transaction_items_transaction_id_fkey',
            references: {
                table: 'transactions',
                field: 'transaction_id',
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        }, { transaction });

        await transaction.commit();
    }
    catch (error) {
        await transaction.rollback();
        console.error("Rollback failed:", error);
        throw error;
    }
}