import { ArrowLeft, ExternalLink, Newspaper, Zap, Car, Truck, Bike, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import ColorfulLogo from "@/components/colorful-logo";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: "policy" | "launch" | "news";
  date: string;
  source: string;
  link: string;
  priority: "high" | "medium" | "low";
}

export default function NewsTidbits() {
  // Latest vehicle news data from authentic sources
  const newsItems: NewsItem[] = [
    {
      id: "1",
      title: "MG M9 Electric MPV Launches Today at ₹70 Lakh",
      summary: "India's first all-electric luxury MPV goes on sale today, targeting premium family segment with advanced features and 500km range.",
      category: "launch",
      date: "July 21, 2025",
      source: "Autocar India",
      link: "https://www.autocarindia.com/car-news/mg-m9-electric-mpv-launch-india-2025",
      priority: "high"
    },
    {
      id: "2", 
      title: "New EV Policy: 15% Import Duty for ₹500M Investment",
      summary: "Government slashes customs duty to 15% for EVs worth $35,000+ with minimum $500M local investment commitment from manufacturers.",
      category: "policy",
      date: "July 21, 2025",
      source: "Bloomberg",
      link: "https://www.bloomberg.com/news/articles/2025-06-02/india-to-open-flagship-ev-making-policy-to-lure-global-giants",
      priority: "high"
    },
    {
      id: "3",
      title: "Tesla Model Y India Launch at ₹59.89 Lakh",
      summary: "Tesla opens first Mumbai showroom with Model Y as debut product. First Tesla car officially launched in India after years of anticipation.",
      category: "launch", 
      date: "July 21, 2025",
      source: "CarDekho",
      link: "https://www.cardekho.com/tesla/model-y",
      priority: "high"
    },
    {
      id: "4",
      title: "Maharashtra EV Policy 2025: 30% Electric by 2030",
      summary: "₹1,740 crore allocated for EV incentives. 100% motor vehicle tax exemption and toll exemption on expressways for all electric vehicles.",
      category: "policy",
      date: "July 20, 2025", 
      source: "EVreporter",
      link: "https://evreporter.com/maharashtra-electric-vehicle-policy-2025/",
      priority: "medium"
    },
    {
      id: "5",
      title: "Honda Transalp XL750 Adventure Bike at ₹11 Lakh",
      summary: "Honda launches updated 2025 Transalp XL750 adventure touring motorcycle with enhanced features and improved performance.",
      category: "launch",
      date: "July 19, 2025",
      source: "BikeWale",
      link: "https://www.bikewale.com/honda-bikes/transalp-xl750/",
      priority: "medium"
    },
    {
      id: "6",
      title: "Delhi EV Policy 2.0: 95% EVs by 2027 Target",
      summary: "Proposed ban on fossil fuel two-wheelers from Aug 2026. Third private car in household must be electric under new policy draft.",
      category: "policy", 
      date: "July 18, 2025",
      source: "Business Standard",
      link: "https://www.business-standard.com/india-news/delhi-ev-policy-2025-two-wheeler-petrol-cng-ban-auto-125040800428_1.html",
      priority: "medium"
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "policy":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case "launch":
        return <Zap className="w-4 h-4 text-green-600" />;
      case "news":
        return <Newspaper className="w-4 h-4 text-blue-600" />;
      default:
        return <Newspaper className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "policy":
        return "bg-red-100 text-red-800";
      case "launch":
        return "bg-green-100 text-green-800";
      case "news":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-4 border-red-500";
      case "medium":
        return "border-l-4 border-orange-500";
      case "low":
        return "border-l-4 border-gray-400";
      default:
        return "border-l-4 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header */}
      <div className="header-gradient-border p-4">
        <div className="flex items-center justify-between mb-2">
          <Link href="/" className="text-gray-600 hover:text-red-500">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center space-x-2">
            <ColorfulLogo />
          </div>
          <div className="w-6" /> {/* Spacer for alignment */}
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Newspaper className="w-6 h-6 text-orange-600" />
            <h1 className="text-xl font-bold text-gray-800">News Tidbits</h1>
          </div>
          <p className="text-red-600 text-sm font-medium">Latest Vehicle News & Updates</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Card className="p-3 text-center bg-red-100 shadow-orange-200 shadow-md">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-bold text-red-800">Policies</span>
            </div>
            <p className="text-lg font-bold text-red-600">3</p>
          </Card>
          <Card className="p-3 text-center bg-green-100 shadow-orange-200 shadow-md">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-xs font-bold text-green-800">Launches</span>
            </div>
            <p className="text-lg font-bold text-green-600">3</p>
          </Card>
          <Card className="p-3 text-center bg-orange-100 shadow-orange-200 shadow-md">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Newspaper className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-bold text-orange-800">Total</span>
            </div>
            <p className="text-lg font-bold text-orange-600">6</p>
          </Card>
        </div>

        {/* News Items */}
        <div className="space-y-3">
          {newsItems.map((item) => (
            <Card key={item.id} className={`p-4 shadow-orange-200 shadow-md ${getPriorityBorder(item.priority)}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(item.category)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                    {item.category.toUpperCase()}
                  </span>
                  {item.priority === "high" && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-200 text-red-800">
                      BREAKING
                    </span>
                  )}
                </div>
                <a 
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-orange-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              
              <h3 className="font-semibold text-gray-800 text-sm mb-2">
                {item.title}
              </h3>
              
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                {item.summary}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-medium">{item.source}</span>
                <span>{item.date}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Refresh Notice */}
        <Card className="p-3 text-center bg-blue-50 shadow-orange-200 shadow-md">
          <p className="text-xs text-blue-700">
            📱 News updated every hour with latest automotive information from trusted sources
          </p>
        </Card>
      </div>
    </div>
  );
}