export const PACK_ORDER = [
  "starter-daily",
  "starter-world",
  "starter-adventure",
];

export const PACK_META = {
  "starter-daily": {
    label: "Daily Things",
    icon: "🏠",
    description: "Home, school, kitchen, bathroom, and clothes words for everyday life.",
  },
  "starter-world": {
    label: "World Explorer",
    icon: "🌍",
    description: "Animals, food, nature, city, and people words for the outside world.",
  },
  "starter-adventure": {
    label: "Adventure Vault",
    icon: "🗝️",
    description: "Vehicles, toys, sports, and fantasy words with a more collectible feel.",
  },
};

export const CATEGORY_ORDER = [
  "animals",
  "food",
  "vehicles",
  "home",
  "clothes",
  "nature",
  "toys",
  "school",
  "kitchen",
  "fantasy",
  "city",
  "bathroom",
  "people-jobs",
  "sports",
];

export const LEGACY_CATEGORY_ALIASES = {
  "home-objects": "home",
  "school-objects": "school",
  "kitchen-objects": "kitchen",
};

export const CATEGORY_META = {
  animals: { label: "Animals", accent: "#ff9f6e", icon: "🐾", packId: "starter-world" },
  food: { label: "Food", accent: "#ffcf66", icon: "🍎", packId: "starter-world" },
  vehicles: { label: "Vehicles", accent: "#56d2ff", icon: "🚗", packId: "starter-adventure" },
  home: { label: "Home", accent: "#90f2c8", icon: "🏠", packId: "starter-daily" },
  clothes: { label: "Clothes", accent: "#ff92c7", icon: "👕", packId: "starter-daily" },
  nature: { label: "Nature", accent: "#6fe68e", icon: "🌳", packId: "starter-world" },
  toys: { label: "Toys", accent: "#ff8f5e", icon: "🧸", packId: "starter-adventure" },
  school: { label: "School", accent: "#9bb3ff", icon: "✏️", packId: "starter-daily" },
  kitchen: { label: "Kitchen", accent: "#ffd07e", icon: "🥣", packId: "starter-daily" },
  fantasy: { label: "Fantasy", accent: "#f5a4ff", icon: "🐉", packId: "starter-adventure" },
  city: { label: "City", accent: "#87b7ff", icon: "🌆", packId: "starter-world" },
  bathroom: { label: "Bathroom", accent: "#7fd9ff", icon: "🪥", packId: "starter-daily" },
  "people-jobs": { label: "People & Jobs", accent: "#ffb276", icon: "🧑", packId: "starter-world" },
  sports: { label: "Sports", accent: "#78f0cb", icon: "🏆", packId: "starter-adventure" },
};

export const DIFFICULTY_META = {
  1: { label: "Starter", hint: "Short, familiar, easy to picture" },
  2: { label: "Explorer", hint: "A little bigger or more adventurous" },
  3: { label: "Collector", hint: "Longer or more special-feeling cards" },
};
