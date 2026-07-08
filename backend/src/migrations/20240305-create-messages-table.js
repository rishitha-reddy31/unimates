'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Messages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      senderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      receiverId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      readAt: {
        type: Sequelize.DATE
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      deletedFor: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        defaultValue: []
      },
      groupId: {
        type: Sequelize.UUID
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('Messages', ['senderId', 'receiverId']);
    await queryInterface.addIndex('Messages', ['receiverId', 'isRead']);
    await queryInterface.addIndex('Messages', ['createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Messages');
  }
};