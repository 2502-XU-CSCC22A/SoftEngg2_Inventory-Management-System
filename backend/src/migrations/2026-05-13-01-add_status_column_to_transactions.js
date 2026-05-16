export async function up({ context: queryInterface }) {
    const { Sequelize } = await import('sequelize');

    await queryInterface.addColumn('transactions', 'status', {
        type: Sequelize.ENUM('pending', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'completed',
    });
}

export async function down({ context: queryInterface }) {
    const { Sequelize } = await import('sequelize');

    await queryInterface.removeColumn('transactions', 'status');
    await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_transactions_status";'
    );
}
