# Use official Node.js LTS image
FROM node:20-slim

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the app
COPY app ./app

# Expose the port your server listens on
EXPOSE 8080

# Set environment variable for Cloud Run
ENV PORT=8080

# Start the server
CMD ["node", "app/server/index.js"]
