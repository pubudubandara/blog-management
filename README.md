# Blog Management Platform API

A robust, containerized backend system for managing blogs with role-based access control (RBAC) and **automatic AI-powered content summarization**.

---

## 🚀 Key Features

* **3-Layer Architecture:** (Controller → Service → Repository) for separation of concerns and maintainability.
* **AI-Powered Summarization:** Automatically generates concise summaries using **Google Gemini AI**.
* **Resilient Fallback System:** If the AI service fails, a custom heuristic algorithm ensures a summary is still generated.
* **Role-Based Access Control (RBAC):** Strict permissions for `Admin` and `User` roles.
* **Professional Logging:** Structured logging using **Winston** (errors/info) and **Morgan** (HTTP requests) for debugging.
* **Dockerized:** Full production-ready setup with MySQL and Node.js containers.
* **Swagger Documentation:** Interactive API docs available at `/api-docs`.

---

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MySQL 8.0
* **Containerization:** Docker & Docker Compose
* **AI Integration:** Google Gemini Flash Model
* **Logging:** Winston & Morgan
* **Validation:** Zod
* **Documentation:** Swagger UI

---

## ⚙️ Setup Instructions

### Option 1: Run with Docker (Recommended)
*Per the assignment requirements, this is the primary way to run the application.*

1.  **Clone the repository:**
    ```bash
    git clone <YOUR_REPO_LINK>
    cd backend
    ```

2.  **Configure Environment:**
    Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
    *(Optional: Add your `GEMINI_API_KEY` in `.env` to enable AI features. If left blank, the system uses the fallback summarizer.)*

3.  **Start the System:**
    ```bash
    docker-compose up --build
    ```

4.  **Verify:**
    * **API:** Running at `http://localhost:3000`
    * **Docs:** `http://localhost:3000/api-docs`
    * **Health:** `http://localhost:3000/health`

### Option 2: Run Locally (Manual)

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Database Setup:**
    * Ensure you have a local MySQL instance running.
    * Create a database named `blog_db`.
    * Import the `schema.sql` file manually.

3.  **Run Server:**
    ```bash
    npm run dev
    ```

---

## 📖 API Documentation

Complete, interactive documentation is available via Swagger UI once the server is running.

**URL:** `http://localhost:3000/api-docs`

### Core Endpoints Overview

| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register a new user |
| `POST` | `/auth/login` | Public | Login & receive JWT |
| `GET` | `/users` | **Admin** | Get all users (Paginated) |
| `GET` | `/users/:id` | Auth | Get user details |
| `POST` | `/blogs` | Auth | Create a blog (Triggers AI Summary) |
| `GET` | `/blogs` | Public | Get all blogs (Paginated) |
| `PUT` | `/blogs/:id` | Owner/Admin | Update blog content |
| `DELETE` | `/blogs/:id` | **Admin** | Delete a blog |

**📌 Privacy & Data Filtering for `/users/:id`:**
- **Case 1:** Admin or the user themselves → Returns full details (email, role, etc.)
- **Case 2:** Other authenticated users → Returns public details only (id, username)

---

## 📊 Logging & Debugging

To satisfy the requirement for "Basic testing and debugging practices", this system implements a dual-layer logging strategy:

1.  **HTTP Request Logging (Morgan):**
    * Logs all incoming HTTP requests (method, status, response time) to the console for real-time monitoring.
2.  **Application Logging (Winston):**
    * **Error Logs:** Critical failures are written to `logs/error.log`.
    * **Combined Logs:** General info and warnings are written to `logs/combined.log`.
    * **Console:** In development mode, pretty-printed logs are output to the terminal.

---

## 🗄️ Database Schema

The database consists of two normalized tables designed for scalability and data integrity.

### 1. `users` Table
```sql
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);

```

**Key Points:**

* **`id`**: Primary Key.
* **`username`**: Unique identifier for public display.
* **`email`**: Unique, indexed for fast login lookups.
* **`password_hash`**: Stores bcrypt-hashed passwords (never plaintext).
* **`role`**: ENUM(`'admin'`, `'user'`) to enforce RBAC policies at the database level.

### 2. `blogs` Table

```sql
CREATE TABLE IF NOT EXISTS blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    author_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_blogs_author ON blogs(author_id);

```

**Key Points:**

* **`author_id`**: Foreign Key linking to `users.id`. Used to verify "Owner" permission.
* **`summary`**: Stores the AI/fallback-generated summary to avoid re-calculation on read.
* **`ON DELETE CASCADE`**: Ensures that if a user is deleted, their blogs are removed automatically.
* **`updated_at`**: Automatically updates on record modification.

---

## 🧪 Testing

A Postman collection is included in the root directory: `Blog_API.postman_collection.json`.

**To Import:**

1. Open Postman.
2. Click **Import** -> Upload the JSON file.
3. Use the `Login` request first to get a token, then paste it into the "Authorization" tab (Bearer Token) for protected routes.

---

## 👨‍💻 Engineering Decisions

1. **Resilience over Perfection:** The summarization service uses a "Circuit Breaker" style logic. If the Google Gemini API fails (network/quota), it gracefully degrades to a heuristic sentence extraction algorithm.
2. **Clean Architecture:** Business logic is isolated in `services/`, keeping `controllers/` lean and focused on HTTP handling.
3. **Security:** Used `helmet` for HTTP header security and avoided unmaintained libraries (replaced `node-summary` with custom safe implementation).
