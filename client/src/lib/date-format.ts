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

// Convert dd/mm/yyyy to yyyy-mm-dd for HTML date input
export function convertToDateInputFormat(dateString: string): string {
  if (!dateString || dateString.trim() === "") return "";
  
  try {
    const parts = dateString.split('/');
    if (parts.length !== 3) return "";
    
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  } catch (error) {
    console.error('Date conversion error:', error);
    return "";
  }
}

// Convert yyyy-mm-dd from HTML date input to dd/mm/yyyy
export function convertFromDateInputFormat(dateString: string): string {
  if (!dateString || dateString.trim() === "") return "";
  
  try {
    const parts = dateString.split('-');
    if (parts.length !== 3) return "";
    
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Date conversion error:', error);
    return "";
  }
}