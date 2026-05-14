const TECH_TO_KITCHEN = {
  "Image Processing": "Family Meal",
  "Data Sync": "Pasta Order",
  "Report Build": "Dessert Plating",
  "Video Encode": "Banquet Prep",
  "Thumbnail Gen": "Snack Plating",
  "ML Inference": "Signature Dish",
  "Server": "Chef",
};

const KITCHEN_TO_TECH = Object.fromEntries(
  Object.entries(TECH_TO_KITCHEN).map(([k, v]) => [v, k]),
);

export function mapNameForView(originalName, isKitchen) {
  if (!originalName) return originalName;

  // if original looks like a technical name that exists in map
  if (!isKitchen) {
    // technical view -> show original
    return originalName;
  }

  // kitchen view requested
  // if original matches a technical key, map it
  if (TECH_TO_KITCHEN[originalName]) return TECH_TO_KITCHEN[originalName];

  // if original already looks like kitchen name, return it
  if (KITCHEN_TO_TECH[originalName]) return originalName;

  // try to detect technical keywords inside name
  for (const [tech, kitchen] of Object.entries(TECH_TO_KITCHEN)) {
    if (originalName.toLowerCase().includes(tech.split(" ")[0].toLowerCase())) {
      return kitchen;
    }
  }

  // fallback: return original
  return originalName;
}

export function mapNamePair(originalName) {
  // returns { techName, kitchenName }
  if (!originalName) return { techName: originalName, kitchenName: originalName };

  // if name matches a technical key
  if (TECH_TO_KITCHEN[originalName]) {
    return { techName: originalName, kitchenName: TECH_TO_KITCHEN[originalName] };
  }

  // if name matches a kitchen value
  if (KITCHEN_TO_TECH[originalName]) {
    return { techName: KITCHEN_TO_TECH[originalName], kitchenName: originalName };
  }

  // heuristics: if name contains common technical words, assume technical
  const techKeywords = Object.keys(TECH_TO_KITCHEN);
  for (const tech of techKeywords) {
    const techBase = tech.split(" ")[0].toLowerCase();
    if (originalName.toLowerCase().includes(techBase)) {
      // extract suffix (e.g., " A" from "Server A")
      const suffix = originalName.substring(tech.length);
      const kitchenBase = TECH_TO_KITCHEN[tech];
      
      return { 
        techName: originalName, 
        kitchenName: `${kitchenBase}${suffix}` 
      };
    }
  }

  // fallback: use same name for both
  return { techName: originalName, kitchenName: originalName };
}
