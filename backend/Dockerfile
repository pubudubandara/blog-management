# Use the official Node.js image (Lightweight version)
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies (including dev dependencies for nodemon)
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application in dev mode with nodemon
CMD ["npm", "run", "dev"]