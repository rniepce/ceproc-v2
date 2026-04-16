# Multi-stage build for Railway deployment

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm ci --prefer-offline --no-audit

# Copy source code (excluding node_modules, dist from .dockerignore)
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/*.config.* ./
COPY frontend/tailwind.config.js ./
COPY frontend/postcss.config.js ./
COPY frontend/index.html ./

# Build frontend
RUN npm run build && ls -la dist/

# Stage 2: Backend with frontend static files
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app

# Copy built frontend - React SPA
COPY --from=frontend-builder /app/frontend/dist ./static
RUN ls -la static/ && echo "✅ Frontend static files copied successfully"

# Expose port
EXPOSE 8000

# Environment variables for Railway
ENV PORT=8000
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/health || exit 1

# Run
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
