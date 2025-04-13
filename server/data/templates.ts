import { NewTemplate } from "@shared/schema";

export const premadeTemplates: NewTemplate[] = [
  {
    name: "Beach Vacation",
    description: "Essential items for a relaxing beach getaway",
    categories: [
      { name: "Clothing", description: "Beach and casual wear" },
      { name: "Beach Gear", description: "Items for beach activities" },
      { name: "Toiletries", description: "Personal care items" },
      { name: "Electronics", description: "Gadgets and entertainment" },
      { name: "Documents", description: "Important papers and IDs" }
    ],
    items: [
      { name: "Swimsuits", categoryId: 0, description: "At least 2-3 swimsuits" },
      { name: "Sunglasses", categoryId: 0 },
      { name: "Beach Towels", categoryId: 1 },
      { name: "Sunscreen", categoryId: 2, description: "SPF 30 or higher" },
      { name: "Beach Umbrella", categoryId: 1 },
      { name: "Flip Flops", categoryId: 0 },
      { name: "Beach Bag", categoryId: 1 },
      { name: "Camera", categoryId: 3 },
      { name: "Passport/ID", categoryId: 4 },
      { name: "Travel Insurance", categoryId: 4 }
    ]
  },
  {
    name: "Business Trip",
    description: "Professional travel essentials",
    categories: [
      { name: "Business Attire", description: "Professional clothing" },
      { name: "Work Essentials", description: "Office and work items" },
      { name: "Electronics", description: "Work devices and accessories" },
      { name: "Personal Care", description: "Grooming and hygiene" },
      { name: "Documents", description: "Business papers and IDs" }
    ],
    items: [
      { name: "Business Suit", categoryId: 0 },
      { name: "Dress Shoes", categoryId: 0 },
      { name: "Laptop", categoryId: 2 },
      { name: "Business Cards", categoryId: 4 },
      { name: "Presentation Materials", categoryId: 1 },
      { name: "Travel Adapter", categoryId: 2 },
      { name: "Portfolio", categoryId: 1 },
      { name: "Toiletries", categoryId: 3 },
      { name: "ID/Passport", categoryId: 4 },
      { name: "Meeting Notes", categoryId: 1 }
    ]
  },
  {
    name: "Camping Trip",
    description: "Outdoor adventure essentials",
    categories: [
      { name: "Shelter", description: "Camping equipment" },
      { name: "Cooking", description: "Food preparation items" },
      { name: "Clothing", description: "Outdoor wear" },
      { name: "Safety", description: "First aid and emergency items" },
      { name: "Personal Items", description: "Comfort and hygiene" }
    ],
    items: [
      { name: "Tent", categoryId: 0 },
      { name: "Sleeping Bag", categoryId: 0 },
      { name: "Camping Stove", categoryId: 1 },
      { name: "First Aid Kit", categoryId: 3 },
      { name: "Hiking Boots", categoryId: 2 },
      { name: "Water Bottle", categoryId: 1 },
      { name: "Flashlight", categoryId: 3 },
      { name: "Bug Spray", categoryId: 3 },
      { name: "Map/Compass", categoryId: 3 },
      { name: "Toilet Paper", categoryId: 4 }
    ]
  },
  {
    name: "Ski Trip",
    description: "Winter sports vacation essentials",
    categories: [
      { name: "Ski Gear", description: "Equipment for skiing" },
      { name: "Winter Clothing", description: "Cold weather wear" },
      { name: "Accessories", description: "Additional winter items" },
      { name: "Personal Care", description: "Cold weather care" },
      { name: "Documents", description: "Important papers" }
    ],
    items: [
      { name: "Ski Jacket", categoryId: 1 },
      { name: "Ski Pants", categoryId: 1 },
      { name: "Ski Goggles", categoryId: 2 },
      { name: "Gloves", categoryId: 2 },
      { name: "Thermal Underwear", categoryId: 1 },
      { name: "Ski Pass", categoryId: 4 },
      { name: "Lip Balm", categoryId: 3 },
      { name: "Sunscreen", categoryId: 3 },
      { name: "Ski Boots", categoryId: 0 },
      { name: "Helmet", categoryId: 0 }
    ]
  },
  {
    name: "Road Trip",
    description: "Essential items for a long drive",
    categories: [
      { name: "Car Essentials", description: "Vehicle items" },
      { name: "Navigation", description: "Maps and guides" },
      { name: "Comfort", description: "Travel comfort items" },
      { name: "Entertainment", description: "Fun for the road" },
      { name: "Emergency", description: "Safety items" }
    ],
    items: [
      { name: "Car Documents", categoryId: 0 },
      { name: "GPS Device", categoryId: 1 },
      { name: "Road Atlas", categoryId: 1 },
      { name: "Pillows", categoryId: 2 },
      { name: "Snacks", categoryId: 2 },
      { name: "Music Playlist", categoryId: 3 },
      { name: "First Aid Kit", categoryId: 4 },
      { name: "Jumper Cables", categoryId: 4 },
      { name: "Blanket", categoryId: 2 },
      { name: "Water Bottles", categoryId: 2 }
    ]
  },
  {
    name: "Music Festival",
    description: "Essentials for a music festival",
    categories: [
      { name: "Camping Gear", description: "Festival camping items" },
      { name: "Clothing", description: "Festival wear" },
      { name: "Accessories", description: "Festival essentials" },
      { name: "Personal Care", description: "Hygiene items" },
      { name: "Documents", description: "Tickets and IDs" }
    ],
    items: [
      { name: "Tent", categoryId: 0 },
      { name: "Sleeping Bag", categoryId: 0 },
      { name: "Rain Poncho", categoryId: 1 },
      { name: "Festival Tickets", categoryId: 4 },
      { name: "ID", categoryId: 4 },
      { name: "Portable Charger", categoryId: 2 },
      { name: "Sunscreen", categoryId: 3 },
      { name: "Wet Wipes", categoryId: 3 },
      { name: "Ear Plugs", categoryId: 2 },
      { name: "Water Bottle", categoryId: 2 }
    ]
  },
  {
    name: "Honeymoon",
    description: "Romantic getaway essentials",
    categories: [
      { name: "Clothing", description: "Romantic outfits" },
      { name: "Accessories", description: "Special items" },
      { name: "Toiletries", description: "Personal care" },
      { name: "Documents", description: "Important papers" },
      { name: "Romantic Items", description: "Special touches" }
    ],
    items: [
      { name: "Dressy Outfits", categoryId: 0 },
      { name: "Swimwear", categoryId: 0 },
      { name: "Passport", categoryId: 3 },
      { name: "Travel Documents", categoryId: 3 },
      { name: "Camera", categoryId: 1 },
      { name: "Romantic Music", categoryId: 4 },
      { name: "Special Perfume", categoryId: 2 },
      { name: "Jewelry", categoryId: 1 },
      { name: "Massage Oil", categoryId: 4 },
      { name: "Champagne", categoryId: 4 }
    ]
  },
  {
    name: "Backpacking",
    description: "Lightweight travel essentials",
    categories: [
      { name: "Shelter", description: "Sleeping equipment" },
      { name: "Cooking", description: "Food preparation" },
      { name: "Clothing", description: "Lightweight wear" },
      { name: "Navigation", description: "Maps and guides" },
      { name: "Safety", description: "Emergency items" }
    ],
    items: [
      { name: "Backpack", categoryId: 0 },
      { name: "Sleeping Bag", categoryId: 0 },
      { name: "Tent", categoryId: 0 },
      { name: "Water Filter", categoryId: 1 },
      { name: "Hiking Boots", categoryId: 2 },
      { name: "Map", categoryId: 3 },
      { name: "Compass", categoryId: 3 },
      { name: "First Aid Kit", categoryId: 4 },
      { name: "Headlamp", categoryId: 4 },
      { name: "Multi-tool", categoryId: 4 }
    ]
  },
  {
    name: "Cruise Vacation",
    description: "Ocean voyage essentials",
    categories: [
      { name: "Clothing", description: "Cruise wear" },
      { name: "Formal Wear", description: "Dinner attire" },
      { name: "Toiletries", description: "Personal care" },
      { name: "Documents", description: "Cruise papers" },
      { name: "Accessories", description: "Additional items" }
    ],
    items: [
      { name: "Cruise Documents", categoryId: 3 },
      { name: "Passport", categoryId: 3 },
      { name: "Formal Attire", categoryId: 1 },
      { name: "Swimwear", categoryId: 0 },
      { name: "Sunscreen", categoryId: 2 },
      { name: "Binoculars", categoryId: 4 },
      { name: "Sea Sickness Pills", categoryId: 2 },
      { name: "Evening Gown/Suit", categoryId: 1 },
      { name: "Water Shoes", categoryId: 0 },
      { name: "Camera", categoryId: 4 }
    ]
  },
  {
    name: "Golf Trip",
    description: "Golf vacation essentials",
    categories: [
      { name: "Golf Equipment", description: "Golf gear" },
      { name: "Clothing", description: "Golf attire" },
      { name: "Accessories", description: "Additional items" },
      { name: "Personal Care", description: "Grooming items" },
      { name: "Documents", description: "Important papers" }
    ],
    items: [
      { name: "Golf Clubs", categoryId: 0 },
      { name: "Golf Balls", categoryId: 0 },
      { name: "Golf Shoes", categoryId: 1 },
      { name: "Golf Gloves", categoryId: 1 },
      { name: "Golf Tees", categoryId: 0 },
      { name: "Golf Cap", categoryId: 1 },
      { name: "Sunscreen", categoryId: 3 },
      { name: "Tee Times", categoryId: 4 },
      { name: "Golf Towel", categoryId: 2 },
      { name: "Scorecard", categoryId: 4 }
    ]
  },
  {
    name: "Photography Trip",
    description: "Photo expedition essentials",
    categories: [
      { name: "Camera Gear", description: "Photography equipment" },
      { name: "Accessories", description: "Additional gear" },
      { name: "Storage", description: "Data storage" },
      { name: "Protection", description: "Equipment safety" },
      { name: "Personal Items", description: "Comfort items" }
    ],
    items: [
      { name: "Camera Body", categoryId: 0 },
      { name: "Lenses", categoryId: 0 },
      { name: "Tripod", categoryId: 1 },
      { name: "Memory Cards", categoryId: 2 },
      { name: "Camera Bag", categoryId: 3 },
      { name: "Lens Cleaner", categoryId: 1 },
      { name: "Extra Batteries", categoryId: 0 },
      { name: "Laptop", categoryId: 2 },
      { name: "Rain Cover", categoryId: 3 },
      { name: "Comfortable Shoes", categoryId: 4 }
    ]
  },
  {
    name: "Family Vacation",
    description: "Family trip essentials",
    categories: [
      { name: "Kids Items", description: "Children's needs" },
      { name: "Entertainment", description: "Fun activities" },
      { name: "Snacks", description: "Food items" },
      { name: "Safety", description: "Child safety items" },
      { name: "Documents", description: "Family papers" }
    ],
    items: [
      { name: "Diapers", categoryId: 0 },
      { name: "Baby Wipes", categoryId: 0 },
      { name: "Toys", categoryId: 1 },
      { name: "Books", categoryId: 1 },
      { name: "Snacks", categoryId: 2 },
      { name: "First Aid Kit", categoryId: 3 },
      { name: "Child ID Tags", categoryId: 3 },
      { name: "Stroller", categoryId: 0 },
      { name: "Car Seats", categoryId: 3 },
      { name: "Family Documents", categoryId: 4 }
    ]
  },
  {
    name: "Business Conference",
    description: "Conference essentials",
    categories: [
      { name: "Business Items", description: "Work materials" },
      { name: "Electronics", description: "Tech devices" },
      { name: "Networking", description: "Meeting items" },
      { name: "Personal Care", description: "Grooming items" },
      { name: "Documents", description: "Conference papers" }
    ],
    items: [
      { name: "Business Cards", categoryId: 2 },
      { name: "Laptop", categoryId: 1 },
      { name: "Notebook", categoryId: 0 },
      { name: "Conference Schedule", categoryId: 4 },
      { name: "Name Badge", categoryId: 2 },
      { name: "Portfolio", categoryId: 0 },
      { name: "Chargers", categoryId: 1 },
      { name: "Professional Attire", categoryId: 0 },
      { name: "Breath Mints", categoryId: 3 },
      { name: "Conference Tickets", categoryId: 4 }
    ]
  },
  {
    name: "Safari Trip",
    description: "Wildlife adventure essentials",
    categories: [
      { name: "Clothing", description: "Safari wear" },
      { name: "Equipment", description: "Safari gear" },
      { name: "Health", description: "Medical items" },
      { name: "Documents", description: "Travel papers" },
      { name: "Accessories", description: "Additional items" }
    ],
    items: [
      { name: "Neutral Clothing", categoryId: 0 },
      { name: "Safari Hat", categoryId: 0 },
      { name: "Binoculars", categoryId: 1 },
      { name: "Camera", categoryId: 1 },
      { name: "Malaria Pills", categoryId: 2 },
      { name: "Vaccination Records", categoryId: 3 },
      { name: "Passport", categoryId: 3 },
      { name: "Sunscreen", categoryId: 2 },
      { name: "Insect Repellent", categoryId: 2 },
      { name: "Water Bottle", categoryId: 4 }
    ]
  },
  {
    name: "Ski Weekend",
    description: "Short ski trip essentials",
    categories: [
      { name: "Ski Gear", description: "Skiing equipment" },
      { name: "Clothing", description: "Winter wear" },
      { name: "Accessories", description: "Additional items" },
      { name: "Personal Care", description: "Cold weather care" },
      { name: "Documents", description: "Important papers" }
    ],
    items: [
      { name: "Ski Jacket", categoryId: 1 },
      { name: "Ski Pants", categoryId: 1 },
      { name: "Ski Goggles", categoryId: 2 },
      { name: "Gloves", categoryId: 2 },
      { name: "Ski Pass", categoryId: 4 },
      { name: "Lip Balm", categoryId: 3 },
      { name: "Sunscreen", categoryId: 3 },
      { name: "Ski Boots", categoryId: 0 },
      { name: "Helmet", categoryId: 0 },
      { name: "Thermal Underwear", categoryId: 1 }
    ]
  },
  {
    name: "Music Tour",
    description: "Concert tour essentials",
    categories: [
      { name: "Equipment", description: "Music gear" },
      { name: "Clothing", description: "Stage wear" },
      { name: "Accessories", description: "Additional items" },
      { name: "Personal Care", description: "Grooming items" },
      { name: "Documents", description: "Tour papers" }
    ],
    items: [
      { name: "Instruments", categoryId: 0 },
      { name: "Stage Clothes", categoryId: 1 },
      { name: "Ear Plugs", categoryId: 2 },
      { name: "Set Lists", categoryId: 4 },
      { name: "Touring Schedule", categoryId: 4 },
      { name: "Spare Strings", categoryId: 0 },
      { name: "Tuner", categoryId: 0 },
      { name: "Stage Makeup", categoryId: 3 },
      { name: "Merchandise", categoryId: 2 },
      { name: "Tour Passes", categoryId: 4 }
    ]
  },
  {
    name: "Yoga Retreat",
    description: "Wellness getaway essentials",
    categories: [
      { name: "Yoga Gear", description: "Yoga equipment" },
      { name: "Clothing", description: "Comfortable wear" },
      { name: "Personal Care", description: "Wellness items" },
      { name: "Accessories", description: "Additional items" },
      { name: "Documents", description: "Retreat papers" }
    ],
    items: [
      { name: "Yoga Mat", categoryId: 0 },
      { name: "Yoga Blocks", categoryId: 0 },
      { name: "Comfortable Clothes", categoryId: 1 },
      { name: "Water Bottle", categoryId: 2 },
      { name: "Meditation Cushion", categoryId: 0 },
      { name: "Essential Oils", categoryId: 2 },
      { name: "Journal", categoryId: 4 },
      { name: "Retreat Schedule", categoryId: 4 },
      { name: "Comfortable Shoes", categoryId: 1 },
      { name: "Eye Pillow", categoryId: 2 }
    ]
  },
  {
    name: "Food Tour",
    description: "Culinary adventure essentials",
    categories: [
      { name: "Cooking Gear", description: "Kitchen equipment" },
      { name: "Clothing", description: "Comfortable wear" },
      { name: "Accessories", description: "Additional items" },
      { name: "Personal Care", description: "Hygiene items" },
      { name: "Documents", description: "Tour papers" }
    ],
    items: [
      { name: "Chef's Knife", categoryId: 0 },
      { name: "Apron", categoryId: 1 },
      { name: "Recipe Book", categoryId: 4 },
      { name: "Food Journal", categoryId: 4 },
      { name: "Comfortable Shoes", categoryId: 1 },
      { name: "Hand Sanitizer", categoryId: 3 },
      { name: "Food Containers", categoryId: 0 },
      { name: "Tour Schedule", categoryId: 4 },
      { name: "Camera", categoryId: 2 },
      { name: "Tasting Notes", categoryId: 4 }
    ]
  },
  {
    name: "Art Tour",
    description: "Art exploration essentials",
    categories: [
      { name: "Art Supplies", description: "Creative materials" },
      { name: "Clothing", description: "Comfortable wear" },
      { name: "Accessories", description: "Additional items" },
      { name: "Personal Care", description: "Hygiene items" },
      { name: "Documents", description: "Tour papers" }
    ],
    items: [
      { name: "Sketchbook", categoryId: 0 },
      { name: "Pencils", categoryId: 0 },
      { name: "Camera", categoryId: 2 },
      { name: "Museum Pass", categoryId: 4 },
      { name: "Comfortable Shoes", categoryId: 1 },
      { name: "Art Guide", categoryId: 4 },
      { name: "Water Bottle", categoryId: 2 },
      { name: "Tour Schedule", categoryId: 4 },
      { name: "Notebook", categoryId: 0 },
      { name: "Gallery Map", categoryId: 4 }
    ]
  },
  {
    name: "Sports Event",
    description: "Game day essentials",
    categories: [
      { name: "Team Gear", description: "Fan items" },
      { name: "Clothing", description: "Game day wear" },
      { name: "Accessories", description: "Additional items" },
      { name: "Personal Care", description: "Comfort items" },
      { name: "Documents", description: "Tickets and IDs" }
    ],
    items: [
      { name: "Team Jersey", categoryId: 0 },
      { name: "Tickets", categoryId: 4 },
      { name: "Team Hat", categoryId: 0 },
      { name: "Sunscreen", categoryId: 3 },
      { name: "Binoculars", categoryId: 2 },
      { name: "Team Colors", categoryId: 1 },
      { name: "Stadium Map", categoryId: 4 },
      { name: "Camera", categoryId: 2 },
      { name: "Team Flag", categoryId: 0 },
      { name: "ID", categoryId: 4 }
    ]
  }
]; 