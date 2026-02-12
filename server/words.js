export const words = {
  Places: [
    { word: "Beach", similar: "Desert", hint: "Natural outdoor location" },
    { word: "Airport", similar: "Railway Station", hint: "Travel hub" },
    { word: "Mountain", similar: "Hill", hint: "Elevated landform" },
    { word: "Library", similar: "Museum", hint: "Public building for knowledge" },
    { word: "Restaurant", similar: "Cafe", hint: "Place to eat" },
    { word: "Hospital", similar: "Clinic", hint: "Medical facility" },
    { word: "Park", similar: "Garden", hint: "Outdoor recreation area" },
    { word: "School", similar: "University", hint: "Educational institution" }
  ],
  Movies: [
    { word: "Inception", similar: "Interstellar", hint: "Christopher Nolan film" },
    { word: "Titanic", similar: "Poseidon", hint: "Disaster movie on water" },
    { word: "Jaws", similar: "The Meg", hint: "Ocean creature thriller" },
    { word: "Avatar", similar: "Valerian", hint: "Sci-fi visual spectacle" },
    { word: "The Matrix", similar: "Ready Player One", hint: "Virtual reality film" },
    { word: "Frozen", similar: "Tangled", hint: "Disney animated musical" }
  ],
  Food: [
    { word: "Pizza", similar: "Burger", hint: "Fast food item" },
    { word: "Sushi", similar: "Sashimi", hint: "Japanese cuisine" },
    { word: "Pasta", similar: "Noodles", hint: "Grain-based dish" },
    { word: "Taco", similar: "Burrito", hint: "Mexican food" },
    { word: "Cake", similar: "Pie", hint: "Baked dessert" },
    { word: "Ice Cream", similar: "Frozen Yogurt", hint: "Cold dessert" }
  ],
  Animals: [
    { word: "Lion", similar: "Tiger", hint: "Big cat" },
    { word: "Elephant", similar: "Rhino", hint: "Large land mammal" },
    { word: "Dolphin", similar: "Whale", hint: "Marine mammal" },
    { word: "Eagle", similar: "Hawk", hint: "Bird of prey" },
    { word: "Snake", similar: "Lizard", hint: "Reptile" },
    { word: "Butterfly", similar: "Moth", hint: "Flying insect" }
  ],
  Sports: [
    { word: "Basketball", similar: "Volleyball", hint: "Team ball sport" },
    { word: "Tennis", similar: "Badminton", hint: "Racket sport" },
    { word: "Soccer", similar: "Hockey", hint: "Field team sport" },
    { word: "Swimming", similar: "Diving", hint: "Water sport" },
    { word: "Boxing", similar: "Wrestling", hint: "Combat sport" },
    { word: "Golf", similar: "Cricket", hint: "Sport with a ball and stick" }
  ]
};

export const categories = Object.keys(words);
