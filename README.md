# Fertilizer Recommendation System

A web application that provides personalized fertilizer recommendations for farmers based on crop type, soil parameters, and growth stage.

## Features

### For Farmers/Users:
- User registration and authentication
- Input farm details (location, area)
- Select crop type
- Enter soil parameters (pH, N, P, K levels)
- Select growth stage (sowing, vegetative, flowering, fruiting)
- Receive fertilizer recommendations with:
  - Fertilizer type(s)
  - Estimated quantity per hectare
  - Application timing
- Save and view recommendation history
- Download/print recommendations
- Submit feedback on recommendations

### For Agronomists/Admins:
- Admin login
- Manage knowledge base:
  - Add/edit crop profiles
  - Add/edit fertilizer information
  - Add/edit recommendation rules
- Review user feedback

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd hackathon
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory (or use the existing one):
   ```env
   MONGODB_URI=mongodb://localhost:27017/fertilizer_recommendation
   JWT_SECRET=your_secret_key_change_in_production
   PORT=3000
   ```

4. **Start MongoDB:**
   Make sure MongoDB is running on your system. If using MongoDB Atlas, update the `MONGODB_URI` in `.env`.

5. **Seed the database (optional but recommended):**
   ```bash
   npm run seed
   ```
   This will create:
   - Admin user: `admin@fertilizer.com` / `admin123`
   - Test user: `farmer@test.com` / `user123`
   - Sample crops (Rice, Wheat, Tomato, Corn)
   - Sample fertilizers (Urea, DAP, MOP, NPK, Organic Compost)
   - Sample recommendation rules

6. **Start the server:**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

7. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
hackathon/
├── models/              # MongoDB models
│   ├── User.js
│   ├── Crop.js
│   ├── Fertilizer.js
│   ├── Rule.js
│   ├── Recommendation.js
│   └── Feedback.js
├── routes/              # API routes
│   ├── auth.js
│   ├── crops.js
│   ├── recommendations.js
│   ├── admin.js
│   └── knowledgeBase.js
├── middleware/          # Middleware functions
│   └── auth.js
├── services/            # Business logic
│   └── recommendationEngine.js
├── scripts/             # Utility scripts
│   └── seedData.js
├── public/              # Frontend files
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── server.js            # Main server file
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Crops
- `GET /api/crops` - Get all crops

### Recommendations
- `POST /api/recommendations/request` - Request fertilizer recommendation (Auth required)
- `GET /api/recommendations/:id` - Get recommendation by ID (Auth required)
- `POST /api/recommendations/:id/save` - Save recommendation (Auth required)
- `GET /api/recommendations/user/:userId` - Get user's recommendation history (Auth required)
- `POST /api/recommendations/:id/feedback` - Submit feedback (Auth required)

### Admin
- `POST /api/admin/crops` - Add/Update crop (Admin only)
- `POST /api/admin/fertilizers` - Add/Update fertilizer (Admin only)
- `POST /api/admin/rules` - Add/Update rule (Admin only)
- `PUT /api/admin/rules` - Update rule (Admin only)

### Knowledge Base
- `GET /api/kb` - Get complete knowledge base (crops, fertilizers, rules)

## Recommendation Logic

The system uses a rule-based recommendation engine that:

1. Matches user inputs (crop, soil parameters, growth stage) against stored rules
2. Checks soil pH range compatibility
3. Matches NPK levels (low/medium/high)
4. Matches growth stage requirements
5. Aggregates recommendations from all matching rules
6. Calculates quantities based on user's farm area
7. Falls back to crop default recommendations if no rules match

## Usage Example

1. **Register/Login** as a farmer
2. **Fill the recommendation form:**
   - Select crop (e.g., Rice)
   - Select growth stage (e.g., Vegetative)
   - Enter soil pH (optional)
   - Select NPK levels (Low/Medium/High for N, P, K)
   - Enter farm area in hectares
3. **Submit** to get personalized recommendations
4. **View history** of all past recommendations
5. **Download/Print** recommendations for offline use

## Admin Panel

1. **Login** as agronomist/admin
2. **Manage knowledge base:**
   - **Crops Tab:** Add/edit crop profiles with typical NPK requirements
   - **Fertilizers Tab:** Add/edit fertilizer information (NPK composition, type, instructions)
   - **Rules Tab:** Create/edit recommendation rules based on conditions

## Default Credentials (After Seeding)

- **Admin:** 
  - Email: `admin@fertilizer.com`
  - Password: `admin123`

- **User:**
  - Email: `farmer@test.com`
  - Password: `user123`

## Development

To run in development mode with auto-reload:
```bash
npm run dev
```

## Notes

- The system is designed for a 12-hour hackathon scope
- Uses deterministic rule-based matching (not ML-based)
- All quantities are calculated per hectare and converted based on user's area
- The recommendation engine aggregates multiple matching rules
- Feedback system is implemented for future rule refinement

## License

ISC

## Author

Created for Hackathon - Problem Statement 14

