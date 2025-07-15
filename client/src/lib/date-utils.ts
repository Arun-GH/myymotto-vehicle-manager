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
  
  const issueDate = new Date(date);
  const today = new Date();
  const timeDiff = today.getTime() - issueDate.getTime();
  const daysSince = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  if (daysSince < 0) {
    // Future date
    return { 
      status: "valid" as const, 
      text: "Future date",
      shortText: "Future",
      color: "secondary" as const 
    };
  } else if (daysSince <= 30) {
    return { 
      status: "valid" as const, 
      text: `Issued ${daysSince} day${daysSince === 1 ? '' : 's'} ago`,
      shortText: `${daysSince}d ago`,
      color: "success" as const 
    };
  } else if (daysSince <= 365) {
    const monthsAgo = Math.floor(daysSince / 30);
    return { 
      status: "valid" as const, 
      text: `Issued ${monthsAgo} month${monthsAgo === 1 ? '' : 's'} ago`,
      shortText: `${monthsAgo}m ago`,
      color: "success" as const 
    };
  } else {
    const yearsAgo = Math.floor(daysSince / 365);
    const remainingMonths = Math.floor((daysSince % 365) / 30);
    if (remainingMonths > 0) {
      return { 
        status: "valid" as const, 
        text: `Issued ${yearsAgo} year${yearsAgo === 1 ? '' : 's'} ${remainingMonths} month${remainingMonths === 1 ? '' : 's'} ago`,
        shortText: `${yearsAgo}y ${remainingMonths}m ago`,
        color: "success" as const 
      };
    } else {
      return { 
        status: "valid" as const, 
        text: `Issued ${yearsAgo} year${yearsAgo === 1 ? '' : 's'} ago`,
        shortText: `${yearsAgo}y ago`,
        color: "success" as const 
      };
    }
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
  const daysSince = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  if (daysSince < 0) {
    // Future date
    return {
      status: "valid" as const,
      text: "Future service date",
      shortText: "Future",
      color: "secondary" as const
    };
  } else if (daysSince <= 30) {
    return {
      status: "valid" as const,
      text: `Last serviced ${daysSince} day${daysSince === 1 ? '' : 's'} ago`,
      shortText: `${daysSince}d ago`,
      color: "success" as const
    };
  } else if (daysSince <= 365) {
    const monthsAgo = Math.floor(daysSince / 30);
    return {
      status: "valid" as const,
      text: `Last serviced ${monthsAgo} month${monthsAgo === 1 ? '' : 's'} ago`,
      shortText: `${monthsAgo}m ago`,
      color: "success" as const
    };
  } else {
    const yearsAgo = Math.floor(daysSince / 365);
    const remainingMonths = Math.floor((daysSince % 365) / 30);
    if (remainingMonths > 0) {
      return {
        status: "valid" as const,
        text: `Last serviced ${yearsAgo} year${yearsAgo === 1 ? '' : 's'} ${remainingMonths} month${remainingMonths === 1 ? '' : 's'} ago`,
        shortText: `${yearsAgo}y ${remainingMonths}m ago`,
        color: "success" as const
      };
    } else {
      return {
        status: "valid" as const,
        text: `Last serviced ${yearsAgo} year${yearsAgo === 1 ? '' : 's'} ago`,
        shortText: `${yearsAgo}y ago`,
        color: "success" as const
      };
    }
  }
}
