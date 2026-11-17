# 🔌 API Usage Guide

## Overview

This document explains **where and how APIs are used** in the Fertilizer Recommendation System project.

**API Base URL:** `/api` (defined in `public/js/app.js`)

---

## 📍 API Usage Locations

### 1. **Frontend JavaScript** (`public/js/app.js`)

All API calls are made from the frontend JavaScript file using the `fetch()` API. The base URL is defined as:

```javascript
const API_BASE = '/api';
```

---

## 🔐 Authentication APIs

### **Location:** `public/js/app.js` - Lines 234, 288

#### 1. User Login
```javascript
// Function: handleLogin()
// Line: ~234
fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
})
```
**Used When:**
- User clicks "Login" button
- User submits login form

**Purpose:**
- Authenticate user
- Get JWT token
- Store user session

---

#### 2. User Registration
```javascript
// Function: handleRegister()
// Line: ~288
fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role, phone, location })
})
```
**Used When:**
- User clicks "Register" button
- New user creates account

**Purpose:**
- Create new user account
- Hash password
- Generate user ID
- Return authentication token

---

## 🌾 Crop Management APIs

### **Location:** `public/js/app.js` - Lines 368, 570, 873, 908, 982, 1039

#### 1. Load All Crops (For Dropdown)
```javascript
// Function: loadCrops()
// Line: ~368
fetch(`${API_BASE}/crops`)
```
**Used When:**
- Page loads (initialization)
- User opens recommendation form
- Need to populate crop dropdown

**Purpose:**
- Get list of all available crops
- Display in crop selection dropdown

---

#### 2. Load Knowledge Base (Admin)
```javascript
// Function: loadAdminData()
// Line: ~570
fetch(`${API_BASE}/kb`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
})
```
**Used When:**
- Admin logs in
- Admin opens admin panel
- Admin switches to Crops/Fertilizers/Rules tabs

**Purpose:**
- Get all crops, fertilizers, and rules
- Display in admin dashboard
- Used for editing/managing

---

#### 3. Load Crops for Editing
```javascript
// Function: editCrop()
// Line: ~873
fetch(`${API_BASE}/kb`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
})
```
**Used When:**
- Admin clicks "Edit" button on a crop
- Need to load crop data into form

**Purpose:**
- Get crop details for editing
- Populate edit form

---

#### 4. Load Crops for Viewing
```javascript
// Function: viewCrop()
// Line: ~908
fetch(`${API_BASE}/kb`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
})
```
**Used When:**
- Admin clicks "View Details" button
- Need to show crop information

**Purpose:**
- Display crop details in alert/modal

---

#### 5. Load Crops for Fertilizer Selection
```javascript
// Function: addFertilizerToCrop()
// Line: ~982
fetch(`${API_BASE}/kb`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
})
```
**Used When:**
- Admin clicks "+ Add Fertilizer" in crop form
- Need to show available fertilizers

**Purpose:**
- Get list of fertilizers for dropdown
- Allow admin to select fertilizer for crop

---

#### 6. Load Fertilizers for Crop Form
```javascript
// Function: displayCropFertilizers()
// Line: ~1039
fetch(`${API_BASE}/kb`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
})
```
**Used When:**
- Editing crop with existing fertilizers
- Need to display fertilizers in form

**Purpose:**
- Load fertilizer names for display
- Populate fertilizer dropdowns

---

## 💾 Save/Update APIs (Admin)

### **Location:** `public/js/app.js` - Lines 1136, 1183, 1237, 955

#### 1. Save/Update Crop
```javascript
// Function: handleCropSave()
// Line: ~1136
fetch(`${API_BASE}/admin/crops`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ cropId, cropName, typicalNPK, recommendedFertilizers, notes })
})
```
**Used When:**
- Admin submits crop form
- Creating new crop
- Updating existing crop

**Purpose:**
- Save crop to database
- Update crop information
- Validate fertilizer IDs

---

#### 2. Save/Update Fertilizer
```javascript
// Function: handleFertilizerSave()
// Line: ~1183
fetch(`${API_BASE}/admin/fertilizers`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ fertilizerId, name, nutrientComposition, type, instructions })
})
```
**Used When:**
- Admin submits fertilizer form
- Creating new fertilizer
- Updating existing fertilizer

**Purpose:**
- Save fertilizer to database
- Update fertilizer information

---

#### 3. Save/Update Rule
```javascript
// Function: handleRuleSave()
// Line: ~1237
fetch(`${API_BASE}/admin/rules`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ ruleId, cropId, condition, recommendations })
})
```
**Used When:**
- Admin submits rule form
- Creating new recommendation rule
- Updating existing rule

**Purpose:**
- Save rule to database
- Update rule conditions
- Validate crop and fertilizer IDs

---

#### 4. Delete Crop
```javascript
// Function: deleteCrop()
// Line: ~955
fetch(`${API_BASE}/admin/crops/${cropId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${authToken}` }
})
```
**Used When:**
- Admin clicks "Delete" button on crop
- Confirms deletion

**Purpose:**
- Remove crop from database
- Clean up related data

---

## 📊 Recommendation APIs

### **Location:** `public/js/app.js` - Lines 409, 489, 534

#### 1. Request Recommendation
```javascript
// Function: handleRecommendation()
// Line: ~409
fetch(`${API_BASE}/recommendations/request`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
        cropId,
        soilInput,
        growthStage,
        area: { value: area, unit: 'hectare' }
    })
})
```
**Used When:**
- User submits recommendation form
- User clicks "Get Recommendation" button

**Purpose:**
- Generate fertilizer recommendations
- Save recommendation to database
- Return personalized recommendations

**This is the CORE API** - Most important API call!

---

#### 2. Load User History
```javascript
// Function: loadUserHistory()
// Line: ~489
fetch(`${API_BASE}/recommendations/user/${currentUser.userId}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
})
```
**Used When:**
- User navigates to History page
- Page loads after login
- After creating new recommendation

**Purpose:**
- Get all past recommendations for user
- Display in history grid
- Show recommendation cards

---

#### 3. Get Recommendation by ID
```javascript
// Function: viewRecommendation()
// Line: ~534
fetch(`${API_BASE}/recommendations/${recId}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
})
```
**Used When:**
- User clicks "View Results" in history
- User clicks "View Details" button
- Need to display specific recommendation

**Purpose:**
- Get full recommendation details
- Display on results page

---

## 💬 Feedback APIs

### **Location:** `public/js/app.js` - Lines 1298, 1407, 607

#### 1. Load User Feedbacks
```javascript
// Function: loadFeedbackData()
// Line: ~1298
fetch(`${API_BASE}/recommendations/user/${currentUser.userId}/feedbacks`, {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
    }
})
```
**Used When:**
- User navigates to Feedback page
- After submitting feedback
- Page loads

**Purpose:**
- Get all feedbacks submitted by user
- Display feedback history
- Show ratings and comments

---

#### 2. Submit Feedback
```javascript
// Function: handleFeedbackSubmit()
// Line: ~1407
fetch(`${API_BASE}/recommendations/${recId}/feedback`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ rating, comments })
})
```
**Used When:**
- User submits feedback form
- User rates a recommendation
- User adds comments

**Purpose:**
- Save feedback to database
- Link feedback to recommendation
- Store rating (1-5) and comments

---

#### 3. Load Admin Feedbacks
```javascript
// Function: loadAdminFeedbacks()
// Line: ~607
fetch(`${API_BASE}/admin/feedbacks?limit=100&sort=${sort}`, {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
    }
})
```
**Used When:**
- Admin opens Feedbacks tab
- Admin changes sort/filter options
- Admin clicks "Refresh" button

**Purpose:**
- Get all user feedbacks
- Get feedback statistics
- Display in admin dashboard

---

## 🔍 Health Check API

### **Location:** `public/js/app.js` - Line 20

#### 1. Check Server Connection
```javascript
// Function: checkServerConnection()
// Line: ~20
fetch('/api/health', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
})
```
**Used When:**
- Page loads
- After login/register errors
- To verify server is running

**Purpose:**
- Check if server is accessible
- Display warning if server is down
- Verify connectivity

---

## 📋 Complete API Call Summary

| API Endpoint | Method | Used In Function | Purpose |
|-------------|--------|-----------------|---------|
| `/api/health` | GET | `checkServerConnection()` | Server health check |
| `/api/auth/login` | POST | `handleLogin()` | User authentication |
| `/api/auth/register` | POST | `handleRegister()` | User registration |
| `/api/crops` | GET | `loadCrops()` | Get all crops (dropdown) |
| `/api/kb` | GET | `loadAdminData()` | Get knowledge base (admin) |
| `/api/kb` | GET | `editCrop()` | Load crop for editing |
| `/api/kb` | GET | `viewCrop()` | View crop details |
| `/api/kb` | GET | `addFertilizerToCrop()` | Get fertilizers list |
| `/api/kb` | GET | `displayCropFertilizers()` | Load fertilizers for form |
| `/api/admin/crops` | POST | `handleCropSave()` | Save/update crop |
| `/api/admin/crops/:id` | DELETE | `deleteCrop()` | Delete crop |
| `/api/admin/fertilizers` | POST | `handleFertilizerSave()` | Save/update fertilizer |
| `/api/admin/rules` | POST | `handleRuleSave()` | Save/update rule |
| `/api/admin/feedbacks` | GET | `loadAdminFeedbacks()` | Get all feedbacks (admin) |
| `/api/recommendations/request` | POST | `handleRecommendation()` | **Generate recommendations** |
| `/api/recommendations/user/:id` | GET | `loadUserHistory()` | Get user history |
| `/api/recommendations/:id` | GET | `viewRecommendation()` | Get recommendation by ID |
| `/api/recommendations/:id/feedback` | POST | `handleFeedbackSubmit()` | Submit feedback |
| `/api/recommendations/user/:id/feedbacks` | GET | `loadFeedbackData()` | Get user feedbacks |

**Total: 19 API endpoints used in frontend**

---

## 🔄 API Call Flow Examples

### Example 1: User Gets Recommendation

```
1. User fills form → handleRecommendation()
2. POST /api/recommendations/request
3. Server processes → Returns recommendation
4. displayRecommendation() → Shows results
5. loadUserHistory() → GET /api/recommendations/user/:id
6. loadFeedbackData() → GET /api/recommendations/user/:id/feedbacks
```

### Example 2: Admin Manages Crops

```
1. Admin opens panel → loadAdminData()
2. GET /api/kb → Loads all data
3. Admin clicks Edit → editCrop()
4. GET /api/kb → Loads crop details
5. Admin saves → handleCropSave()
6. POST /api/admin/crops → Saves crop
7. loadAdminData() → Refreshes list
```

### Example 3: User Submits Feedback

```
1. User selects recommendation → loadFeedbackData()
2. GET /api/recommendations/user/:id/feedbacks → Loads history
3. User submits form → handleFeedbackSubmit()
4. POST /api/recommendations/:id/feedback → Saves feedback
5. loadFeedbackData() → Refreshes feedback list
```

---

## 🔐 Authentication in API Calls

**Most API calls require authentication:**

```javascript
headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
}
```

**Public APIs (No Auth Required):**
- `/api/health` - Health check
- `/api/auth/login` - Login
- `/api/auth/register` - Registration
- `/api/crops` - Get crops list (for dropdown)

**Protected APIs (Auth Required):**
- All `/api/recommendations/*` endpoints
- All `/api/admin/*` endpoints
- All `/api/kb` endpoints (admin only)

---

## 📝 Notes

1. **All API calls are asynchronous** - Using `async/await` or `.then()`
2. **Error handling** - All calls have try-catch blocks
3. **Loading states** - UI shows loading indicators during API calls
4. **Token management** - JWT token stored in localStorage
5. **Base URL** - All APIs use `/api` prefix
6. **CORS enabled** - Server configured for cross-origin requests

---

## 🎯 Key Takeaways

- **Frontend makes all API calls** from `public/js/app.js`
- **19 different API endpoints** are used
- **Most important API:** `/api/recommendations/request` (core functionality)
- **Authentication required** for most operations
- **RESTful design** - GET, POST, DELETE methods used
- **Error handling** implemented for all calls

---

**This document shows exactly where every API is used in your project!** 🚀

