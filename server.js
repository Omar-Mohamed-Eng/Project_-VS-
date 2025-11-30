// server.js
const express = require("express");
const cors = require("cors");
const pool = require("./db"); // اتصال MySQL من db.js

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Route على / عشان ما تتلغبطش
app.get("/", (req, res) => {
  res.send("API is running");
});

// ✅ Route بسيط للتجربة
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// ✅ Route يعرض كل الـ users (للتست)
app.get("/api/test-users", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT user_id, name, email, password_hash FROM users"
    );
    res.json(rows);
  } catch (err) {
    console.error("TEST USERS ERROR:", err);
    res.status(500).json({ message: "Error loading users" });
  }
});

// ✅ Sign Up API (جديد)
app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body;
  console.log("SIGNUP TRY:", name, email);

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const [existing] = await pool.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, password]
    );

    const [rows] = await pool.query(
      "SELECT user_id, name, email, role FROM users WHERE email = ?",
      [email]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Login API (نسخة للتشخيص)
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("LOGIN TRY:", email, password);

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      console.log("EMAIL NOT FOUND");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];
    console.log("USER ROW:", user);

    // 👈 المقارنة حسب طريقتك الحالية (plain text)
    if (user.password_hash !== password) {
      console.log(
        "WRONG PASSWORD. DB:",
        user.password_hash,
        "INPUT:",
        password
      );
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // لو كله تمام
    res.json({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Dashboard stats API
app.get("/api/dashboard", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(status = 'done') AS done,
        SUM(status = 'in_progress') AS in_progress,
        SUM(status = 'todo') AS todo,
        SUM(status != 'done' AND due_date < CURDATE()) AS overdue
      FROM tasks;
    `);

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error loading dashboard" });
  }
});
// ============================
// ✅ Projects APIs
// ============================

// GET /api/projects?user_id=1 --> كل المشاريع بتاعة يوزر معيّن
app.get("/api/projects", async (req, res) => {
  const userId = req.query.user_id;

  if (!userId) {
    return res.status(400).json({ message: "user_id is required" });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        project_id,
        name,
        description,
        created_by,
        created_at
      FROM projects
      WHERE created_by = ?         -- ✅ بدل user_id
      ORDER BY created_at DESC
    `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET PROJECTS ERROR:", err);
    res.status(500).json({ message: "Error loading projects" });
  }
});

// POST /api/projects --> إنشاء مشروع جديد
app.post("/api/projects", async (req, res) => {
  const { name, description, status, user_id } = req.body;

  if (!name || !user_id) {
    return res.status(400).json({ message: "name and user_id are required" });
  }

  try {
    // لو عندك عمود status في الجدول ممكن تستخدمه، لو لأ هنتجاهله
    // const projectStatus = status || "active";

    // ✅ هنا بافترض إن جدول projects = (project_id, name, description, created_by, created_at)
    const [result] = await pool.query(
      `
      INSERT INTO projects (name, description, created_by)
      VALUES (?, ?, ?)
    `,
      [name, description || null, user_id]
    );

    const insertedId = result.insertId;

    const [rows] = await pool.query(
      `
      SELECT 
        project_id,
        name,
        description,
        created_by,
        created_at
      FROM projects
      WHERE project_id = ?
    `,
      [insertedId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("CREATE PROJECT ERROR:", err); // 👈 شوف الرسالة دي في التيرمنال لو لسه في مشكلة
    res.status(500).json({ message: "Error creating project" });
  }
});

// ============================
// ✅ Tasks APIs
// ============================

// GET /api/projects/:id/tasks --> كل التاسكات الخاصة ببروجيكت معيّن
app.get("/api/projects/:id/tasks", async (req, res) => {
  const projectId = req.params.id;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        task_id,
        title,
        status,
        priority,
        assigned_to,
        due_date,
        project_id,
        created_at,
        description
      FROM tasks
      WHERE project_id = ?
      ORDER BY due_date IS NULL, due_date
    `,
      [projectId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET TASKS ERROR:", err);
    res.status(500).json({ message: "Error loading tasks" });
  }
});

// POST /api/tasks --> إنشاء Task جديد
app.post("/api/tasks", async (req, res) => {
  const { project_id, title, status, priority, assigned_to, due_date } =
    req.body;

  if (!project_id || !title) {
    return res
      .status(400)
      .json({ message: "project_id and title are required" });
  }

  try {
    const taskStatus = status || "todo";
    const taskPriority = priority || "medium";

    const [result] = await pool.query(
      `
      INSERT INTO tasks (project_id, title, status, priority, assigned_to, due_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        project_id,
        title,
        taskStatus,
        taskPriority,
        assigned_to || null,
        due_date || null,
      ]
    );

    const insertedId = result.insertId;

    const [rows] = await pool.query(
      `
      SELECT 
        task_id,
        title,
        status,
        priority,
        assigned_to,
        due_date,
        project_id,
        created_at,
        description
      FROM tasks
      WHERE task_id = ?
    `,
      [insertedId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    res.status(500).json({ message: "Error creating task" });
  }
});

// PUT /api/tasks/:id --> تعديل status / priority / assigned_to
app.put("/api/tasks/:id", async (req, res) => {
  const taskId = req.params.id;
  const { status, priority, assigned_to } = req.body;

  if (!status && !priority && !assigned_to) {
    return res
      .status(400)
      .json({ message: "Nothing to update (status/priority/assigned_to)" });
  }

  try {
    const fields = [];
    const params = [];

    if (status) {
      fields.push("status = ?");
      params.push(status);
    }
    if (priority) {
      fields.push("priority = ?");
      params.push(priority);
    }
    if (assigned_to !== undefined) {
      fields.push("assigned_to = ?");
      params.push(assigned_to || null);
    }

    params.push(taskId);

    const sql = `UPDATE tasks SET ${fields.join(", ")} WHERE task_id = ?`;
    await pool.query(sql, params);

    const [rows] = await pool.query(
      `
      SELECT 
        task_id,
        title,
        status,
        priority,
        assigned_to,
        due_date,
        project_id,
        created_at,
        description
      FROM tasks
      WHERE task_id = ?
    `,
      [taskId]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error("UPDATE TASK ERROR:", err);
    res.status(500).json({ message: "Error updating task" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
