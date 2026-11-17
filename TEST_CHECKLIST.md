# Test Checklist - Fertilizer Recommendation System

This checklist ensures all features work correctly and all test cases pass.

## ✅ Setup & Installation

- [ ] `npm install` runs without errors
- [ ] MongoDB connection works (check server console)
- [ ] `npm run seed` creates all initial data
- [ ] Server starts on port 3000 without errors
- [ ] Frontend loads at `http://localhost:3000`

## ✅ Authentication Tests

### Registration
- [ ] Register with valid data (name, email, password) - should succeed
- [ ] Register with invalid email format - should fail with error
- [ ] Register with password < 6 characters - should fail
- [ ] Register with duplicate email - should fail with "Email already exists"
- [ ] Register as user role - should succeed
- [ ] Register as agronomist role - should succeed
- [ ] Register without role (defaults to user) - should succeed

### Login
- [ ] Login with valid credentials - should succeed and get token
- [ ] Login with invalid email - should fail
- [ ] Login with wrong password - should fail
- [ ] Login with invalid email format - should fail
- [ ] Login without password - should fail

### Token/Auth
- [ ] Access protected route without token - should return 401
- [ ] Access protected route with invalid token - should return 401
- [ ] Access protected route with expired token - should return 401
- [ ] Access protected route with valid token - should succeed

## ✅ User Dashboard Tests

### Get Crops
- [ ] GET /api/crops returns list of crops
- [ ] Crops list displays in dropdown

### Request Recommendation
- [ ] Submit with all required fields - should succeed
- [ ] Submit without crop selection - should fail
- [ ] Submit without growth stage - should fail
- [ ] Submit without NPK levels - should fail
- [ ] Submit with invalid NPK level - should fail
- [ ] Submit with invalid growth stage - should fail
- [ ] Submit with area = 0 - should fail
- [ ] Submit with negative area - should fail
- [ ] Submit with non-existent crop ID - should fail with 404
- [ ] Submit with valid pH (0-14) - should succeed
- [ ] Submit with invalid pH (< 0 or > 14) - should fail
- [ ] Submit without pH (optional) - should succeed
- [ ] Recommendation displays correctly with fertilizer details
- [ ] Quantity calculated correctly based on area
- [ ] Multiple recommendations display correctly

### Recommendation History
- [ ] History loads for logged-in user
- [ ] History shows all past recommendations
- [ ] View details button works
- [ ] History sorted by date (newest first)
- [ ] User cannot access another user's history

### Feedback
- [ ] Submit feedback with rating 1-5 - should succeed
- [ ] Submit feedback without rating - should fail
- [ ] Submit feedback with rating < 1 - should fail
- [ ] Submit feedback with rating > 5 - should fail
- [ ] Submit feedback with non-numeric rating - should fail
- [ ] Submit feedback for own recommendation - should succeed
- [ ] Submit feedback for other user's recommendation - should fail (403)

## ✅ Admin Panel Tests

### Crops Management
- [ ] Add new crop with valid data - should succeed
- [ ] Add crop without name - should fail
- [ ] Update existing crop - should succeed
- [ ] Add crop with duplicate ID - should fail
- [ ] Add crop with invalid fertilizer ID in recommendedFertilizers - should fail (404)
- [ ] Crop list displays after save

### Fertilizers Management
- [ ] Add new fertilizer with valid data - should succeed
- [ ] Add fertilizer without name - should fail
- [ ] Add fertilizer without nutrient composition - should fail
- [ ] Add fertilizer with invalid type - should fail
- [ ] Add fertilizer with non-numeric NPK values - should fail
- [ ] Update existing fertilizer - should succeed
- [ ] Add fertilizer with duplicate ID - should fail
- [ ] Fertilizer list displays after save

### Rules Management
- [ ] Add new rule with valid JSON - should succeed
- [ ] Add rule without crop ID - should fail
- [ ] Add rule with non-existent crop ID - should fail (404)
- [ ] Add rule with non-existent fertilizer ID - should fail (404)
- [ ] Add rule with invalid JSON format - should fail
- [ ] Add rule with empty recommendations array - should fail
- [ ] Add rule with missing quantityPerHa - should fail
- [ ] Add rule with negative quantityPerHa - should fail
- [ ] Update existing rule - should succeed
- [ ] Rule list displays after save

### Access Control
- [ ] User cannot access admin routes - should return 403
- [ ] Admin can access all admin routes - should succeed

## ✅ API Endpoint Tests

### GET /api/crops
- [ ] Returns array of crops
- [ ] No authentication required
- [ ] Returns empty array if no crops

### POST /api/recommendations/request
- [ ] Requires authentication
- [ ] Validates all required fields
- [ ] Returns recommendation with proper structure
- [ ] Saves recommendation to database

### GET /api/recommendations/:id
- [ ] Requires authentication
- [ ] Returns recommendation if exists
- [ ] Returns 404 if not found
- [ ] User can only access own recommendations (unless admin)

### GET /api/recommendations/user/:userId
- [ ] Requires authentication
- [ ] Returns user's recommendations
- [ ] User can only access own history (unless admin)
- [ ] Returns empty array if no recommendations

### POST /api/recommendations/:id/feedback
- [ ] Requires authentication
- [ ] Validates rating (1-5)
- [ ] Saves feedback
- [ ] User can only feedback own recommendations

### GET /api/kb
- [ ] Returns crops, fertilizers, and rules
- [ ] No authentication required
- [ ] Returns proper structure

## ✅ Edge Cases & Error Handling

- [ ] Server handles MongoDB connection errors gracefully
- [ ] Server handles invalid JSON in request body
- [ ] Server handles missing request body
- [ ] Server handles very large numbers
- [ ] Server handles special characters in input
- [ ] Frontend displays error messages clearly
- [ ] Frontend handles network errors
- [ ] Frontend handles 401 (unauthorized) - redirects to login
- [ ] Frontend handles 403 (forbidden) - shows error
- [ ] Frontend handles 404 (not found) - shows error
- [ ] Frontend handles 500 (server error) - shows error

## ✅ Recommendation Engine Tests

- [ ] Matches rules based on crop ID
- [ ] Matches rules based on NPK levels
- [ ] Matches rules based on growth stage
- [ ] Matches rules based on pH range
- [ ] Handles missing pH value
- [ ] Aggregates multiple matching rules
- [ ] Falls back to crop defaults if no rules match
- [ ] Calculates quantity correctly based on area
- [ ] Handles very small areas (< 0.01 ha)
- [ ] Handles very large areas
- [ ] Returns empty array if no recommendations possible (should not happen with fallback)

## ✅ Data Validation Tests

- [ ] Email validation works correctly
- [ ] Password length validation works
- [ ] NPK level validation (low/medium/high only)
- [ ] Growth stage validation (sowing/vegetative/flowering/fruiting only)
- [ ] pH range validation (0-14)
- [ ] Area validation (must be > 0)
- [ ] Crop ID validation (must exist)
- [ ] Fertilizer ID validation (must exist)

## ✅ Database Tests

- [ ] Users collection works correctly
- [ ] Crops collection works correctly
- [ ] Fertilizers collection works correctly
- [ ] Rules collection works correctly
- [ ] Recommendations collection works correctly
- [ ] Feedback collection works correctly
- [ ] Unique constraints work (userId, cropId, etc.)
- [ ] Indexes work correctly

## ✅ Frontend UI/UX Tests

- [ ] Login page displays correctly
- [ ] Register page displays correctly
- [ ] User dashboard displays correctly
- [ ] Admin dashboard displays correctly
- [ ] Forms validate input before submission
- [ ] Error messages display clearly
- [ ] Success messages display clearly
- [ ] Navigation works correctly
- [ ] Logout works correctly
- [ ] Responsive design works on mobile
- [ ] Print/download recommendation works

## ✅ Security Tests

- [ ] Passwords are hashed (not stored in plain text)
- [ ] JWT tokens are required for protected routes
- [ ] Users cannot access other users' data
- [ ] Admin routes are protected
- [ ] Input is validated and sanitized
- [ ] SQL injection prevention (MongoDB handles this)
- [ ] XSS prevention (input validation)

## Running Tests

To test manually:
1. Start the server: `npm start`
2. Open browser: `http://localhost:3000`
3. Go through each test case above
4. Check browser console for errors
5. Check server console for errors

## Common Issues to Check

- [ ] MongoDB is running
- [ ] Database is seeded (`npm run seed`)
- [ ] All environment variables are set
- [ ] No port conflicts (port 3000 available)
- [ ] All dependencies installed (`npm install`)
- [ ] No console errors in browser
- [ ] No errors in server console

