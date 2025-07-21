interface StateConfig {
  name: string;
  apiEndpoint: string;
  challanEndpoint: string;
  paymentEndpoint?: string;
}

interface ViolationResponse {
  challanNumber: string;
  vehicleNumber: string;
  offense: string;
  fineAmount: number;
  violationDate: string;
  location: string;
  status: 'pending' | 'paid';
  paymentDate?: string;
  dueDate: string;
}

// Mapping of Indian state codes to their traffic violation APIs
const STATE_API_CONFIG: Record<string, StateConfig> = {
  // Delhi
  DL: {
    name: "Delhi",
    apiEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan",
    challanEndpoint: "https://traffic.delhipolice.gov.in/echallan/",
    paymentEndpoint: "https://echallan.parivahan.gov.in/index/payment"
  },
  
  // Maharashtra
  MH: {
    name: "Maharashtra", 
    apiEndpoint: "https://highwaypolice.maharashtra.gov.in/e-challan/",
    challanEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan"
  },
  
  // Karnataka
  KA: {
    name: "Karnataka",
    apiEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan",
    challanEndpoint: "https://karnatakaone.gov.in"
  },
  
  // Telangana
  TS: {
    name: "Telangana",
    apiEndpoint: "https://echallan.tspolice.gov.in/publicview/",
    challanEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan"
  },
  
  // Uttar Pradesh
  UP: {
    name: "Uttar Pradesh",
    apiEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan",
    challanEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan"
  },
  
  // Tamil Nadu
  TN: {
    name: "Tamil Nadu",
    apiEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan",
    challanEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan"
  },
  
  // West Bengal
  WB: {
    name: "West Bengal",
    apiEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan",
    challanEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan"
  },
  
  // Rajasthan
  RJ: {
    name: "Rajasthan",
    apiEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan",
    challanEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan"
  },
  
  // Gujarat
  GJ: {
    name: "Gujarat",
    apiEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan",
    challanEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan"
  },
  
  // Haryana
  HR: {
    name: "Haryana",
    apiEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan",
    challanEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan"
  },
  
  // Punjab
  PB: {
    name: "Punjab",
    apiEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan",
    challanEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan"
  },
  
  // Kerala
  KL: {
    name: "Kerala",
    apiEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan",
    challanEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan"
  },
  
  // Andhra Pradesh
  AP: {
    name: "Andhra Pradesh",
    apiEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan",
    challanEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan"
  },
  
  // Madhya Pradesh
  MP: {
    name: "Madhya Pradesh",
    apiEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan",
    challanEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan"
  },
  
  // Odisha
  OD: {
    name: "Odisha",
    apiEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan",
    challanEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan"
  },
  
  // Jharkhand
  JH: {
    name: "Jharkhand",
    apiEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan",
    challanEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan"
  },
  
  // Chhattisgarh
  CG: {
    name: "Chhattisgarh",
    apiEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan",
    challanEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan"
  },
  
  // Bihar
  BR: {
    name: "Bihar",
    apiEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan",
    challanEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan"
  },
  
  // Assam
  AS: {
    name: "Assam",
    apiEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan",
    challanEndpoint: "https://echallan.parivahan.gov.in/index/accused-challan"
  }
};

export class TrafficViolationService {
  
  /**
   * Extract state code from license plate number
   * Format: XX00XX0000 where XX is state code
   */
  private extractStateCode(licensePlate: string): string {
    // Remove spaces and convert to uppercase
    const cleanPlate = licensePlate.replace(/\s+/g, '').toUpperCase();
    
    // Extract first two characters as state code
    return cleanPlate.substring(0, 2);
  }
  
  /**
   * Get state configuration for API endpoints
   */
  private getStateConfig(licensePlate: string): StateConfig | null {
    const stateCode = this.extractStateCode(licensePlate);
    return STATE_API_CONFIG[stateCode] || null;
  }
  
  /**
   * Check for traffic violations using state-specific API
   */
  async checkViolations(vehicleNumber: string): Promise<ViolationResponse[]> {
    const stateConfig = this.getStateConfig(vehicleNumber);
    
    if (!stateConfig) {
      throw new Error(`State API not available for vehicle: ${vehicleNumber}`);
    }
    
    try {
      // For demonstration, we'll simulate API calls since actual government APIs require authentication
      // In production, you would implement real API integration with proper authentication
      
      console.log(`🚗 Checking violations for ${vehicleNumber} via ${stateConfig.name} API`);
      console.log(`📍 API Endpoint: ${stateConfig.apiEndpoint}`);
      
      // Simulate API response - In production, replace with actual API call
      const mockViolations = await this.simulateAPICall(vehicleNumber, stateConfig);
      
      return mockViolations;
      
    } catch (error) {
      console.error(`Failed to fetch violations for ${vehicleNumber}:`, error);
      throw new Error(`Unable to fetch violations from ${stateConfig.name} traffic department`);
    }
  }
  
  /**
   * Simulate government API response
   * In production, replace with actual API integration
   */
  private async simulateAPICall(vehicleNumber: string, stateConfig: StateConfig): Promise<ViolationResponse[]> {
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate realistic mock data based on common traffic violations
    const commonViolations = [
      { offense: "Over Speeding", fineAmount: 2000, probability: 0.3 },
      { offense: "Not Wearing Seat Belt", fineAmount: 1000, probability: 0.2 },
      { offense: "Jumping Red Light", fineAmount: 1000, probability: 0.15 },
      { offense: "Using Mobile While Driving", fineAmount: 1000, probability: 0.2 },
      { offense: "Wrong Side Driving", fineAmount: 5000, probability: 0.1 },
      { offense: "Not Wearing Helmet", fineAmount: 1000, probability: 0.25 },
      { offense: "Triple Riding", fineAmount: 500, probability: 0.15 }
    ];
    
    const violations: ViolationResponse[] = [];
    const stateCode = this.extractStateCode(vehicleNumber);
    
    // Randomly generate 0-3 violations based on probability
    for (const violation of commonViolations) {
      if (Math.random() < violation.probability) {
        const violationDate = new Date();
        violationDate.setDate(violationDate.getDate() - Math.floor(Math.random() * 30));
        
        const dueDate = new Date(violationDate);
        dueDate.setDate(dueDate.getDate() + 60); // 60 days to pay
        
        violations.push({
          challanNumber: `${stateCode}${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`,
          vehicleNumber: vehicleNumber,
          offense: violation.offense,
          fineAmount: violation.fineAmount,
          violationDate: violationDate.toISOString().split('T')[0],
          location: `${stateConfig.name} - Traffic Point ${Math.floor(Math.random() * 50) + 1}`,
          status: Math.random() > 0.3 ? 'pending' : 'paid',
          dueDate: dueDate.toISOString().split('T')[0],
          paymentDate: Math.random() > 0.7 ? new Date().toISOString().split('T')[0] : undefined
        });
      }
    }
    
    return violations;
  }
  
  /**
   * Get payment URL for specific state
   */
  getPaymentUrl(vehicleNumber: string, challanNumber?: string): string {
    const stateConfig = this.getStateConfig(vehicleNumber);
    
    if (!stateConfig) {
      return "https://echallan.parivahan.gov.in/index/payment";
    }
    
    return stateConfig.paymentEndpoint || stateConfig.challanEndpoint;
  }
  
  /**
   * Get supported states
   */
  getSupportedStates(): Array<{code: string, name: string}> {
    return Object.entries(STATE_API_CONFIG).map(([code, config]) => ({
      code,
      name: config.name
    }));
  }
}

export const trafficViolationService = new TrafficViolationService();