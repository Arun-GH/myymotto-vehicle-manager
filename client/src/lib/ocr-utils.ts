import { createWorker } from 'tesseract.js';

export interface InsurancePolicyData {
  provider?: string;
  policyNumber?: string;
  insuredDate?: string;
  expiryDate?: string;
  sumInsured?: string;
  premiumAmount?: string;
  vehicleNumber?: string;
  insuredName?: string;
}

export class OCRService {
  private worker: any = null;

  async initialize() {
    if (!this.worker) {
      this.worker = await createWorker('eng');
    }
    return this.worker;
  }

  async extractText(imageFile: File): Promise<string> {
    try {
      const worker = await this.initialize();
      const { data: { text } } = await worker.recognize(imageFile);
      return text;
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  parseInsurancePolicyData(text: string): InsurancePolicyData {
    const data: InsurancePolicyData = {};
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Common insurance provider patterns
    const providerPatterns = [
      /(?:HDFC\s*ERGO|hdfc\s*ergo)/i,
      /(?:ICICI\s*Lombard|icici\s*lombard)/i,
      /(?:Bajaj\s*Allianz|bajaj\s*allianz)/i,
      /(?:TATA\s*AIG|tata\s*aig)/i,
      /(?:New\s*India\s*Assurance|new\s*india\s*assurance)/i,
      /(?:Oriental\s*Insurance|oriental\s*insurance)/i,
      /(?:United\s*India\s*Insurance|united\s*india\s*insurance)/i,
      /(?:National\s*Insurance|national\s*insurance)/i,
      /(?:Royal\s*Sundaram|royal\s*sundaram)/i,
      /(?:Reliance\s*General|reliance\s*general)/i
    ];

    // Extract insurance provider
    for (const line of lines) {
      for (const pattern of providerPatterns) {
        const match = line.match(pattern);
        if (match) {
          data.provider = match[0].replace(/\s+/g, ' ').trim();
          break;
        }
      }
      if (data.provider) break;
    }

    // Extract policy number
    const policyPatterns = [
      /(?:Policy\s*No\.?|Policy\s*Number|Certificate\s*No\.?)\s*:?\s*([A-Z0-9\/\-]+)/i,
      /(?:^|\s)([A-Z]{2,4}[\/\-]?\d{6,12}[\/\-]?[A-Z0-9]*)/
    ];

    for (const line of lines) {
      for (const pattern of policyPatterns) {
        const match = line.match(pattern);
        if (match) {
          data.policyNumber = match[1] || match[0];
          break;
        }
      }
      if (data.policyNumber) break;
    }

    // Extract dates (issue date and expiry date)
    const datePatterns = [
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g,
      /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/gi,
      /(\d{2,4}[\/\-]\d{1,2}[\/\-]\d{1,2})/g
    ];

    const foundDates: string[] = [];
    for (const line of lines) {
      // Look for date context clues
      if (/(?:issue|start|from|effective|inception)/i.test(line)) {
        for (const pattern of datePatterns) {
          const matches = line.match(pattern);
          if (matches) {
            data.insuredDate = this.formatDate(matches[0]);
            break;
          }
        }
      }
      if (/(?:expir|valid|until|to|end)/i.test(line)) {
        for (const pattern of datePatterns) {
          const matches = line.match(pattern);
          if (matches) {
            data.expiryDate = this.formatDate(matches[0]);
            break;
          }
        }
      }
      
      // Collect all dates for fallback
      for (const pattern of datePatterns) {
        const matches = line.match(pattern);
        if (matches) {
          foundDates.push(...matches.map(date => this.formatDate(date)));
        }
      }
    }

    // If no specific dates found, use first two dates as issue and expiry
    if (!data.insuredDate && !data.expiryDate && foundDates.length >= 2) {
      data.insuredDate = foundDates[0];
      data.expiryDate = foundDates[1];
    }

    // Extract sum insured
    const sumInsuredPatterns = [
      /(?:Sum\s*Insured|IDV|Insured\s*Declared\s*Value)\s*:?\s*(?:Rs\.?|₹)?\s*([\d,]+(?:\.\d{2})?)/i,
      /(?:Rs\.?|₹)\s*([\d,]+(?:\.\d{2})?)\s*(?:Sum\s*Insured|IDV)/i,
      /(?:Coverage|Limit)\s*:?\s*(?:Rs\.?|₹)?\s*([\d,]+(?:\.\d{2})?)/i
    ];

    for (const line of lines) {
      for (const pattern of sumInsuredPatterns) {
        const match = line.match(pattern);
        if (match) {
          data.sumInsured = `₹${match[1].replace(/,/g, '')}`;
          break;
        }
      }
      if (data.sumInsured) break;
    }

    // Extract premium amount
    const premiumPatterns = [
      /(?:Premium|Total\s*Premium)\s*:?\s*(?:Rs\.?|₹)?\s*([\d,]+(?:\.\d{2})?)/i,
      /(?:Rs\.?|₹)\s*([\d,]+(?:\.\d{2})?)\s*(?:Premium|Total)/i
    ];

    for (const line of lines) {
      for (const pattern of premiumPatterns) {
        const match = line.match(pattern);
        if (match) {
          data.premiumAmount = `₹${match[1].replace(/,/g, '')}`;
          break;
        }
      }
      if (data.premiumAmount) break;
    }

    // Extract vehicle number
    const vehiclePatterns = [
      /(?:Vehicle\s*No\.?|Registration\s*No\.?|Reg\.?\s*No\.?)\s*:?\s*([A-Z]{2}\s*\d{1,2}\s*[A-Z]{1,2}\s*\d{1,4})/i,
      /([A-Z]{2}\d{2}[A-Z]{1,2}\d{4})/,
      /([A-Z]{2}\s*\d{2}\s*[A-Z]{1,2}\s*\d{4})/
    ];

    for (const line of lines) {
      for (const pattern of vehiclePatterns) {
        const match = line.match(pattern);
        if (match) {
          data.vehicleNumber = match[1].replace(/\s+/g, '').toUpperCase();
          break;
        }
      }
      if (data.vehicleNumber) break;
    }

    // Extract insured name
    const namePatterns = [
      /(?:Insured\s*Name|Policy\s*Holder|Name)\s*:?\s*([A-Z\s]{3,50})/i,
      /(?:Mr\.?|Mrs\.?|Ms\.?)\s*([A-Z\s]{3,50})/i
    ];

    for (const line of lines) {
      for (const pattern of namePatterns) {
        const match = line.match(pattern);
        if (match) {
          data.insuredName = match[1].trim();
          break;
        }
      }
      if (data.insuredName) break;
    }

    return data;
  }

  private formatDate(dateStr: string): string {
    try {
      // Handle various date formats and convert to YYYY-MM-DD
      let date: Date;
      
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          // Handle DD/MM/YYYY or MM/DD/YYYY
          if (parseInt(parts[0]) > 12) {
            // DD/MM/YYYY
            date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          } else {
            // MM/DD/YYYY
            date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
          }
        } else {
          date = new Date(dateStr);
        }
      } else if (dateStr.includes('-')) {
        date = new Date(dateStr);
      } else {
        // Try parsing as-is
        date = new Date(dateStr);
      }

      if (isNaN(date.getTime())) {
        return dateStr; // Return original if parsing fails
      }

      return date.toISOString().split('T')[0];
    } catch (error) {
      return dateStr; // Return original if parsing fails
    }
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const ocrService = new OCRService();