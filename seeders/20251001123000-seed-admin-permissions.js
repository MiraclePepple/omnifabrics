// seed-admin-permissions.js

// List of all permissions from your SRS
const PERMISSIONS = [
  // User Management
  'view_buyers',
  'view_sellers',
  'view_suspended_users',
  'view_buyer_purchase_history',
  'view_seller_store_details',
  'view_products_in_seller_store',
  'edit_user_account',
  'suspend_user_account',
  'delete_user_account',
  'send_broadcast_notification',
  'send_specific_notification',

  // Order Management
  'view_all_orders',
  'view_order_details',
  'cancel_order',

  // Store/Product Management
  'disable_store',
  'disable_product',

  // Super Admin Extra Permissions
  'create_admin_account',
  'block_unblock_admin',
  'delete_admin_account',
  'assign_roles_privileges',
  'edit_admin_privileges',
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const records = PERMISSIONS.map((key) => ({
      permission: key,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert('permission', records, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('permission', {
      permission: PERMISSIONS,
    });
  },
};

