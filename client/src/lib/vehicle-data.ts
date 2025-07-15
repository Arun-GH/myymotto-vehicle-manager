// Vehicle makes and models data for Indian market
export const vehicleData = {
  "Maruti Suzuki": [
    "Alto", "Swift", "Baleno", "Wagon R", "Dzire", "Vitara Brezza", "Ertiga", 
    "Ciaz", "S-Cross", "XL6", "Grand Vitara", "Celerio", "Ignis", "Eeco"
  ],
  "Hyundai": [
    "i10", "i20", "Verna", "Creta", "Venue", "Santro", "Alcazar", "Tucson", 
    "Elantra", "Kona Electric", "i20 N Line", "Aura"
  ],
  "Tata": [
    "Nano", "Tiago", "Tigor", "Nexon", "Harrier", "Safari", "Punch", "Altroz", 
    "Hexa", "Zest", "Bolt", "Indica", "Indigo"
  ],
  "Mahindra": [
    "Scorpio", "XUV500", "XUV300", "Bolero", "TUV300", "KUV100", "Thar", 
    "XUV700", "Marazzo", "Alturas G4", "Scorpio N"
  ],
  "Honda": [
    "City", "Amaze", "Jazz", "WR-V", "CR-V", "Civic", "Accord", "BR-V", 
    "Pilot", "Ridgeline"
  ],
  "Toyota": [
    "Innova Crysta", "Fortuner", "Etios", "Liva", "Corolla Altis", "Camry", 
    "Prius", "Glanza", "Urban Cruiser", "Vellfire"
  ],
  "Ford": [
    "EcoSport", "Endeavour", "Figo", "Aspire", "Freestyle", "Mustang", 
    "Ranger", "Transit"
  ],
  "Renault": [
    "Kwid", "Duster", "Captur", "Lodgy", "Fluence", "Scala", "Pulse", "Triber"
  ],
  "Nissan": [
    "Micra", "Sunny", "Terrano", "X-Trail", "GT-R", "370Z", "Kicks", "Magnite"
  ],
  "Volkswagen": [
    "Polo", "Vento", "Ameo", "Tiguan", "Passat", "Jetta", "Beetle", "T-Roc", "Taigun"
  ],
  "Skoda": [
    "Rapid", "Octavia", "Superb", "Kodiaq", "Karoq", "Kushaq", "Slavia"
  ],
  "BMW": [
    "1 Series", "2 Series", "3 Series", "5 Series", "7 Series", "X1", "X3", 
    "X5", "X6", "X7", "Z4", "i3", "i8"
  ],
  "Mercedes-Benz": [
    "A-Class", "B-Class", "C-Class", "E-Class", "S-Class", "GLA", "GLC", 
    "GLE", "GLS", "G-Class", "SL", "AMG GT"
  ],
  "Audi": [
    "A3", "A4", "A6", "A8", "Q2", "Q3", "Q5", "Q7", "Q8", "TT", "R8", "e-tron"
  ],
  "Kia": [
    "Seltos", "Sonet", "Carnival", "Rio", "Optima", "Sorento", "Sportage", "Stinger"
  ],
  "MG": [
    "Hector", "ZS EV", "Gloster", "Astor", "HS"
  ],
  "Jeep": [
    "Compass", "Grand Cherokee", "Wrangler", "Cherokee", "Renegade"
  ]
};

export const getModelsForMake = (make: string): string[] => {
  return vehicleData[make as keyof typeof vehicleData] || [];
};

export const getAllMakes = (): string[] => {
  return Object.keys(vehicleData);
};