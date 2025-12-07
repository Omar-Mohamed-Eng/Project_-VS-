```
root/
│── server.js                 # App entry point
│── package.json
│── DDL.sql                   # DB creation
│
│
├── config/
│   └── db.js                 # Database connection (moved from root)
│
├── routes/
│   ├── auth.routes.js        # Login, signup
│   ├── tasks.routes.js       # Tasks API
│   ├── projects.routes.js    # Projects API
│   ├── comments.routes.js    # Comments API
│   ├── notifications.routes.js
│   ├── reports.routes.js
│   └── uploads.routes.js
│
├── controllers/
│   ├── auth.controller.js
│   ├── tasks.controller.js
│   ├── projects.controller.js
│   ├── comments.controller.js
│   ├── notifications.controller.js
│   ├── reports.controller.js
│   └── uploads.controller.js
│
├── models/
│   ├── users.model.js
│   ├── tasks.model.js
│   ├── projects.model.js
│   ├── comments.model.js
│   ├── notifications.model.js
│   └── files.model.js
│
├── middleware/
│   ├── upload.middleware.js   # Multer
│   └── auth.middleware.js     # Token validation, session, etc.
│
├── project/                    
│   ├── public.html             # page skeleton
│   ├── styles.css              # page style
│   └──  app.js                 # all frontend logic
│  
│   
│
└── uploads/                   # **user uploaded files**
```
