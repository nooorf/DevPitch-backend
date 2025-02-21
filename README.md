# DevPitch Backend

DevPitch is a platform where engineering and computer science students can pitch their ideas, showcase their ongoing or completed projects, and collaborate with others. This repository contains the backend code for the DevPitch platform.

## Features
- User authentication and authorization (JWT-based authentication)
- CRUD operations for projects and ideas
- Collaboration request management
- User profile and contribution tracking
- API endpoints for frontend integration

## Tech Stack
- **Framework:** Express.js 
- **Database:** MongoDB 
- **Authentication:** JSON Web Tokens (JWT)
- **API Documentation:** Swagger
- **Environment Management:** dotenv for environment variables

## Getting Started

### Prerequisites
Ensure you have the following installed:
- Node.js (v16 or later)
- npm or yarn
- SQLite or PostgreSQL

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/nooorf/DevPitch-backend.git
   cd DevPitch-backend
   ```
2. Install dependencies:
   ```sh
   npm install  # or yarn install
   ```
3. Create an `.env` file in the root directory and add the necessary environment variables:
   ```env
   DATABASE_URL=your_database_connection_string
   JWT_SECRET=your_secret_key
   PORT=5000
   ```
4. Start the development server:
   ```sh
   npm run dev  # or yarn dev
   ```
5. The API will be available at `http://localhost:5000`.

## API Endpoints
| Method | Endpoint               | Description                     |
|--------|------------------------|---------------------------------|
| GET    | /api/projects          | Get all projects               |
| POST   | /api/projects          | Create a new project           |
| GET    | /api/projects/:id      | Get project details            |
| PUT    | /api/projects/:id      | Update project information     |
| DELETE | /api/projects/:id      | Delete a project               |
| POST   | /api/auth/signup       | Register a new user            |
| POST   | /api/auth/login        | User login                     |


## License
This project is licensed under the MIT License. See the `LICENSE` file for details.


