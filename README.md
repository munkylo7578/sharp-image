# Sharp Image Service

A Node.js service that serves resized images from Cloudflare R2 based on user requests. The service uses Sharp.js for image processing, SQLite for image metadata storage, and is containerized with Docker.

## Features

- 🔍 Look up images by name in SQLite database
- ☁️ Fetch images from Cloudflare R2
- 🖼️ Resize images on-the-fly using Sharp.js
- 🐳 Dockerized for easy deployment
- ⚡ Fast image processing and caching

## Architecture

1. User requests image by name with optional width/height parameters
2. Service looks up image name and URL in SQLite database
3. Service fetches the image from Cloudflare R2
4. Service resizes the image using Sharp.js based on parameters
5. Service returns the resized image bytes

## Prerequisites

- Node.js 18+ (for local development)
- Docker and Docker Compose (for containerized deployment)
- Cloudflare R2 account with bucket and API credentials

## Setup

### 1. Clone and Install

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Cloudflare R2 credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
PORT=3000
DB_PATH=./data/images.db
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
```

### 3. Initialize Database (Local Development Only)

For local development, initialize the database manually:

```bash
npm run init-db
```

**Note:** When using Docker, the database is initialized automatically during the build process. You only need to run this manually for local development.

This will create the SQLite database and `images` table. You can manually insert image records:

```sql
INSERT INTO images (name, url) VALUES 
  ('my-image', 'path/to/image.jpg'),
  ('another-image', 'path/to/another.png');
```

The `name` is what users will request, and `url` is the key/path in your R2 bucket.

### 4. Run Locally

```bash
npm start
# or for development with auto-reload
npm run dev
```

### 5. Run with Docker

The Docker setup automatically handles:
- Installing all dependencies during build
- Initializing the SQLite database during build
- Ensuring database exists on container start (via entrypoint script)

```bash
# Build and start (database will be initialized automatically)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

**Note:** The database is initialized automatically during the Docker build process and on container start if it doesn't exist. No manual database setup is required when using Docker.

## API Endpoints

### Health Check

```
GET /health
```

Returns service status.

### Get Image

```
GET /image/:name?width=800&height=600
```

**Parameters:**
- `name` (path parameter, required): Image name as stored in database
- `width` (query parameter, optional): Desired width in pixels
- `height` (query parameter, optional): Desired height in pixels

**Examples:**
- `GET /image/sample1` - Returns original image
- `GET /image/sample1?width=800` - Returns image resized to 800px width
- `GET /image/sample1?height=600` - Returns image resized to 600px height
- `GET /image/sample1?width=800&height=600` - Returns image resized to 800x600

**Response:**
- Success: Image bytes with `Content-Type: image/jpeg`
- Error: JSON with error message (404 if image not found)

## Database Schema

```sql
CREATE TABLE images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Database Management

### Adding Images

1. Upload your image to Cloudflare R2 bucket
2. Add a record to the database using npm script:

```bash
npm run db:add <name> <url>
```

Example:
```bash
npm run db:add my-image folder/my-image.jpg
npm run db:add logo assets/logo.png
```

Or manually:
```bash
node src/db/addImage.js my-image folder/my-image.jpg
```

### Viewing Images

List all images in the database:
```bash
npm run db:list
```

Search for specific images:
```bash
npm run db:list sample
```

### Updating Images

Update an image's URL:
```bash
npm run db:update <name> <new-url>
```

Example:
```bash
npm run db:update my-image folder/new-path/image.jpg
```

### Deleting Images

Remove an image from the database:
```bash
npm run db:delete <name>
```

Example:
```bash
npm run db:delete my-image
```

### Using Commands in Docker

If you're running the service in Docker, you can execute database commands inside the container:

```bash
# List images
docker exec -it sharp-image-service npm run db:list

# Add an image
docker exec -it sharp-image-service npm run db:add my-image folder/image.jpg

# Update an image
docker exec -it sharp-image-service npm run db:update my-image new-path.jpg

# Delete an image
docker exec -it sharp-image-service npm run db:delete my-image
```

### Using SQLite CLI Directly

You can also use SQLite CLI directly:

```bash
# Local development
sqlite3 ./data/images.db
```

**For Docker, use one of these methods:**

**Method 1: Interactive shell (recommended)**
```bash
docker exec -it sharp-image-service sh
# Then inside the container:
sqlite3 /app/data/images.db
```

**Method 2: Run SQL command directly**
```bash
docker exec -it sharp-image-service sh -c "sqlite3 /app/data/images.db \"SELECT * FROM images;\""
```

**Method 3: Check if database exists first**
```bash
# Check if database file exists
docker exec -it sharp-image-service ls -la /app/data/

# If it doesn't exist, initialize it
docker exec -it sharp-image-service npm run init-db

# Then access it
docker exec -it sharp-image-service sh -c "sqlite3 /app/data/images.db"
```

Then run SQL commands:
```sql
-- List all images
SELECT * FROM images;

-- Search by name
SELECT * FROM images WHERE name LIKE '%sample%';

-- Add an image
INSERT INTO images (name, url) VALUES ('my-image', 'path/to/image.jpg');

-- Update an image
UPDATE images SET url = 'new/path.jpg' WHERE name = 'my-image';

-- Delete an image
DELETE FROM images WHERE name = 'my-image';
```

## Development

```bash
# Install dev dependencies
npm install

# Run with nodemon (auto-reload)
npm run dev

# Initialize/reset database
npm run init-db
```

## Docker

The Dockerfile uses Node.js 18 Alpine and includes all necessary dependencies for Sharp.js.

### Building Manually

```bash
docker build -t sharp-image-service .
docker run -p 3000:3000 --env-file .env sharp-image-service
```

## Troubleshooting

1. **Image not found**: Check that the image name exists in the database and the URL/key matches the R2 bucket path
2. **R2 connection errors**: Verify your R2 credentials and endpoint in `.env`
3. **Sharp errors**: Ensure the Docker image has the necessary image libraries installed (already included in Dockerfile)

## License

ISC

