# Blog Management Platform API

A robust, containerized backend system for managing blogs with role-based access control (RBAC) and **automatic AI-powered content summarization**.

Built as part of the Technical Assignment for the **Decryptogen Backend Engineer Intern** position.

---

## 🚀 Key Features

* **3-Layer Architecture:** (Controller → Service → Repository) for separation of concerns and maintainability.
* **AI-Powered Summarization:** Automatically generates concise summaries using **Google Gemini AI**.
* **Resilient Fallback System:** If the AI service fails, a custom heuristic algorithm ensures a summary is still generated.
* **Role-Based Access Control (RBAC):** Granular permissions for `Admin`, `User`, and `Owner` roles.
* **Security First:** Implements `Helmet` for headers, `Bcrypt` for hashing, and `Zod` for strict input validation.
* **Dockerized:** Full production-ready setup with MySQL and Node.js containers.
* **Swagger Documentation:** Interactive API docs available at `/api-docs`.

---

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MySQL 8.0
* **Containerization:** Docker & Docker Compose
* **AI Integration:** Google Gemini Flash Model
* **Validation:** Zod
* **Documentation:** Swagger UI

---

## ⚙️ Setup Instructions

### Option 1: Run with Docker (Recommended)
*Per the assignment requirements, this is the primary way to run the application.*

1.  **Clone the repository:**
    ```bash
    git clone <YOUR_REPO_LINK>
    cd blog-backend
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
    * **Health:** `http://localhost:3000/health` (if implemented)

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
| `POST` | `/blogs` | Auth | Create a blog (Triggers AI Summary) |
| `GET` | `/blogs` | Public | Get all blogs (Paginated) |
| `PUT` | `/blogs/:id` | Owner/Admin | Update blog content |
| `DELETE` | `/blogs/:id` | Admin | Delete a blog |

---

## 🗄️ Database Schema Explanation

The database consists of two normalized tables designed for scalability and data integrity.

### 1. `users` Table
Handles authentication and authorization.
* **`id`**: Primary Key.
* **`role`**: ENUM(`'admin'`, `'user'`, `'editor'`) to enforce RBAC policies strictly at the database level.
* **`password_hash`**: Stores bcrypt-hashed passwords (never plaintext).
* **Indexes**: `email` is indexed for O(1) login lookups.

### 2. `blogs` Table
Stores content and relationships.
* **`author_id`**: Foreign Key linking to `users.id`. Used to verify "Owner" permission.
* **`summary`**: Stores the processed summary (AI or Fallback) to avoid re-calculation on read.
* **`ON DELETE CASCADE`**: Ensures that if a user is deleted, their blogs are removed automatically to prevent orphaned records.

---

## 🧪 Testing & Postman

A Postman collection is included in the root directory: `Blog_API.postman_collection.json`.

**To Import:**
1.  Open Postman.
2.  Click **Import** -> Upload the JSON file.
3.  Use the `Login` request first to get a token, then paste it into the "Authorization" tab (Bearer Token) for protected routes.

---

## 👨‍💻 Engineering Decisions

1.  **Resilience over Perfection:** The summarization service uses a "Circuit Breaker" style logic. If the Google Gemini API fails (network/quota), it gracefully degrades to a heuristic sentence extraction algorithm.
2.  **Clean Architecture:** Business logic is isolated in `services/`, keeping `controllers/` lean and focused on HTTP handling.
3.  **Security:** Used `helmet` for HTTP header security and avoided unmaintained libraries (replaced `node-summary` with custom safe implementation).