"use strict";
//import bcrypt from 'bcryptjs';
const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("Super@123", 10);
    await queryInterface.bulkInsert("Admin", [
      {
        email: "superadmin@example.com",
        password: hashedPassword,
        is_superadmin: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Admin", { email: "superadmin@example.com" });
  },
};
