# Troubleshooting Guide

## Registration Failed: "Failed to fetch"

This error means the browser cannot connect to the server. Here's how to fix it:

### Step 1: Check if Server is Running

1. **Open a terminal/command prompt**
2. **Navigate to project directory:**
   ```bash
   cd c:\Users\mohit\OneDrive\Desktop\hackathon
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **You should see:**
   ```
   Attempting to connect to MongoDB at: mongodb://localhost:27017/fertilizer_recommendation
   ✓ Connected to MongoDB successfully
   Server running on port 3000
   ```

### Step 2: Verify Server is Running

1. **Open browser and go to:**
   ```
   http://localhost:3000
   ```

2. **You should see the login page**

3. **Check browser console (F12):**
   - Should see: `✓ Server is running and reachable`
   - If you see error, server is not running

### Step 3: Check MongoDB

If server starts but MongoDB connection fails:

1. **Make sure MongoDB is running:**
   ```bash
   # Windows - Check MongoDB service
   Get-Service MongoDB
   
   # Or start MongoDB
   net start MongoDB
   ```

2. **Or use MongoDB Atlas (cloud):**
   - Update `.env` file with your MongoDB Atlas connection string

### Step 4: Check Port Conflicts

If port 3000 is already in use:

1. **Find what's using port 3000:**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   ```

2. **Kill the process or change port:**
   - Edit `server.js` or `.env` file
   - Change `PORT=3000` to `PORT=3001`
   - Update browser to `http://localhost:3001`

### Step 5: Check Firewall/Antivirus

Sometimes firewall blocks localhost connections:

1. **Temporarily disable firewall** (for testing)
2. **Or add exception for Node.js**

### Step 6: Verify API Endpoint

1. **Open browser console (F12)**
2. **Go to Network tab**
3. **Try registering**
4. **Check if request to `/api/auth/register` appears**
5. **Check the status code:**
   - 200/201 = Success
   - 400 = Bad request (validation error)
   - 500 = Server error
   - (failed) = Server not running

### Common Issues

#### Issue 1: "Cannot GET /"
- **Cause:** Server not running or wrong URL
- **Fix:** Start server with `npm start`

#### Issue 2: "MongoDB connection error"
- **Cause:** MongoDB not running
- **Fix:** Start MongoDB service or use MongoDB Atlas

#### Issue 3: "Port 3000 already in use"
- **Cause:** Another application using port 3000
- **Fix:** Kill the process or change port

#### Issue 4: "CORS error"
- **Cause:** CORS misconfiguration (shouldn't happen with current setup)
- **Fix:** Already handled in server.js

### Quick Test

Run this in browser console (F12) after page loads:

```javascript
fetch('/api/crops')
  .then(r => r.json())
  .then(d => console.log('✓ Server OK:', d))
  .catch(e => console.error('✗ Server Error:', e));
```

**Expected:**
- ✓ Server OK: [array of crops] = Server is working
- ✗ Server Error: Failed to fetch = Server not running

### Still Not Working?

1. **Check terminal for errors:**
   - Look for red error messages
   - Check MongoDB connection status

2. **Check browser console:**
   - Look for red error messages
   - Check Network tab for failed requests

3. **Verify file structure:**
   - Make sure `server.js` exists
   - Make sure `routes/auth.js` exists
   - Make sure `models/User.js` exists

4. **Reinstall dependencies:**
   ```bash
   npm install
   ```

5. **Check Node.js version:**
   ```bash
   node --version
   ```
   Should be v14 or higher

### Getting Help

If still not working, provide:
1. Terminal output (server console)
2. Browser console errors (F12)
3. Network tab screenshot
4. Error message exactly as shown

