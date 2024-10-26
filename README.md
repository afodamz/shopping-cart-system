Here's a more detailed version of the `README.md` file for the **Shopping Cart API** project:

---

# Shopping Cart API

This is a scalable shopping cart system where multiple users can purchase products from a shared inventory. The system ensures data consistency, handles concurrent operations, and efficiently manages stock levels. It is designed for high performance, featuring product and cart management, checkout handling, and optimized caching with Redis.

## Features
- **Product & Inventory Management**:
  - Maintain a shared product inventory with stock quantity tracking.
  - Prevent overselling of products by locking stock during concurrent checkouts.
- **Cart Management**:
  - Allow users to add or remove items from their cart.
  - Carts are stored temporarily in Redis for fast access.
- **Checkout Process**:
  - Process checkouts while ensuring stock levels are accurately updated.
  - Transactions ensure that stock quantity is decreased only if the checkout succeeds.
- **Concurrency Control**:
  - Prevent race conditions using Redis-based locks during checkout.
- **Caching**:
  - Implement Redis for fast cart retrieval and frequent data access.

## Tech Stack
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB (for persistent storage)
- **Cache**: Redis (for caching cart data and product inventory)
- **Containerization**: Docker and Docker Compose
- **Validation**: Class-validator and DTOs for request validation

## Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/afodamz/shopping-cart-system.git
cd shopping-cart-system
```

### 2. Install Dependencies
You can use either `npm` or `yarn` to install the project dependencies.

With `npm`:
```bash
npm install
```

With `yarn`:
```bash
yarn install
```

### 3. Configure Environment Variables
Copy the provided `.env.example` file to a `.env` file and update it with your configuration:

```bash
cp .env.example .env
```

Update the `.env` file with the following:

- **MONGO_URI**: Your MongoDB connection string.
- **REDIS_URL**: Redis connection details.
- **PORT**: The port for the API (default is 3000).

Example `.env` configuration:
```env
MONGO_URI=mongodb://localhost:27017/shopping-system
REDIS_URL=redis://localhost:6379
PORT=3000
```

### 4. Run the Application
You can run the application using Docker or directly on your local machine.

#### Running with Docker Compose
Docker Compose will spin up MongoDB, Redis, and the Node.js app.

```bash
docker-compose up
```

#### Running Locally (without Docker)
Make sure MongoDB and Redis are running locally.

```bash
npm run dev
```

or

```bash
yarn dev
```

This will start the application in development mode, watching for file changes.

### 5. Seed Test Data
To populate the database with sample product data, run the seed script:

```bash
npm run seed
```

or with `yarn`:

```bash
yarn seed
```

## Endpoints

### 1. **Product Management**

- **GET /products**: Fetch all products.
  - **Response**: An array of product objects.

- **POST /products**: Add a new product (requires admin privileges).
  - **Request Body**: 
    ```json
    {
      "name": "Product Name",
      "price": 1000,
      "stock": 50
    }
    ```

- **PUT /products/:id**: Update product details (requires admin privileges).
  - **Request Body**: 
    ```json
    {
      "stock": 30
    }
    ```

- **DELETE /products/:id**: Delete a product (requires admin privileges).

### 2. **Cart Management**

- **GET /cart/:userId**: Retrieve the cart for a user.
  - **Response**: Cart object for the specified user.

- **POST /cart/**: Add a product to the user's cart.
  - **Request Body**:
    ```json
    {
      "productId": "product_id_here",
      "quantity": 2
    }
    ```

- **PUT /cart/:userId**: Remove a product from the user's cart.
  - **Request Body**:
    ```json
    {
      "productId": "product_id_here"
    }
    ```

- **POST /cart/:userId/checkout**: Process the user's checkout.

### 3. **Checkout Process**
- **POST /cart/:userId/checkout**: Validates the cart and processes the checkout by adjusting stock levels. Ensures no overselling occurs.

## Postman Collection
API documentation can be found in cardtonic.json

## Key Concepts and Design Decisions

### **Concurrency Handling**
When multiple users attempt to checkout simultaneously, race conditions could arise. To handle this, we use Redis locks on products during the checkout process, preventing overselling by ensuring that stock is adjusted atomically.

### **Caching Strategy**
We cache user carts in Redis to reduce database load and speed up retrieval times. On checkout, the cache is invalidated, and changes are propagated to MongoDB for persistent storage.

### **Data Consistency**
We ensure data consistency during checkout by using MongoDB transactions, particularly for operations involving stock adjustments. This prevents partial updates and ensures that if one part of the process fails (e.g., out of stock), the entire transaction is aborted.

## Docker Notes
If you are using Docker Compose, it will automatically build the services for you. It will spin up the MongoDB, and Redis services in isolated containers.

To stop the Docker containers, use:
```bash
docker-compose down
```

## Assumptions
- We assume that product management (adding, updating, and removing products) is an admin-only operation.
- Carts are user-specific, and a user can only have one active cart at a time.
- Redis is used as the caching layer to improve performance but is not the primary data store.
- We use MongoDB to ensure persistent storage of products and orders.
  
## Future Improvements
- Implement role-based access control for admin actions.
- Improve the product recommendation system based on the user’s cart.
- Add support for discount codes or promotional offers during checkout.

## License
well 🤌

---
