import models from "../config/db.js";
import { getIO } from "../config/socket.js";

/**
 * Creates an activity log entry.
 * Can optionally participate in an existing Sequelize transaction.
 * After creation, emits a WebSocket event so connected clients update in real-time.
 *
 * @param {Object} logData
 * @param {string} logData.action - Action type, e.g. "TRANSACTION_CREATED"
 * @param {string} logData.module - Module name, e.g. "transactions"
 * @param {string} logData.description - Human-readable description
 * @param {number|null} [logData.reference_id] - ID of the affected record
 * @param {*} [logData.previous_value] - Previous state (will be JSON-stringified if object)
 * @param {*} [logData.new_value] - New state (will be JSON-stringified if object)
 * @param {number|null} [logData.performed_by] - user_id of who performed the action
 * @param {import('sequelize').Transaction} [transaction] - Optional Sequelize transaction
 * @returns {Promise<Object>} The created log entry
 */
export const createActivityLog = async (logData, transaction = null) => {
    try {
        const entry = {
            action: logData.action,
            module: logData.module,
            description: logData.description,
            reference_id: logData.reference_id || null,
            previous_value: logData.previous_value
                ? (typeof logData.previous_value === 'string' ? logData.previous_value : JSON.stringify(logData.previous_value))
                : null,
            new_value: logData.new_value
                ? (typeof logData.new_value === 'string' ? logData.new_value : JSON.stringify(logData.new_value))
                : null,
            performed_by: logData.performed_by || null,
        };

        const options = transaction ? { transaction } : {};
        const log = await models.activity_logs.create(entry, options);

        // Emit real-time event to all connected clients
        try {
            const io = getIO();
            if (io) {
                // Fetch the log with user info for a complete payload
                const fullLog = await models.activity_logs.findByPk(log.log_id, {
                    include: {
                        model: models.users,
                        as: "performed_by_user",
                        attributes: ['user_id', 'username'],
                        required: false,
                    },
                    ...(transaction ? { transaction } : {}),
                });
                io.emit('new-activity-log', fullLog?.toJSON() || log.toJSON());
            }
        } catch (socketError) {
            // Socket emission failure should never break the main flow
            console.error("Failed to emit socket event:", socketError.message);
        }

        return log;
    } catch (error) {
        // Log the error but don't let it break the main operation
        console.error("Failed to create activity log:", error.message);
    }
};

