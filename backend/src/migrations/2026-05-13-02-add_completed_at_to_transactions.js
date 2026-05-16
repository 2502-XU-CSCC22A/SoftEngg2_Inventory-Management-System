import { Sequelize } from 'sequelize';

/**
 * Migration to add 'completed_at' column to the transactions table.
 * Also backfills existing 'completed' transactions with their 'created_at' timestamp.
 */
export async function up({ context: queryInterface }) {
  await queryInterface.addColumn('transactions', 'completed_at', {
    type: Sequelize.DATE,
    allowNull: true,
  });

  // Backfill existing completed transactions
  await queryInterface.sequelize.query(
    `UPDATE transactions SET completed_at = created_at WHERE status = 'completed' AND completed_at IS NULL`
  );
}

export async function down({ context: queryInterface }) {
  await queryInterface.removeColumn('transactions', 'completed_at');
}
