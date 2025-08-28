# Use Node.js LTS as base image
FROM node:18-alpine

# Install Expo CLI globally
RUN npm install -g @expo/cli

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy project files
COPY . .

# Expose ports
EXPOSE 8081
EXPOSE 3210

# Start Convex development server by default
CMD ["npm", "run", "dev"]