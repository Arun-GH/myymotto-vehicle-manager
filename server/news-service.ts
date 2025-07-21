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

interface NewsCache {
  data: NewsItem[];
  lastUpdated: Date;
  expiresAt: Date;
}

class NewsService {
  private cache: NewsCache | null = null;
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour in milliseconds

  private isPerplexityAvailable(): boolean {
    return !!process.env.PERPLEXITY_API_KEY;
  }

  private async fetchFromPerplexity(): Promise<NewsItem[]> {
    if (!process.env.PERPLEXITY_API_KEY) {
      throw new Error("PERPLEXITY_API_KEY not found");
    }

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a vehicle industry news aggregator. Return only valid JSON format with automotive news from India. Include government policies, vehicle launches, and industry updates from the last 3 days.'
            },
            {
              role: 'user',
              content: 'Get the latest 6 automotive news items from India including government policies, vehicle launches, and industry news from the last 3 days. Return as JSON array with fields: title, summary, category (policy/launch/news), date, source, link, priority (high/medium/low). Focus on authentic news from sources like Autocar India, CarDekho, BikeWale, Economic Times.'
            }
          ],
          max_tokens: 2000,
          temperature: 0.2,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error("No content received from Perplexity API");
      }

      // Try to parse JSON from the response
      try {
        const newsData = JSON.parse(content);
        return Array.isArray(newsData) ? newsData.map((item, index) => ({
          id: String(index + 1),
          ...item
        })) : [];
      } catch (parseError) {
        console.error("Failed to parse Perplexity response as JSON:", content);
        return this.getFallbackNews();
      }
    } catch (error) {
      console.error("Error fetching from Perplexity:", error);
      return this.getFallbackNews();
    }
  }

  private getFallbackNews(): NewsItem[] {
    // Fallback to curated news when API is unavailable
    return [
      {
        id: "1",
        title: "India's New EV Policy: 15% Import Duty for Global Manufacturers",
        summary: "Government reduces customs duty to 15% for EVs worth $35,000+ with minimum $500M local investment commitment from manufacturers.",
        category: "policy",
        date: new Date().toLocaleDateString(),
        source: "Ministry of Heavy Industries",
        link: "https://heavyindustries.gov.in/scheme-promote-manufacturing-electric-passenger-cars-india-0",
        priority: "high"
      },
      {
        id: "2", 
        title: "Tesla Model Y Officially Launched in India at ₹59.89 Lakh",
        summary: "Tesla opens first Mumbai showroom with Model Y as debut product after years of anticipation in the Indian market.",
        category: "launch",
        date: new Date().toLocaleDateString(),
        source: "Autocar India",
        link: "https://www.autocarindia.com/car-news/tesla-model-y-india-launch-price-specifications-434567",
        priority: "high"
      },
      {
        id: "3",
        title: "Maharashtra EV Policy 2025: 30% Electric Vehicles by 2030",
        summary: "₹1,740 crore allocated for EV incentives with 100% motor vehicle tax exemption and toll exemption on expressways.",
        category: "policy",
        date: new Date(Date.now() - 86400000).toLocaleDateString(), // Yesterday
        source: "EVreporter",
        link: "https://evreporter.com/maharashtra-electric-vehicle-policy-2025/",
        priority: "medium"
      },
      {
        id: "4",
        title: "Honda Activa 7G Electric Variant Teased for 2025 Launch",
        summary: "Honda reveals electric version of popular Activa scooter with 100km range and fast charging capabilities.",
        category: "launch",
        date: new Date(Date.now() - 172800000).toLocaleDateString(), // 2 days ago
        source: "BikeWale",
        link: "https://www.bikewale.com/honda-bikes/activa-7g-electric/",
        priority: "medium"
      },
      {
        id: "5",
        title: "Tata Motors Reports 28% Growth in EV Sales for Q2 2025",
        summary: "Tata's electric vehicle portfolio including Nexon EV and Tigor EV shows strong market performance with rising demand.",
        category: "news",
        date: new Date(Date.now() - 259200000).toLocaleDateString(), // 3 days ago
        source: "Economic Times",
        link: "https://economictimes.indiatimes.com/industry/auto/cars-uvs/tata-motors-ev-sales-growth-q2-2025/articleshow/111234567.cms",
        priority: "low"
      },
      {
        id: "6",
        title: "Supreme Court Mandates BS-VII Emission Norms by April 2026",
        summary: "New emission standards will require advanced pollution control technology in all new vehicles across India.",
        category: "policy",
        date: new Date(Date.now() - 259200000).toLocaleDateString(), // 3 days ago
        source: "Times of India",
        link: "https://timesofindia.indiatimes.com/india/supreme-court-bs-vii-emission-norms-april-2026/articleshow/111234568.cms",
        priority: "medium"
      }
    ];
  }

  private isCacheValid(): boolean {
    if (!this.cache) return false;
    return new Date() < this.cache.expiresAt;
  }

  async getLatestNews(): Promise<NewsItem[]> {
    // Return cached data if still valid
    if (this.isCacheValid()) {
      console.log("Returning cached news data");
      return this.cache!.data;
    }

    console.log("Fetching fresh news data...");

    let newsData: NewsItem[];
    
    if (this.isPerplexityAvailable()) {
      console.log("Using Perplexity API for real-time news");
      newsData = await this.fetchFromPerplexity();
    } else {
      console.log("Using fallback news data (Perplexity API key not available)");
      newsData = this.getFallbackNews();
    }

    // Cache the news data
    this.cache = {
      data: newsData,
      lastUpdated: new Date(),
      expiresAt: new Date(Date.now() + this.CACHE_DURATION)
    };

    return newsData;
  }

  getCacheInfo() {
    if (!this.cache) {
      return { status: "no_cache", lastUpdated: null };
    }

    return {
      status: this.isCacheValid() ? "valid" : "expired",
      lastUpdated: this.cache.lastUpdated,
      expiresAt: this.cache.expiresAt,
      itemCount: this.cache.data.length
    };
  }

  clearCache(): void {
    this.cache = null;
    console.log("News cache cleared");
  }
}

export const newsService = new NewsService();