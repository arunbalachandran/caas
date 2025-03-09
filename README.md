# Container Management System

A web application for managing containers on a server with JWT authentication, dashboard monitoring, and dynamic container operations.

## Features

### 1. Authentication
- Secure login page with username/password
- JWT-based authentication system
- Automatic dashboard redirect after successful login

### 2. Dashboard
Comprehensive container monitoring interface displaying:
- Container Name
- Container ID
- Uptime
- Image Used
- Status
- System Details

### 3. Container Operations

#### Cloning
- One-click container cloning
- Automatic unique ID assignment
- Property inheritance from source container

#### Creation
New containers can be created with:
- Custom name
- Base image selection (Ubuntu, Nginx, MySQL, etc.)
- Environment variables
- Resource limits (CPU, Memory)

#### Management
- Container stopping
- Container removal
- Resource cleanup

## Workflow

### Authentication Flow
1. User submits credentials
2. System generates JWT token
3. Token stored in client
4. Redirect to dashboard

### Dashboard Operations
1. Automatic container list retrieval
2. Tabular display of container information
3. Action buttons for container management

### Container Management
1. Create new containers via form submission
2. Clone existing containers
3. Monitor container status
4. Stop and remove containers


## Tech Stack

| Component | Technology Options |
|-----------|-------------------|
| Frontend | React Native |
| Backend | Java SpringBoot, Python |
| Authentication | JWT |
| Container Engine | Docker API |
| Database | PostgreSQL / MongoDB |
| Deployment | Cloud / On-premises |

## Roadmap

- [ ] Container logs and metrics
- [ ] Resource monitoring
- [ ] Role-based access control (RBAC)
- [ ] Container lifecycle management
- [ ] Performance optimization
- [ ] Multi-user support

## Development

[Add development setup instructions here]

## Deployment
[Add deployment instructions here]


## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);
```

### Containers Table
```sql
CREATE TABLE containers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    container_name VARCHAR(100) NOT NULL,
    docker_id VARCHAR(64) UNIQUE NOT NULL,
    image_name VARCHAR(255) NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    cpu_limit INTEGER,
    memory_limit INTEGER,
    environment_vars JSONB,
    ports JSONB,
    is_active BOOLEAN DEFAULT true
);
```

### Container_Logs Table
```sql
CREATE TABLE container_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    container_id UUID REFERENCES containers(id),
    log_type VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### User_Actions Table
```sql
CREATE TABLE user_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,
    container_id UUID REFERENCES containers(id),
    action_details JSONB,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Project Structure
```
container-management-system/
├── frontend/                    # React Native frontend
│   ├── src/
│   │   ├── assets/              # Images, fonts, etc.
│   │   │   ├── common/          # Shared components
│   │   │   ├── containers/      # Container-related components
│   │   │   └── auth/            # Authentication components
│   │   ├── screens/             # Screen components
│   │   ├── navigation/          # Navigation configuration
│   │   ├── services/            # API services
│   │   ├── store/               # State management
│   │   ├── utils/               # Helper functions
│   │   └── config/              # App configuration
│   ├── tests/                   # Frontend tests
│   └── package.json
│
├── backend/                     # Java Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/cms/
│   │   │   │   ├── config/     # Configuration files
│   │   │   │   ├── controllers/# API endpoints
│   │   │   │   ├── models/     # Data models
│   │   │   │   ├── repositories/# Data access
│   │   │   │   ├── services/   # Business logic
│   │   │   │   ├── security/   # Security configuration
│   │   │   │   └── utils/      # Helper classes
│   │   │   └── resources/      # Application properties
│   │   └── test/               # Backend tests
│   ├── pom.xml
│   └── Dockerfile
│
├── python-services/            # Python microservices
│   ├── container_manager/      # Container management service
│   ├── monitoring/             # Monitoring service
│   └── logging/                # Logging service
│
├── docker/                     # Docker configuration
│   ├── docker-compose.yml
│   └── nginx/                  # Nginx configuration
│
├── docs/                       # Documentation
│   ├── api/
│   └── setup/
│
└── scripts/                    # Deployment and utility scripts
```

## Running the application
### Prerequisites
- Docker and Docker Compose installed
- Node.js 16+ and npm
- Java 11+ and Maven
- Python 3.8+

### Development Setup

1. Clone the repository:
2. Run the docker-compose service
  ```
  docker-compose up -d postgres
  ```
3. For python-services
  ```
  # In the python-services folder
  # Create and activate a virtual environment (recommended)
  python3 -m venv venv
  source venv/bin/activate  # On Windows, use: venv\Scripts\activate
  
  # Install the required packages
  python3 -m pip install flask docker python-dotenv gunicorn
  
  # run the app
  python3 app.py
  ```
4. For frontend
  ```
  cd frontend
  npm install  # Install dependencies
  npm start    # Start the development server
  ```
5. For the SpringBackend
  ```
  # Navigate to the backend directory
  cd backend
  
  # Build the project using Maven
  mvn clean install
  
  # Run the Spring Boot application
  mvn spring:run
  ```