export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays < 0) {
    const absDays = Math.abs(diffInDays);
    return `${absDays} day${absDays === 1 ? '' : 's'} ago`;
  } else if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Tomorrow';
  } else if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'}`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} month${months === 1 ? '' : 's'}`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `${years} year${years === 1 ? '' : 's'}`;
  }
}

export function getExpiryStatus(date: string | null) {
  if (!date) {
    return { 
      status: "unknown" as const, 
      text: "Not set", 
      shortText: "Not set",
      color: "secondary" as const 
    };
  }
  
  const expiryDate = new Date(date);
  const today = new Date();
  const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return { 
      status: "expired" as const, 
      text: `Expired ${absDays} day${absDays === 1 ? '' : 's'} ago`,
      shortText: "Expired",
      color: "destructive" as const 
    };
  } else if (diffDays <= 30) {
    return { 
      status: "expiring" as const, 
      text: `Expires in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
      shortText: `${diffDays}d left`,
      color: "warning" as const 
    };
  } else if (diffDays <= 365) {
    const monthsLeft = Math.ceil(diffDays / 30);
    return { 
      status: "valid" as const, 
      text: `Expires in ${monthsLeft} month${monthsLeft === 1 ? '' : 's'}`,
      shortText: `${monthsLeft}m left`,
      color: "success" as const 
    };
  } else {
    const monthsLeft = Math.ceil(diffDays / 30);
    return { 
      status: "valid" as const, 
      text: `Expires in ${monthsLeft} month${monthsLeft === 1 ? '' : 's'}`,
      shortText: `${monthsLeft}m left`,
      color: "success" as const 
    };
  }
}

export function getServiceStatus(lastServiceDate: string | null) {
  if (!lastServiceDate) {
    return {
      status: "unknown" as const,
      text: "No service date recorded",
      shortText: "Not set",
      color: "secondary" as const
    };
  }

  const serviceDate = new Date(lastServiceDate);
  const today = new Date();
  const timeDiff = today.getTime() - serviceDate.getTime();
  const daysSince = Math.floor(timeDiff / (1000 * 3600 * 24));

  // Assuming service is due every 4 months (120 days)
  const serviceDueDays = 120;
  const daysUntilService = serviceDueDays - daysSince;

  if (daysUntilService < 0) {
    const overdueDays = Math.abs(daysUntilService);
    if (overdueDays > 30) {
      const overdueMonths = Math.floor(overdueDays / 30);
      return {
        status: "expired" as const,
        text: `Service overdue by ${overdueMonths} month${overdueMonths !== 1 ? 's' : ''}`,
        shortText: "Overdue",
        color: "destructive" as const
      };
    } else {
      return {
        status: "expired" as const,
        text: `Service overdue by ${overdueDays} day${overdueDays !== 1 ? 's' : ''}`,
        shortText: "Overdue",
        color: "destructive" as const
      };
    }
  } else if (daysUntilService <= 30) {
    return {
      status: "expiring" as const,
      text: `Service due in ${daysUntilService} day${daysUntilService !== 1 ? 's' : ''}`,
      shortText: `${daysUntilService}d left`,
      color: "warning" as const
    };
  } else {
    const monthsLeft = Math.ceil(daysUntilService / 30);
    return {
      status: "valid" as const,
      text: `Service due in ${monthsLeft} month${monthsLeft !== 1 ? 's' : ''}`,
      shortText: `${monthsLeft}m left`,
      color: "success" as const
    };
  }
}
