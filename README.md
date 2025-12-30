# Movie Reviews Microservice

A RESTful API microservice designed to handle movie reviews, ratings, and analytics. Built with **Node.js**, **TypeScript**, and **MongoDB**.

This service is part of a distributed system and acts as a secondary microservice that validates data against a primary **Spring Boot Movie Service**.

## Tech Stack

- **Runtime:** Node.js (v18+)
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose ODM)
- **Testing:** Jest, Supertest, MongoDB Memory Server
- **Containerization:** Docker & Docker Compose
- **Architecture:** Microservices, MVC

## Features

- **Review Management:** Create and retrieve reviews for specific movies.
- **External Validation:** Validates movie existence by communicating with the external Spring Boot API.
- **Advanced Querying:** Pagination, sorting, and filtering support.
- **Aggregation:** Efficient batch counting of reviews using MongoDB Aggregation Pipeline (optimized performance).
- **Dockerized:** Ready-to-use Docker Compose setup for MongoDB.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- [Docker](https://www.docker.com/) installed (for database)
- Running instance of the **Movie Spring Boot Service** (for validation)

### 1. Clone the repository
```bash
git clone https://github.com/1vanytska/movie-reviews-api.git
cd movie-reviews-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configuration (.env)
Create a .env file in the root directory based on the following template:

```Properties
PORT=3000
MONGO_URI=mongodb://localhost:27017/movie-reviews
# URL of the external Spring Boot Service to check if a movie exists
SPRING_API_URL=http://localhost:8080/api/movies
```

### 4. Start Database (Docker)
Start MongoDB and Mongo Express (GUI) using Docker Compose:

```bash
docker-compose up -d
```

- MongoDB: localhost:27017
- Mongo Express (GUI): http://localhost:8081

### 5. Run the Application
Development Mode (with hot-reload):

```bash
npm run dev
```

## API Reference
### 1. Create a Review
Creates a new review. Validates that the ```movieId``` exists in the external system.

- URL: ```POST /api/reviews```
- Body:
```JSON 
{
  "movieId": 1,
  "author": "Alice",
  "text": "Amazing cinematography!",
  "rating": 9
}
```

### 2. Get Reviews
Retrieves a list of reviews for a specific movie (sorted by newest).

- URL: ```GET /api/reviews```

- Query Parameters:

    - ```movieId``` (required): ID of the movie.

    - ```size``` (optional): Number of records to return (default: 10).

    - ```from``` (optional): Number of records to skip (default: 0).

- Example: ```GET /api/reviews?movieId=1&size=5&from=0```

### 3. Get Review Counts (Batch)
Returns the total count of reviews for a list of movies. Uses MongoDB Aggregation to avoid loading entities into memory.

- URL: ```POST /api/reviews/_counts```

- Body:
```JSON
{
  "movieIds": [1, 2, 5, 999]
}
```

- Response:
```JSON
{
  "1": 15,
  "2": 3,
  "5": 0,
  "999": 0
}
```

## Testing
The project includes both Unit and Integration tests using Jest and mongodb-memory-server (in-memory database).

Run all tests:
```bash
npm test
```