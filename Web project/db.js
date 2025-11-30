// db.js
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root", // الافتراضي
  password: "Omar@1234", // لو مفيش باسورد
  database: "tasks_db", // حط اسم الداتابيز بتاعتك
});

module.exports = pool;
