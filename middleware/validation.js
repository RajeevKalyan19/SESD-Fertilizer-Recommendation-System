// Validation middleware and helper functions

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
function isValidPassword(password) {
  return password && password.length >= 6;
}

// Validate NPK level
function isValidNPKLevel(level) {
  return ['low', 'medium', 'high'].includes(level);
}

// Validate growth stage
function isValidGrowthStage(stage) {
  return ['sowing', 'vegetative', 'flowering', 'fruiting'].includes(stage);
}

// Validate pH range
function isValidPH(pH) {
  if (pH === null || pH === undefined) return true; // Optional
  return typeof pH === 'number' && pH >= 0 && pH <= 14;
}

// Validate area
function isValidArea(area) {
  return area && 
         typeof area.value === 'number' && 
         area.value > 0 && 
         (area.unit === 'hectare' || area.unit === 'acre' || !area.unit);
}

// Validate soil input
function validateSoilInput(soilInput) {
  if (!soilInput) return { valid: false, error: 'Soil input is required' };
  
  if (!isValidNPKLevel(soilInput.N)) {
    return { valid: false, error: 'Invalid N level. Must be low, medium, or high' };
  }
  
  if (!isValidNPKLevel(soilInput.P)) {
    return { valid: false, error: 'Invalid P level. Must be low, medium, or high' };
  }
  
  if (!isValidNPKLevel(soilInput.K)) {
    return { valid: false, error: 'Invalid K level. Must be low, medium, or high' };
  }
  
  if (soilInput.pH !== null && soilInput.pH !== undefined && !isValidPH(soilInput.pH)) {
    return { valid: false, error: 'Invalid pH value. Must be between 0 and 14' };
  }
  
  return { valid: true };
}

// Register validation
function validateRegister(req, res, next) {
  const { name, email, password, role } = req.body;
  
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ message: 'Name is required' });
  }
  
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: 'Valid email is required' });
  }
  
  if (!password || !isValidPassword(password)) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }
  
  if (role && !['user', 'agronomist'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Must be user or agronomist' });
  }
  
  next();
}

// Login validation
function validateLogin(req, res, next) {
  const { email, password } = req.body;
  
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: 'Valid email is required' });
  }
  
  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }
  
  next();
}

// Recommendation request validation
function validateRecommendationRequest(req, res, next) {
  const { cropId, soilInput, growthStage, area } = req.body;
  
  if (!cropId || cropId.trim().length === 0) {
    return res.status(400).json({ message: 'Crop ID is required' });
  }
  
  const soilValidation = validateSoilInput(soilInput);
  if (!soilValidation.valid) {
    return res.status(400).json({ message: soilValidation.error });
  }
  
  if (!growthStage || !isValidGrowthStage(growthStage)) {
    return res.status(400).json({ message: 'Valid growth stage is required (sowing, vegetative, flowering, fruiting)' });
  }
  
  if (!isValidArea(area)) {
    return res.status(400).json({ message: 'Valid area is required (value > 0)' });
  }
  
  next();
}

// Admin crop validation
function validateCrop(req, res, next) {
  const { cropName } = req.body;
  
  if (!cropName || cropName.trim().length === 0) {
    return res.status(400).json({ message: 'Crop name is required' });
  }
  
  next();
}

// Admin fertilizer validation
function validateFertilizer(req, res, next) {
  const { name, nutrientComposition, type } = req.body;
  
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ message: 'Fertilizer name is required' });
  }
  
  if (!nutrientComposition) {
    return res.status(400).json({ message: 'Nutrient composition is required' });
  }
  
  if (typeof nutrientComposition.N !== 'number' || 
      typeof nutrientComposition.P !== 'number' || 
      typeof nutrientComposition.K !== 'number') {
    return res.status(400).json({ message: 'Nutrient composition (N, P, K) must be numbers' });
  }
  
  if (!type || !['Urea', 'DAP', 'Organic', 'NPK', 'Other'].includes(type)) {
    return res.status(400).json({ message: 'Valid fertilizer type is required' });
  }
  
  next();
}

// Admin rule validation
function validateRule(req, res, next) {
  const { cropId, condition, recommendations } = req.body;
  
  if (!cropId || cropId.trim().length === 0) {
    return res.status(400).json({ message: 'Crop ID is required' });
  }
  
  if (!condition) {
    return res.status(400).json({ message: 'Condition is required' });
  }
  
  if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
    return res.status(400).json({ message: 'Recommendations array is required and must not be empty' });
  }
  
  // Validate each recommendation
  for (const rec of recommendations) {
    if (!rec.fertilizerId || rec.fertilizerId.trim().length === 0) {
      return res.status(400).json({ message: 'Each recommendation must have a fertilizerId' });
    }
    
    if (typeof rec.quantityPerHa !== 'number' || rec.quantityPerHa <= 0) {
      return res.status(400).json({ message: 'Each recommendation must have a valid quantityPerHa (number > 0)' });
    }
  }
  
  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateRecommendationRequest,
  validateCrop,
  validateFertilizer,
  validateRule,
  isValidEmail,
  isValidPassword,
  isValidNPKLevel,
  isValidGrowthStage,
  isValidPH,
  isValidArea,
  validateSoilInput
};

