// seed-admin-permissions-to-superadmin.js
const { QueryTypes } = require('sequelize');
const sequelize = require('../src/config/db'); // make sure this path is correct

module.exports = {
  up: async () => {
    try {
      // Get super admin
      const superAdmins = await sequelize.query(
        'SELECT admin_id FROM admin WHERE is_superadmin = 1 LIMIT 1',
        { type: QueryTypes.SELECT }
      );

      if (!superAdmins || superAdmins.length === 0) {
        console.log('No super admin found. Skipping permission assignment.');
        return;
      }

      const superAdmin = superAdmins[0];

      // Get all permissions
      const permissions = await sequelize.query(
        'SELECT permission_id FROM permission',
        { type: QueryTypes.SELECT }
      );

      if (!permissions || permissions.length === 0) {
        console.log('No permissions found. Make sure you seeded permissions first.');
        return;
      }

      // Prepare bulk insert values
      const values = permissions
        .map(p => `(${superAdmin.admin_id}, ${p.permission_id}, 1, NOW(), NOW())`)
        .join(',');

      // Assign all permissions to super admin
      await sequelize.query(
        `INSERT IGNORE INTO admin_permission (admin_id, permission_id, granted, created_at, updated_at) VALUES ${values}`
      );

      console.log('✅ Super admin permissions assigned successfully.');
    } catch (err) {
      console.error('Seeder error:', err);
    }
  },

  down: async () => {
    try {
      await sequelize.query(`
        DELETE ap
        FROM admin_permission ap
        INNER JOIN admin a ON ap.admin_id = a.admin_id
        WHERE a.is_superadmin = 1
      `);
      console.log('✅ Super admin permissions removed.');
    } catch (err) {
      console.error('Seeder down error:', err);
    }
  },
};
