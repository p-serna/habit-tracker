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

# Expose port 8081 (default Expo port)
EXPOSE 8081

# Start Expo development server
CMD ["npm", "start"]