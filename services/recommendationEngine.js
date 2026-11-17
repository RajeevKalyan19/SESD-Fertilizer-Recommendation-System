const Rule = require('../models/Rule');
const Fertilizer = require('../models/Fertilizer');
const Crop = require('../models/Crop');

// Helper function to check if value is in range
function isInRange(value, min, max) {
  // If no range specified, match any value
  if (min === null || max === null || min === undefined || max === undefined) return true;
  // If value is not provided, skip pH check (match any)
  if (value === null || value === undefined) return true;
  return value >= min && value <= max;
}

// Helper function to match NPK levels
function matchesNPK(conditionNPK, inputNPK) {
  if (!conditionNPK) return true;
  
  const matches = {
    N: !conditionNPK.N || conditionNPK.N === inputNPK.N,
    P: !conditionNPK.P || conditionNPK.P === inputNPK.P,
    K: !conditionNPK.K || conditionNPK.K === inputNPK.K
  };
  
  return matches.N && matches.P && matches.K;
}

// Helper function to match growth stage
function matchesGrowthStage(conditionStage, inputStage) {
  if (!conditionStage) return true;
  return conditionStage === inputStage;
}

// Calculate quantity based on area
function calculateQuantity(quantityPerHa, area) {
  const areaInHa = area.unit === 'hectare' ? area.value : area.value / 10000; // Convert acres to hectares (1 hectare = 10000 m², simplified)
  return Math.round(quantityPerHa * areaInHa * 100) / 100; // Round to 2 decimal places
}

async function generateRecommendation({ cropId, soilInput, growthStage, area }) {
  try {
    // Validate inputs
    if (!cropId) {
      throw new Error('Crop ID is required');
    }
    if (!soilInput || !soilInput.N || !soilInput.P || !soilInput.K) {
      throw new Error('Soil NPK levels (N, P, K) are required');
    }
    if (!growthStage) {
      throw new Error('Growth stage is required');
    }
    if (!area || !area.value) {
      throw new Error('Area is required');
    }
    
    // Find all rules for this crop
    const rules = await Rule.find({ cropId });
    
    // If no rules, we'll use crop defaults later
    if (rules.length === 0) {
      console.log(`No rules found for crop ${cropId}, will use crop defaults`);
    }

    // Find matching rules
    const matchingRules = rules.filter(rule => {
      const condition = rule.condition;
      
      // Check pH range
      const pHMatch = !condition.soilPhRange || 
        isInRange(soilInput.pH, condition.soilPhRange.min, condition.soilPhRange.max);
      
      // Check NPK levels
      const npkMatch = matchesNPK(condition.NPK, soilInput);
      
      // Check growth stage
      const growthMatch = matchesGrowthStage(condition.growthStage, growthStage);
      
      return pHMatch && npkMatch && growthMatch;
    });

    // Aggregate recommendations from all matching rules
    const fertilizerMap = new Map();
    const recommendations = [];
    
    if (matchingRules.length > 0) {
      for (const rule of matchingRules) {
        if (rule.recommendations && rule.recommendations.length > 0) {
          for (const rec of rule.recommendations) {
            const key = rec.fertilizerId;
            if (fertilizerMap.has(key)) {
              // If fertilizer already exists, take the maximum quantity
              const existing = fertilizerMap.get(key);
              existing.quantityPerHa = Math.max(existing.quantityPerHa, rec.quantityPerHa || 0);
              if (rec.timing) {
                existing.timing = rec.timing;
              }
            } else {
              fertilizerMap.set(key, {
                fertilizerId: rec.fertilizerId,
                quantityPerHa: rec.quantityPerHa || 0,
                timing: rec.timing
              });
            }
          }
        }
      }

      // Get fertilizer details and build final recommendations from rules
      for (const [fertilizerId, data] of fertilizerMap) {
        const fertilizer = await Fertilizer.findOne({ fertilizerId });
        if (fertilizer) {
          const quantity = calculateQuantity(data.quantityPerHa, area);
          recommendations.push({
            fertilizerId: fertilizer.fertilizerId,
            fertilizerName: fertilizer.name,
            quantity: quantity,
            unit: area.unit === 'hectare' ? 'kg' : 'kg',
            timing: data.timing || 'Apply as per schedule',
            instructions: fertilizer.instructions || 'Follow standard application procedures'
          });
        }
      }
    } else {
      console.log('No matching rules found, falling back to crop defaults');
    }

    // If no recommendations found, use crop defaults
    if (recommendations.length === 0) {
      const crop = await Crop.findOne({ cropId });
      if (!crop) {
        throw new Error(`Crop with ID ${cropId} not found`);
      }
      
      if (crop.recommendedFertilizers && crop.recommendedFertilizers.length > 0) {
        for (const recFert of crop.recommendedFertilizers) {
          const fertilizer = await Fertilizer.findOne({ fertilizerId: recFert.fertilizerId });
          if (fertilizer) {
            // Determine which nutrient this fertilizer provides
            let npkLevel = 'medium'; // default
            if (fertilizer.nutrientComposition.N > 0 && soilInput.N) {
              npkLevel = soilInput.N;
            } else if (fertilizer.nutrientComposition.P > 0 && soilInput.P) {
              npkLevel = soilInput.P;
            } else if (fertilizer.nutrientComposition.K > 0 && soilInput.K) {
              npkLevel = soilInput.K;
            }
            
            const dosage = (recFert.dosageRules && recFert.dosageRules[npkLevel]) 
              || (recFert.dosageRules && recFert.dosageRules.medium) 
              || 100;
            const quantity = calculateQuantity(dosage, area);
            
            recommendations.push({
              fertilizerId: fertilizer.fertilizerId,
              fertilizerName: fertilizer.name,
              quantity: quantity,
              unit: 'kg',
              timing: `Apply during ${growthStage} stage`,
              instructions: fertilizer.instructions || 'Follow standard application procedures'
            });
          }
        }
      } else {
        throw new Error(`No recommended fertilizers found for crop ${crop.cropName}`);
      }
    }
    
    // Final check - if still no recommendations, provide a generic one
    if (recommendations.length === 0) {
      throw new Error('Unable to generate recommendations. Please ensure the database has been seeded with crops, fertilizers, and rules.');
    }

    return recommendations;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  generateRecommendation
};

