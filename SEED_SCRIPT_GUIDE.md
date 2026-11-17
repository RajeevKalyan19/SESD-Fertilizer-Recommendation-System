# Seed Script Guide

## 🎯 Updated Behavior

The seed script has been updated to **preserve your existing users and data** by default!

## 📋 How It Works Now

### Default Behavior (`npm run seed`)
- ✅ **Preserves all existing users** (except default admin/test users if they exist)
- ✅ **Preserves custom crops, fertilizers, and rules** (only adds seed data if it doesn't exist)
- ✅ **Adds missing seed data** (crops, fertilizers, rules that don't exist yet)
- ✅ **Safe to run multiple times** - won't duplicate data

### What Gets Added
- Admin user (`admin@fertilizer.com`) - only if doesn't exist
- Test user (`farmer@test.com`) - only if doesn't exist
- Seed crops (Rice, Wheat, Tomato, Corn) - only if don't exist
- Seed fertilizers (Urea, DAP, MOP, NPK, Organic) - only if don't exist
- Seed rules - only if don't exist

### What Gets Preserved
- ✅ **All your registered users** (except default admin/test if they exist)
- ✅ **All your recommendations**
- ✅ **All your feedback**
- ✅ **Custom crops, fertilizers, rules** (if IDs are different from seed data)

## 🚀 Usage Options

### 1. Safe Seed (Default) - Preserves Your Data
```bash
npm run seed
```
**What it does:**
- Adds seed data only if it doesn't exist
- Preserves all your existing users
- Preserves custom data
- Safe to run anytime!

### 2. Preserve Mode - Explicitly Keep Everything
```bash
npm run seed:preserve
```
**What it does:**
- Same as default, but explicitly preserves all data
- Only adds missing seed data

### 3. Reset Mode - Clear Everything (Use with Caution!)
```bash
npm run seed:reset
```
**⚠️ WARNING:** This will:
- Delete ALL crops, fertilizers, and rules
- Delete default admin/test users
- Recreate seed data from scratch
- **Your custom users and recommendations are preserved**

## 📊 Examples

### Example 1: First Time Setup
```bash
npm run seed
```
**Result:**
- Creates admin user
- Creates test user
- Creates all seed crops, fertilizers, rules
- Database is ready to use

### Example 2: After Adding Custom Users
```bash
# You registered: john@example.com, mary@example.com
npm run seed
```
**Result:**
- ✅ john@example.com - PRESERVED
- ✅ mary@example.com - PRESERVED
- ✅ Admin/test users - Updated if needed
- ✅ Seed data - Added if missing
- ✅ Your custom data - PRESERVED

### Example 3: After Adding Custom Crops
```bash
# You added custom crop: CROP999 - "Custom Crop"
npm run seed
```
**Result:**
- ✅ CROP999 "Custom Crop" - PRESERVED
- ✅ Seed crops (CROP001-004) - Added if missing
- ✅ All other data - PRESERVED

## 🔍 How It Checks

The script checks for existing data by:
- **Users:** Email address
- **Crops:** Crop ID (e.g., CROP001)
- **Fertilizers:** Fertilizer ID (e.g., FERT001)
- **Rules:** Rule ID (e.g., RULE001)

If data with the same ID exists, it skips creating it.

## ⚠️ Important Notes

### Default Admin/Test Users
If you want to keep your custom admin or test users:
- Use different emails (not `admin@fertilizer.com` or `farmer@test.com`)
- Or the script will update these specific accounts

### Custom Data Safety
- Custom crops with different IDs (not CROP001-004) are **always preserved**
- Custom fertilizers with different IDs (not FERT001-005) are **always preserved**
- Custom rules with different IDs (not RULE001-009) are **always preserved**

## 🎯 Recommended Workflow

### For Development
```bash
# First time
npm run seed

# Later (when you have custom data)
npm run seed  # Safe, preserves everything
```

### For Testing
```bash
# Reset to clean state
npm run seed:reset

# Test your features
# ...

# Add seed data back (if needed)
npm run seed
```

### For Production
```bash
# Only run once during initial setup
npm run seed

# Never run seed:reset in production!
```

## ✅ Summary

| Command | Users | Custom Data | Seed Data | Use Case |
|---------|-------|-------------|-----------|----------|
| `npm run seed` | ✅ Preserved | ✅ Preserved | Added if missing | **Recommended** |
| `npm run seed:preserve` | ✅ Preserved | ✅ Preserved | Added if missing | Explicit preserve |
| `npm run seed:reset` | ✅ Preserved | ❌ Deleted | Recreated | Reset seed data only |

## 🎉 Bottom Line

**You can now run `npm run seed` safely anytime!**
- Your users won't be deleted
- Your custom data won't be deleted
- Only missing seed data will be added

Perfect for keeping your database up-to-date without losing your work! 🚀

