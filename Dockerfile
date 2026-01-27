FROM python:3.11-slim

WORKDIR /app

# Copy requirements
COPY backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire project (includes backend + frontend in backend/app/static/)
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
ENV HOST=0.0.0.0

# Expose port (will be overridden by Railway)
EXPOSE 8000

# Run backend entry point
CMD ["python", "backend/run.py"]
