import type { MaintenanceSchedule, InsertMaintenanceSchedule } from "@shared/schema";
import { storage } from "./storage";

// Define maintenance schedule structure
interface MaintenanceItem {
  mileage: number;
  kmage?: number;
  months?: number;
  services: string[];
  costLow?: number;
  costHigh?: number;
  estimatedCost?: number;
}

interface MaintenanceScheduleData {
  normalDriving: MaintenanceItem[];
  severeDriving: MaintenanceItem[];
  generalServices: {
    oilChange: { interval: string; description: string };
    tireRotation: { interval: string; description: string };
    brakeInspection: { interval: string; description: string };
    batteryCheck: { interval: string; description: string };
    airFilterReplace: { interval: string; description: string };
  };
}

// Honda Activa maintenance schedule based on official data
const HONDA_ACTIVA_SCHEDULE: MaintenanceScheduleData = {
  normalDriving: [
    {
      mileage: 1000,
      kmage: 1600,
      months: 1,
      services: [
        "Engine oil change",
        "Engine oil filter replacement",
        "Brake system inspection",
        "Tire pressure check",
        "Battery terminals cleaning",
        "Lights and horn functionality test"
      ],
      costLow: 300,
      costHigh: 500,
      estimatedCost: 400
    },
    {
      mileage: 2500,
      kmage: 4000,
      months: 4,
      services: [
        "Engine oil change",
        "Engine oil filter replacement",
        "Brake oil change",
        "Air cleaner element inspection",
        "Spark plug inspection",
        "Suspension oil check",
        "Throttle and clutch adjustments",
        "Fuel system cleaning"
      ],
      costLow: 500,
      costHigh: 800,
      estimatedCost: 650
    },
    {
      mileage: 5000,
      kmage: 8000,
      months: 8,
      services: [
        "Complete engine service",
        "Transmission oil change",
        "Brake pads inspection",
        "Tire condition and tread depth check",
        "Carburetor tuning",
        "Exhaust system inspection",
        "Drive belt inspection",
        "Steering system check"
      ],
      costLow: 800,
      costHigh: 1200,
      estimatedCost: 1000
    },
    {
      mileage: 10000,
      kmage: 16000,
      months: 12,
      services: [
        "Major service - complete overhaul",
        "Piston rings inspection",
        "Valve clearance adjustment",
        "Cooling system flush",
        "Fuel injector cleaning",
        "Electrical system check",
        "Suspension complete inspection",
        "Brake system overhaul"
      ],
      costLow: 1200,
      costHigh: 2000,
      estimatedCost: 1600
    }
  ],
  severeDriving: [
    {
      mileage: 750,
      kmage: 1200,
      months: 1,
      services: [
        "Engine oil change (more frequent)",
        "Engine oil filter replacement",
        "Brake system inspection",
        "Tire pressure check",
        "Battery terminals cleaning",
        "Air filter cleaning"
      ],
      costLow: 350,
      costHigh: 550,
      estimatedCost: 450
    },
    {
      mileage: 2000,
      kmage: 3200,
      months: 3,
      services: [
        "Engine oil change",
        "Engine oil filter replacement",
        "Brake oil change",
        "Air cleaner element replacement",
        "Spark plug replacement",
        "Suspension oil check",
        "Throttle and clutch adjustments",
        "Fuel system cleaning"
      ],
      costLow: 600,
      costHigh: 900,
      estimatedCost: 750
    },
    {
      mileage: 4000,
      kmage: 6400,
      months: 6,
      services: [
        "Complete engine service",
        "Transmission oil change",
        "Brake pads replacement",
        "Tire replacement if needed",
        "Carburetor complete overhaul",
        "Exhaust system cleaning",
        "Drive belt replacement",
        "Steering system lubrication"
      ],
      costLow: 900,
      costHigh: 1400,
      estimatedCost: 1150
    },
    {
      mileage: 8000,
      kmage: 12800,
      months: 10,
      services: [
        "Major service - complete overhaul",
        "Piston rings replacement",
        "Valve clearance adjustment",
        "Cooling system complete flush",
        "Fuel injector replacement",
        "Electrical system overhaul",
        "Suspension complete replacement",
        "Brake system complete overhaul"
      ],
      costLow: 1500,
      costHigh: 2500,
      estimatedCost: 2000
    }
  ],
  generalServices: {
    oilChange: {
      interval: "Every 2,500 km or 4 months",
      description: "Change engine oil and oil filter for optimal performance"
    },
    tireRotation: {
      interval: "Every 5,000 km or 6 months",
      description: "Rotate tires to ensure even wear and extend tire life"
    },
    brakeInspection: {
      interval: "Every 10,000 km or 12 months",
      description: "Inspect brake pads, brake fluid, and brake system"
    },
    batteryCheck: {
      interval: "Every 3 months",
      description: "Check battery terminals, voltage, and electrolyte levels"
    },
    airFilterReplace: {
      interval: "Every 6 months or dusty conditions",
      description: "Replace air filter to maintain engine efficiency"
    }
  }
};

// Car maintenance schedules - Toyota Camry example
const TOYOTA_CAMRY_SCHEDULE: MaintenanceScheduleData = {
  normalDriving: [
    {
      mileage: 5000,
      kmage: 8000,
      months: 6,
      services: [
        "Engine oil and filter change",
        "Tire rotation",
        "Visual inspection of brakes",
        "Check fluid levels",
        "Battery test",
        "Lights inspection"
      ],
      costLow: 50,
      costHigh: 100,
      estimatedCost: 75
    },
    {
      mileage: 10000,
      kmage: 16000,
      months: 12,
      services: [
        "Engine oil and filter change",
        "Tire rotation",
        "Brake inspection",
        "Transmission fluid check",
        "Coolant system inspection",
        "Air filter replacement",
        "Cabin air filter replacement"
      ],
      costLow: 150,
      costHigh: 250,
      estimatedCost: 200
    },
    {
      mileage: 20000,
      kmage: 32000,
      months: 24,
      services: [
        "Engine oil and filter change",
        "Tire rotation",
        "Brake fluid replacement",
        "Transmission fluid replacement",
        "Coolant replacement",
        "Spark plugs replacement",
        "Fuel system cleaning"
      ],
      costLow: 300,
      costHigh: 500,
      estimatedCost: 400
    },
    {
      mileage: 30000,
      kmage: 48000,
      months: 36,
      services: [
        "Major service - 30k mile service",
        "Timing belt inspection",
        "Brake pads replacement",
        "Suspension inspection",
        "Exhaust system inspection",
        "Power steering fluid replacement",
        "Differential oil change"
      ],
      costLow: 500,
      costHigh: 800,
      estimatedCost: 650
    }
  ],
  severeDriving: [
    {
      mileage: 3000,
      kmage: 4800,
      months: 3,
      services: [
        "Engine oil and filter change (more frequent)",
        "Tire rotation",
        "Brake inspection",
        "Air filter cleaning",
        "Battery check",
        "Fluid level checks"
      ],
      costLow: 60,
      costHigh: 120,
      estimatedCost: 90
    },
    {
      mileage: 7500,
      kmage: 12000,
      months: 9,
      services: [
        "Engine oil and filter change",
        "Tire rotation",
        "Brake inspection",
        "Transmission fluid check",
        "Air filter replacement",
        "Cabin air filter replacement",
        "Fuel system inspection"
      ],
      costLow: 180,
      costHigh: 300,
      estimatedCost: 240
    },
    {
      mileage: 15000,
      kmage: 24000,
      months: 18,
      services: [
        "Engine oil and filter change",
        "Tire rotation and alignment",
        "Brake fluid replacement",
        "Transmission service",
        "Coolant system flush",
        "Spark plugs replacement",
        "Fuel injector cleaning"
      ],
      costLow: 350,
      costHigh: 600,
      estimatedCost: 475
    },
    {
      mileage: 22500,
      kmage: 36000,
      months: 27,
      services: [
        "Major service - severe driving",
        "Timing belt replacement",
        "Brake system overhaul",
        "Suspension service",
        "Exhaust system service",
        "Power steering service",
        "Differential service"
      ],
      costLow: 600,
      costHigh: 1000,
      estimatedCost: 800
    }
  ],
  generalServices: {
    oilChange: {
      interval: "Every 5,000 miles or 6 months",
      description: "Change engine oil and oil filter for optimal performance"
    },
    tireRotation: {
      interval: "Every 5,000 miles or 6 months",
      description: "Rotate tires to ensure even wear and extend tire life"
    },
    brakeInspection: {
      interval: "Every 10,000 miles or 12 months",
      description: "Inspect brake pads, brake fluid, and brake system"
    },
    batteryCheck: {
      interval: "Every 6 months",
      description: "Check battery terminals, voltage, and charging system"
    },
    airFilterReplace: {
      interval: "Every 12,000 miles or 12 months",
      description: "Replace air filter to maintain engine efficiency"
    }
  }
};

// Maintenance schedule database
const MAINTENANCE_SCHEDULES: Record<string, Record<string, MaintenanceScheduleData>> = {
  "Honda": {
    "ACTIVA": HONDA_ACTIVA_SCHEDULE,
    "ACTIVA 6G": HONDA_ACTIVA_SCHEDULE,
    "ACTIVA 125": HONDA_ACTIVA_SCHEDULE,
    "DIO": HONDA_ACTIVA_SCHEDULE,
    "GRAZIA": HONDA_ACTIVA_SCHEDULE
  },
  "Toyota": {
    "CAMRY": TOYOTA_CAMRY_SCHEDULE,
    "COROLLA": TOYOTA_CAMRY_SCHEDULE,
    "PRIUS": TOYOTA_CAMRY_SCHEDULE,
    "RAV4": TOYOTA_CAMRY_SCHEDULE
  }
};

export class MaintenanceService {
  
  async getMaintenanceSchedule(
    make: string, 
    model: string, 
    year: number, 
    drivingCondition: 'normal' | 'severe' = 'normal'
  ): Promise<MaintenanceSchedule | null> {
    
    // First check if we have it cached in database
    const cachedSchedule = await storage.getMaintenanceSchedule(make, model, year, drivingCondition);
    
    if (cachedSchedule) {
      // Check if cached data is not older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (cachedSchedule.lastUpdated > thirtyDaysAgo) {
        return cachedSchedule;
      }
    }
    
    // Get maintenance schedule from our database
    const scheduleData = this.getScheduleFromDatabase(make, model, year);
    
    if (!scheduleData) {
      return null;
    }
    
    const maintenanceData = {
      schedule: drivingCondition === 'severe' ? scheduleData.severeDriving : scheduleData.normalDriving,
      generalServices: scheduleData.generalServices,
      drivingCondition,
      lastUpdated: new Date().toISOString()
    };
    
    // Store in database
    const scheduleToStore: InsertMaintenanceSchedule = {
      make,
      model,
      year,
      scheduleData: maintenanceData,
      source: 'manual',
      drivingCondition
    };
    
    if (cachedSchedule) {
      // Update existing
      return await storage.updateMaintenanceSchedule(cachedSchedule.id, scheduleToStore);
    } else {
      // Create new
      return await storage.createMaintenanceSchedule(scheduleToStore);
    }
  }
  
  private getScheduleFromDatabase(make: string, model: string, year: number): MaintenanceScheduleData | null {
    const makeSchedules = MAINTENANCE_SCHEDULES[make];
    if (!makeSchedules) {
      return null;
    }
    
    const modelSchedule = makeSchedules[model];
    if (!modelSchedule) {
      return null;
    }
    
    return modelSchedule;
  }
  
  getAvailableMaintenance(): { make: string; models: string[] }[] {
    return Object.entries(MAINTENANCE_SCHEDULES).map(([make, models]) => ({
      make,
      models: Object.keys(models)
    }));
  }
}

export const maintenanceService = new MaintenanceService();