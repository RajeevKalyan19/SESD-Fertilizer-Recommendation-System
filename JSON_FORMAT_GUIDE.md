# JSON Format Guide for Admin Panel

This guide shows the correct JSON formats for adding/editing data in the Admin Panel.

## 1. Rules - Recommendations Field

When adding or editing a rule in the **Rules Tab**, the **Recommendations** field should be a JSON array of recommendation objects.

### Format:
```json
[
  {
    "fertilizerId": "FERT001",
    "quantityPerHa": 150,
    "timing": "Apply now and again after 30 days"
  },
  {
    "fertilizerId": "FERT002",
    "quantityPerHa": 100,
    "timing": "Apply at sowing"
  }
]
```

### Single Recommendation Example:
```json
[
  {
    "fertilizerId": "FERT001",
    "quantityPerHa": 120,
    "timing": "Apply during tillering stage"
  }
]
```

### Multiple Recommendations Example:
```json
[
  {
    "fertilizerId": "FERT003",
    "quantityPerHa": 150,
    "timing": "Apply during flowering and fruiting"
  },
  {
    "fertilizerId": "FERT004",
    "quantityPerHa": 150,
    "timing": "Apply during vegetative growth"
  }
]
```

### Field Descriptions:
- **fertilizerId** (required): The ID of the fertilizer (e.g., "FERT001", "FERT002")
- **quantityPerHa** (required): Quantity in kg per hectare (number)
- **timing** (optional): When to apply the fertilizer (string)

---

## 2. Available Fertilizer IDs

Use these fertilizer IDs from the seed data:

- `FERT001` - Urea (N: 46%, P: 0%, K: 0%)
- `FERT002` - DAP (Diammonium Phosphate) (N: 18%, P: 46%, K: 0%)
- `FERT003` - MOP (Muriate of Potash) (N: 0%, P: 0%, K: 60%)
- `FERT004` - NPK 19:19:19 (N: 19%, P: 19%, K: 19%)
- `FERT005` - Organic Compost (N: 2%, P: 1%, K: 1%)

---

## 3. Complete Rule Example

Here's a complete example of a rule structure:

```json
{
  "ruleId": "RULE001",
  "cropId": "CROP001",
  "condition": {
    "soilPhRange": {
      "min": 5.5,
      "max": 7.0
    },
    "NPK": {
      "N": "low",
      "P": null,
      "K": null
    },
    "growthStage": "vegetative"
  },
  "recommendations": [
    {
      "fertilizerId": "FERT001",
      "quantityPerHa": 150,
      "timing": "Apply now and again after 30 days"
    },
    {
      "fertilizerId": "FERT002",
      "quantityPerHa": 100,
      "timing": "Apply at sowing"
    }
  ]
}
```

**Note:** In the admin form, you only need to paste the `recommendations` array in the Recommendations field.

---

## 4. Common Examples

### Example 1: Low Nitrogen for Rice (Vegetative Stage)
```json
[
  {
    "fertilizerId": "FERT001",
    "quantityPerHa": 150,
    "timing": "Apply now and again after 30 days"
  }
]
```

### Example 2: Low Phosphorus at Sowing
```json
[
  {
    "fertilizerId": "FERT002",
    "quantityPerHa": 100,
    "timing": "Apply at sowing"
  }
]
```

### Example 3: Low Potassium during Flowering
```json
[
  {
    "fertilizerId": "FERT003",
    "quantityPerHa": 80,
    "timing": "Apply during flowering stage"
  }
]
```

### Example 4: Multiple Fertilizers
```json
[
  {
    "fertilizerId": "FERT003",
    "quantityPerHa": 150,
    "timing": "Apply during flowering and fruiting"
  },
  {
    "fertilizerId": "FERT004",
    "quantityPerHa": 150,
    "timing": "Apply during vegetative growth"
  }
]
```

---

## 5. Tips for Using JSON in Admin Panel

1. **Always use an array** `[...]` even for a single recommendation
2. **Use double quotes** for all strings (not single quotes)
3. **No trailing commas** after the last item
4. **Valid JSON** - Make sure your JSON is valid (you can validate it at jsonlint.com)
5. **Fertilizer IDs** must match existing fertilizers in the database

---

## 6. Validating JSON

Before submitting, ensure your JSON is valid. Common errors:

❌ **Wrong:**
```json
[
  {
    'fertilizerId': 'FERT001',  // Single quotes
    "quantityPerHa": 150,
    "timing": "Apply now"
  },  // Trailing comma
]
```

✅ **Correct:**
```json
[
  {
    "fertilizerId": "FERT001",
    "quantityPerHa": 150,
    "timing": "Apply now"
  }
]
```

---

## 7. Quick Copy-Paste Templates

### Template 1: Single Urea Recommendation
```json
[
  {
    "fertilizerId": "FERT001",
    "quantityPerHa": 100,
    "timing": "Apply as per schedule"
  }
]
```

### Template 2: Single DAP Recommendation
```json
[
  {
    "fertilizerId": "FERT002",
    "quantityPerHa": 80,
    "timing": "Apply at sowing"
  }
]
```

### Template 3: Single MOP Recommendation
```json
[
  {
    "fertilizerId": "FERT003",
    "quantityPerHa": 60,
    "timing": "Apply during flowering"
  }
]
```

### Template 4: Balanced NPK Recommendation
```json
[
  {
    "fertilizerId": "FERT004",
    "quantityPerHa": 150,
    "timing": "Apply during vegetative growth"
  }
]
```

---

## 8. Testing Your JSON

After pasting JSON in the admin form:
1. Click "Save Rule"
2. If JSON is invalid, you'll see an error message
3. If valid, the rule will be saved successfully
4. You can test the rule by requesting a recommendation that matches the rule conditions

---

## Need Help?

If you encounter errors:
1. Check the browser console (F12) for detailed error messages
2. Validate your JSON at https://jsonlint.com
3. Ensure fertilizer IDs exist in the database
4. Check that all required fields are present

