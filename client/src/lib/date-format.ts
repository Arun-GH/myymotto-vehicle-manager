// Date formatting utilities for dd/mm/yyyy format

export function formatToddmmyyyy(date: Date | string | null | undefined): string {
  if (!date) return "";
  
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      // Handle different input formats
      if (date.includes('/')) {
        // Already in dd/mm/yyyy or mm/dd/yyyy format
        const parts = date.split('/');
        if (parts.length === 3) {
          // Assume dd/mm/yyyy if day <= 12, otherwise mm/dd/yyyy
          const [first, second, year] = parts;
          if (parseInt(first) <= 12 && parseInt(second) > 12) {
            // Likely mm/dd/yyyy, convert to dd/mm/yyyy
            dateObj = new Date(parseInt(year), parseInt(first) - 1, parseInt(second));
          } else {
            // Assume dd/mm/yyyy
            dateObj = new Date(parseInt(year), parseInt(second) - 1, parseInt(first));
          }
        } else {
          return "";
        }
      } else if (date.includes('-')) {
        // ISO format (yyyy-mm-dd)
        dateObj = new Date(date);
      } else {
        return "";
      }
    } else {
      dateObj = date;
    }
    
    if (isNaN(dateObj.getTime())) {
      return "";
    }
    
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return "";
  }
}

export function parseFromddmmyyyy(dateString: string): Date | null {
  if (!dateString || dateString.trim() === "") return null;
  
  try {
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31 || month < 1 || month > 12) return null;
    
    return new Date(year, month - 1, day);
  } catch (error) {
    console.error('Date parsing error:', error);
    return null;
  }
}

export function formatForDatabase(dateString: string): string | null {
  if (!dateString || dateString.trim() === "") return null;
  
  try {
    const parsedDate = parseFromddmmyyyy(dateString);
    if (!parsedDate) return null;
    
    // Return in PostgreSQL date format (yyyy-mm-dd)
    const year = parsedDate.getFullYear();
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = parsedDate.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Database date formatting error:', error);
    return null;
  }
}

export function getTodayInddmmyyyy(): string {
  return formatToddmmyyyy(new Date());
}

export function getMaxDateForInput(): string {
  // For HTML input max attribute, we need yyyy-mm-dd format
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatToDDMMMYYYY(date: Date | string | null | undefined): string {
  if (!date) return "";
  
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      // Handle different input formats
      if (date.includes('/')) {
        // Already in dd/mm/yyyy or mm/dd/yyyy format
        const parts = date.split('/');
        if (parts.length === 3) {
          // Assume dd/mm/yyyy if day <= 12, otherwise mm/dd/yyyy
          const [first, second, year] = parts;
          if (parseInt(first) <= 12 && parseInt(second) > 12) {
            // Likely mm/dd/yyyy, convert to dd/mm/yyyy
            dateObj = new Date(parseInt(year), parseInt(first) - 1, parseInt(second));
          } else {
            // Assume dd/mm/yyyy
            dateObj = new Date(parseInt(year), parseInt(second) - 1, parseInt(first));
          }
        } else {
          return "";
        }
      } else if (date.includes('-')) {
        // ISO format (yyyy-mm-dd)
        dateObj = new Date(date);
      } else {
        return "";
      }
    } else {
      dateObj = date;
    }
    
    if (isNaN(dateObj.getTime())) {
      return "";
    }
    
    const day = dateObj.getDate().toString().padStart(2, '0');
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const month = monthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    
    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return "";
  }
}

// Convert between different date formats for standardization

// Convert any date string to HTML5 date input format (yyyy-mm-dd)
export function toStandardDateFormat(dateString: string | null | undefined): string {
  if (!dateString || dateString.trim() === "") return "";
  
  try {
    const trimmed = dateString.trim();
    
    // If already in yyyy-mm-dd format, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const testDate = new Date(trimmed);
      return isNaN(testDate.getTime()) ? "" : trimmed;
    }
    
    // If in dd/mm/yyyy format, convert to yyyy-mm-dd
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
      const [day, month, year] = trimmed.split('/');
      const formatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      const testDate = new Date(formatted);
      return isNaN(testDate.getTime()) ? "" : formatted;
    }
    
    // Try parsing as a regular date string
    const testDate = new Date(trimmed);
    if (!isNaN(testDate.getTime())) {
      const year = testDate.getFullYear();
      const month = (testDate.getMonth() + 1).toString().padStart(2, '0');
      const day = testDate.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    return "";
  } catch (error) {
    console.error('Date conversion error:', error);
    return "";
  }
}

// Convert yyyy-mm-dd to dd/mm/yyyy for display purposes
export function toDisplayDateFormat(dateString: string | null | undefined): string {
  if (!dateString || dateString.trim() === "") return "";
  
  try {
    const trimmed = dateString.trim();
    
    // If in yyyy-mm-dd format, convert to dd/mm/yyyy
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [year, month, day] = trimmed.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // If already in dd/mm/yyyy format, return as-is
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
      return trimmed;
    }
    
    return "";
  } catch (error) {
    console.error('Date display conversion error:', error);
    return "";
  }
}

// Vehicle completeness calculation
export interface VehicleCompletenessResult {
  percentage: number;
  completedFields: number;
  totalFields: number;
  missingFields: { name: string; category: string; weight: number }[];
}

export function calculateVehicleCompleteness(vehicle: any): VehicleCompletenessResult {
  const fields = [
    // Essential Vehicle Information (Higher Weight)
    { key: 'make', name: 'Vehicle Make', category: 'Basic Info', weight: 3 },
    { key: 'model', name: 'Vehicle Model', category: 'Basic Info', weight: 3 },
    { key: 'licensePlate', name: 'License Plate', category: 'Basic Info', weight: 3 },
    { key: 'vehicleType', name: 'Vehicle Type', category: 'Basic Info', weight: 2 },
    { key: 'fuelType', name: 'Fuel Type', category: 'Basic Info', weight: 2 },
    
    // Vehicle Identification
    { key: 'chassisNumber', name: 'Chassis Number', category: 'Documentation', weight: 2 },
    { key: 'engineNumber', name: 'Engine Number', category: 'Documentation', weight: 2 },
    
    // Registration & Insurance (Critical)
    { key: 'rcExpiry', name: 'RC Expiry Date', category: 'Legal Documents', weight: 3 },
    { key: 'insuranceExpiry', name: 'Insurance Expiry', category: 'Legal Documents', weight: 3 },
    { key: 'insuranceProvider', name: 'Insurance Provider', category: 'Legal Documents', weight: 2 },
    
    // Emission & Environment
    { key: 'emissionExpiry', name: 'Emission Certificate', category: 'Environmental', weight: 2 },
    
    // Service & Maintenance
    { key: 'lastServiceDate', name: 'Last Service Date', category: 'Maintenance', weight: 2 },
    { key: 'currentOdometerReading', name: 'Odometer Reading', category: 'Maintenance', weight: 1 },
    { key: 'averageUsagePerMonth', name: 'Average Usage', category: 'Maintenance', weight: 1 },
    
    // Visual & Optional
    { key: 'color', name: 'Vehicle Color', category: 'Basic Info', weight: 1 },
    { key: 'thumbnailPath', name: 'Vehicle Photo', category: 'Visual', weight: 1 },
  ];

  let totalWeight = 0;
  let completedWeight = 0;
  const missingFields: { name: string; category: string; weight: number }[] = [];

  fields.forEach(field => {
    totalWeight += field.weight;
    
    const value = vehicle?.[field.key];
    const isCompleted = value !== null && value !== undefined && value !== '' && 
                       (typeof value !== 'string' || value.trim() !== '');
    
    if (isCompleted) {
      completedWeight += field.weight;
    } else {
      missingFields.push({
        name: field.name,
        category: field.category,
        weight: field.weight
      });
    }
  });

  // Sort missing fields by weight (importance) descending
  missingFields.sort((a, b) => b.weight - a.weight);

  const percentage = Math.round((completedWeight / totalWeight) * 100);
  const completedFields = fields.length - missingFields.length;

  return {
    percentage,
    completedFields,
    totalFields: fields.length,
    missingFields,
  };
}