FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy app
COPY frontend ./

# Expose port
EXPOSE 5173

# Run dev server
CMD ["npm", "run", "dev"]
