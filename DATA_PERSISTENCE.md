# Data Persistence Guide

## ✅ Data Persists Across Server Restarts

**YES - Your data remains in the database when you restart the server!**

MongoDB is a **persistent database**, meaning:
- Data is stored on disk (not just in memory)
- When you close the server and restart it, **all your data remains**
- Users, crops, fertilizers, rules, recommendations, and feedback are all saved permanently

## 🔄 What Happens When You Restart

### Scenario 1: Normal Server Restart
```bash
# Stop server (Ctrl+C)
# Start server again
npm start
```
**Result:** ✅ All data remains - users, recommendations, everything is still there!

### Scenario 2: Restart MongoDB Service
```bash
# MongoDB service restarts
# Your Node.js server restarts
```
**Result:** ✅ All data remains - MongoDB persists data to disk

### Scenario 3: Computer Restart
```bash
# Computer shuts down and restarts
# MongoDB starts automatically (if configured)
# Your server starts
```
**Result:** ✅ All data remains - MongoDB files are on disk

## ⚠️ When Data Gets Deleted

Data is **ONLY deleted** in these scenarios:

### 1. Running the Seed Script
```bash
npm run seed
```
**What it does:**
- Deletes all existing users, crops, fertilizers, and rules
- Creates fresh seed data
- **⚠️ WARNING:** This will delete all your custom data!

**When to use:**
- Setting up the project for the first time
- Resetting to default data
- Testing with clean data

### 2. Manual Deletion
If you manually delete data using:
- MongoDB Compass (delete operations)
- Database commands (`db.collection.deleteMany()`)
- Admin panel (if you add delete functionality)

### 3. Database/Collection Dropped
If you drop the database or collections:
```javascript
db.dropDatabase()
// or
db.collection.drop()
```

### 4. Database Files Deleted
If you delete MongoDB data files from the filesystem (very rare)

## 📊 Data Storage Location

### Local MongoDB (Default)
- **Windows:** `C:\data\db\` (or configured location)
- **Linux/Mac:** `/data/db/` (or configured location)
- Database name: `fertilizer_recommendation`

### MongoDB Atlas (Cloud)
- Data stored in MongoDB's cloud servers
- Persists automatically
- Accessible from anywhere

## 🔍 How to Verify Data Persists

### Test It Yourself:

1. **Create a user:**
   - Register a new user through the app
   - Note the email/username

2. **Stop the server:**
   - Press `Ctrl+C` in terminal

3. **Restart the server:**
   ```bash
   npm start
   ```

4. **Try to login:**
   - Use the same credentials
   - ✅ You should be able to login - data persisted!

5. **Check MongoDB Compass:**
   - Connect to `mongodb://localhost:27017`
   - Open `fertilizer_recommendation` database
   - Check `users` collection
   - ✅ Your user should still be there!

## 💾 Best Practices

### 1. Regular Backups
Even though data persists, it's good to backup:
```bash
# Backup MongoDB (if needed)
mongodump --db fertilizer_recommendation
```

### 2. Don't Run Seed Script Unnecessarily
Only run `npm run seed` when you want to:
- Reset to default data
- Start fresh
- Clear all custom data

### 3. Check Before Seeding
The seed script will warn you, but always check:
- Do you have important data?
- Do you want to keep it?
- Consider backing up first

## 🎯 Summary

| Action | Data Persists? |
|--------|----------------|
| Restart server | ✅ YES |
| Restart computer | ✅ YES |
| Restart MongoDB | ✅ YES |
| Run `npm run seed` | ❌ NO (deletes and recreates) |
| Delete via code | ❌ NO |
| Drop database | ❌ NO |

## 🔐 Your Current Data

To see what data you have:

1. **Using MongoDB Compass:**
   - Connect to `mongodb://localhost:27017`
   - Browse `fertilizer_recommendation` database
   - View all collections

2. **Using the App:**
   - Login and check your recommendation history
   - Admin panel shows all crops/fertilizers/rules

3. **Using Terminal:**
   ```bash
   mongosh
   use fertilizer_recommendation
   db.users.find()
   db.recommendations.find()
   ```

## ✅ Conclusion

**Your data is safe!** MongoDB persists everything to disk. You can restart your server as many times as you want, and all your users, recommendations, and data will remain intact.

The only time data gets deleted is when you explicitly:
- Run the seed script (`npm run seed`)
- Delete it manually
- Drop the database

So feel free to restart your server - your data will be there when you come back! 🎉

