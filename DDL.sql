CREATE DATABASE IF NOT EXISTS tasks_db;
USE tasks_db;
-- 1. جدول المستخدمين
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'Member',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. جدول المشاريع
CREATE TABLE projects (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 3. جدول أعضاء المشروع
CREATE TABLE project_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    user_id INT,
    role_in_project VARCHAR(50) DEFAULT 'Member',
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(project_id, user_id) -- (إضافة مهمة: لمنع تكرار نفس العضو في نفس المشروع)
);

-- 4. جدول المهام
CREATE TABLE tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    assigned_to INT,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    -- استخدام ENUM أفضل في MySQL لتحديد القيم المسموحة
    status ENUM('To-Do', 'In Progress', 'Done') DEFAULT 'To-Do',
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    due_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 5. جدول تعليقات المهام
CREATE TABLE task_comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT,
    user_id INT,
    comment_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 6. جدول ملفات المهام
CREATE TABLE task_files (
    file_id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT,
    file_path VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
);

-- 7. جدول الإشعارات
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);