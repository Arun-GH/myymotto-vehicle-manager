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
      shortText: "N/A",
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
      shortText: `${absDays}d ago`,
      color: "destructive" as const 
    };
  } else if (diffDays <= 30) {
    return { 
      status: "expiring" as const, 
      text: `Expires in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
      shortText: `${diffDays}d`,
      color: "warning" as const 
    };
  } else {
    const timeText = formatDistanceToNow(expiryDate);
    return { 
      status: "valid" as const, 
      text: timeText,
      shortText: timeText.split(' ').slice(0, 2).join(' '),
      color: "success" as const 
    };
  }
}
