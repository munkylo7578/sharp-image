# Debugging Docker SQLite Access

## Issue: SQLite path resolution error

When running `docker exec -it sharp-image-service sqlite3 /app/data/images.db`, you might get a path error.

## Debug Steps

### 1. Check if database file exists
```bash
docker exec -it sharp-image-service ls -la /app/data/
```

### 2. Check if data directory exists
```bash
docker exec -it sharp-image-service ls -la /app/
```

### 3. Check environment variables
```bash
docker exec -it sharp-image-service env | grep DB_PATH
```

### 4. Use absolute path with proper escaping
```bash
docker exec -it sharp-image-service sh -c "sqlite3 /app/data/images.db"
```

### 5. Alternative: Use npm script instead
```bash
docker exec -it sharp-image-service npm run db:list
```

### 6. Check if database needs initialization
```bash
docker exec -it sharp-image-service npm run init-db
```

## Quick Fix

If the database doesn't exist, initialize it:
```bash
docker exec -it sharp-image-service npm run init-db
```

Then try accessing it again:
```bash
docker exec -it sharp-image-service sh -c "sqlite3 /app/data/images.db \"SELECT * FROM images;\""
```

