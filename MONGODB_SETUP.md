# MongoDB Connection Setup Guide

## Common Issues and Solutions

### Issue: App shows "Connected to MongoDB" but not visible in Compass

**Possible Causes:**

1. **MongoDB Compass is connected to a different instance**
   - Make sure Compass is connected to: `mongodb://localhost:27017`
   - Or use the exact connection string shown in the server console

2. **Database doesn't exist yet (MongoDB creates databases lazily)**
   - MongoDB only creates databases when you insert the first document
   - **Solution:** Run the seed script to create collections:
     ```bash
     npm run seed
     ```

3. **Different connection strings**
   - Check the connection string in your `.env` file
   - Make sure Compass uses the same connection string

## Steps to Verify Connection

1. **Check if MongoDB is running:**
   ```bash
   # Windows (PowerShell)
   Get-Service MongoDB
   
   # Or check if MongoDB process is running
   ```

2. **Start the application:**
   ```bash
   npm start
   ```
   Look for the connection details in the console output.

3. **Connect MongoDB Compass:**
   - Open MongoDB Compass
   - Use connection string: `mongodb://localhost:27017`
   - Or use: `mongodb://localhost:27017/fertilizer_recommendation`
   - Click "Connect"

4. **Seed the database:**
   ```bash
   npm run seed
   ```
   This will create the database and collections with sample data.

5. **Refresh MongoDB Compass:**
   - Click the refresh button in Compass
   - You should now see the `fertilizer_recommendation` database
   - Expand it to see collections: `users`, `crops`, `fertilizers`, `rules`, `recommendations`, `feedbacks`

## Connection String Format

- **Local MongoDB:** `mongodb://localhost:27017/fertilizer_recommendation`
- **MongoDB Atlas:** `mongodb+srv://username:password@cluster.mongodb.net/fertilizer_recommendation`

## Verify Collections Exist

After running the seed script, you should see these collections:
- `users` - Contains admin and test user
- `crops` - Contains Rice, Wheat, Tomato, Corn
- `fertilizers` - Contains Urea, DAP, MOP, NPK, Organic Compost
- `rules` - Contains recommendation rules
- `recommendations` - Will be populated as users request recommendations
- `feedbacks` - Will be populated as users submit feedback

## Troubleshooting Commands

Check MongoDB connection from command line:
```bash
# Windows
mongosh mongodb://localhost:27017

# Or test connection
mongosh "mongodb://localhost:27017/fertilizer_recommendation"
```

If you can't connect, make sure MongoDB service is running:
```bash
# Windows - Start MongoDB service
net start MongoDB

# Or check status
sc query MongoDB
```

