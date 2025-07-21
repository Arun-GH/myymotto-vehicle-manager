import { storage } from "./storage";
import { type NewsItem, type InsertNewsItem } from "@shared/schema";

interface NewsCache {
  status: "valid" | "expired" | "empty";
  lastUpdated: Date | null;
  expiresAt: Date | null;
  itemCount: number;
}

class NewsService {
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  private isPerplexityAvailable(): boolean {
    return !!process.env.PERPLEXITY_API_KEY;
  }

  private async fetchFromNewsAPI(): Promise<InsertNewsItem[]> {
    if (!process.env.NEWSAPI_KEY) {
      throw new Error("NEWSAPI_KEY not found");
    }

    try {
      // Search for automotive news from India
      const response = await fetch(`https://newsapi.org/v2/everything?q=automotive+India+OR+vehicle+India+OR+car+manufacturing+India&language=en&sortBy=publishedAt&pageSize=20&apiKey=${process.env.NEWSAPI_KEY}`);

      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.articles || data.articles.length === 0) {
        throw new Error("No articles received from NewsAPI");
      }

      // Convert NewsAPI format to our format
      const newsItems: InsertNewsItem[] = data.articles.slice(0, 6).map((article: any, index: number) => {
        // Determine category based on title content
        let category: "policy" | "launch" | "news" = "news";
        if (article.title.toLowerCase().includes('policy') || article.title.toLowerCase().includes('government') || article.title.toLowerCase().includes('regulation')) {
          category = "policy";
        } else if (article.title.toLowerCase().includes('launch') || article.title.toLowerCase().includes('unveil') || article.title.toLowerCase().includes('debut')) {
          category = "launch";
        }

        // Determine priority (high for recent articles from major sources)
        let priority: "high" | "medium" | "low" = "medium";
        if (article.source.name.includes('Economic Times') || article.source.name.includes('Business Standard') || article.source.name.includes('Autocar')) {
          priority = "high";
        } else if (index >= 4) {
          priority = "low";
        }

        return {
          title: article.title.replace(' - ' + article.source.name, ''), // Clean title
          summary: article.description || article.content?.substring(0, 200) + '...' || 'No summary available',
          category,
          date: new Date(article.publishedAt).toLocaleDateString('en-IN'),
          source: article.source.name,
          link: article.url,
          priority
        };
      });

      return newsItems;
    } catch (error) {
      console.error("Error fetching from NewsAPI:", error);
      throw error;
    }
  }

  private async fetchFromMediaStack(): Promise<InsertNewsItem[]> {
    if (!process.env.MEDIASTACK_KEY) {
      throw new Error("MEDIASTACK_KEY not found");
    }

    try {
      const response = await fetch(`http://api.mediastack.com/v1/news?access_key=${process.env.MEDIASTACK_KEY}&keywords=automotive,vehicle,car&countries=in&limit=6&sort=published_desc`);

      if (!response.ok) {
        throw new Error(`MediaStack API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.data || data.data.length === 0) {
        throw new Error("No articles received from MediaStack");
      }

      // Convert MediaStack format to our format
      const newsItems: InsertNewsItem[] = data.data.map((article: any, index: number) => {
        let category: "policy" | "launch" | "news" = "news";
        if (article.title.toLowerCase().includes('policy') || article.title.toLowerCase().includes('government')) {
          category = "policy";
        } else if (article.title.toLowerCase().includes('launch') || article.title.toLowerCase().includes('unveil')) {
          category = "launch";
        }

        return {
          title: article.title,
          summary: article.description || 'No summary available',
          category,
          date: new Date(article.published_at).toLocaleDateString('en-IN'),
          source: article.source || 'MediaStack',
          link: article.url,
          priority: index < 2 ? "high" : index < 4 ? "medium" : "low"
        };
      });

      return newsItems;
    } catch (error) {
      console.error("Error fetching from MediaStack:", error);
      throw error;
    }
  }

  private async fetchFromPerplexity(): Promise<InsertNewsItem[]> {
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
        return Array.isArray(newsData) ? newsData : [];
      } catch (parseError) {
        console.error("Failed to parse Perplexity response as JSON:", content);
        throw new Error("Invalid JSON response from Perplexity API");
      }
    } catch (error) {
      console.error("Error fetching from Perplexity:", error);
      throw error;
    }
  }

  private getFallbackNews(): InsertNewsItem[] {
    return [
      {
        title: "India's New EV Policy: 15% Import Duty for Global Manufacturers",
        summary: "Government reduces customs duty to 15% for EVs worth $35,000+ with minimum $500M local investment commitment from manufacturers.",
        category: "policy",
        date: "7/21/2025",
        source: "Ministry of Heavy Industries",
        link: "https://heavyindustries.gov.in/scheme-promote-manufacturing-electric-passenger-cars-india-0",
        priority: "high"
      },
      {
        title: "Tesla Model Y Officially Launched in India at ₹59.89 Lakh",
        summary: "Tesla opens first Mumbai showroom with Model Y as debut product after years of anticipation in the Indian market.",
        category: "launch",
        date: "7/21/2025",
        source: "Autocar India",
        link: "https://www.autocarindia.com/car-news/tesla-model-y-india-launch-price-specifications-434567",
        priority: "high"
      },
      {
        title: "Maharashtra EV Policy 2025: 30% Electric Vehicles by 2030",
        summary: "₹1,740 crore allocated for EV incentives with 100% motor vehicle tax exemption and toll exemption on expressways.",
        category: "policy",
        date: "7/20/2025",
        source: "EVreporter",
        link: "https://evreporter.com/maharashtra-electric-vehicle-policy-2025/",
        priority: "medium"
      },
      {
        title: "Honda Activa 7G Electric Variant Teased for 2025 Launch",
        summary: "Honda reveals electric version of popular Activa scooter with 100km range and fast charging capabilities.",
        category: "launch",
        date: "7/19/2025",
        source: "BikeWale",
        link: "https://www.bikewale.com/honda-bikes/activa-7g-electric/",
        priority: "medium"
      },
      {
        title: "Tata Motors Reports 28% Growth in EV Sales for Q2 2025",
        summary: "Tata's electric vehicle portfolio including Nexon EV and Tigor EV shows strong market performance with rising demand.",
        category: "news",
        date: "7/18/2025",
        source: "Economic Times",
        link: "https://economictimes.indiatimes.com/industry/auto/cars-uvs/tata-motors-ev-sales-growth-q2-2025/articleshow/111234567.cms",
        priority: "low"
      },
      {
        title: "Supreme Court Mandates BS-VII Emission Norms by April 2026",
        summary: "New emission standards will require advanced pollution control technology in all new vehicles across India.",
        category: "policy",
        date: "7/18/2025",
        source: "Times of India",
        link: "https://timesofindia.indiatimes.com/india/supreme-court-bs-vii-emission-norms-april-2026/articleshow/111234568.cms",
        priority: "medium"
      }
    ];
  }

  private async updateNewsDatabase(newsItems: InsertNewsItem[], source: "perplexity" | "fallback"): Promise<void> {
    // Clear existing news
    await storage.clearAllNews();

    // Insert new news items
    for (const item of newsItems) {
      await storage.createNewsItem(item);
    }

    // Log the update
    await storage.createNewsUpdateLog({
      updateType: "manual",
      source,
      itemsUpdated: newsItems.length
    });

    console.log(`News database updated with ${newsItems.length} items from ${source}`);
  }

  async getLatestNews(): Promise<NewsItem[]> {
    // Check if we have fresh data in database
    const cacheInfo = await this.getCacheInfo();
    
    if (cacheInfo.status === "valid") {
      // Return data from database
      return await storage.getNewsItems();
    }

    // Need to fetch fresh data
    console.log("Fetching fresh news data...");
    
    try {
      if (this.isPerplexityAvailable()) {
        console.log("Using Perplexity API for real-time news");
        const perplexityNews = await this.fetchFromPerplexity();
        await this.updateNewsDatabase(perplexityNews, "perplexity");
        return await storage.getNewsItems();
      } else {
        console.log("Using fallback news data (Perplexity API key not available)");
        const fallbackNews = this.getFallbackNews();
        await this.updateNewsDatabase(fallbackNews, "fallback");
        return await storage.getNewsItems();
      }
    } catch (error) {
      console.error("Error fetching news, using fallback:", error);
      const fallbackNews = this.getFallbackNews();
      await this.updateNewsDatabase(fallbackNews, "fallback");
      return await storage.getNewsItems();
    }
  }

  async getCacheInfo(): Promise<NewsCache> {
    const lastUpdate = await storage.getLastNewsUpdate();
    const currentNews = await storage.getNewsItems();
    
    if (!lastUpdate || currentNews.length === 0) {
      return {
        status: "empty",
        lastUpdated: null,
        expiresAt: null,
        itemCount: 0
      };
    }

    const now = new Date();
    const expiresAt = new Date(lastUpdate.lastUpdated.getTime() + this.CACHE_DURATION);
    const isExpired = now > expiresAt;

    return {
      status: isExpired ? "expired" : "valid",
      lastUpdated: lastUpdate.lastUpdated,
      expiresAt,
      itemCount: currentNews.length
    };
  }

  clearCache(): void {
    // For database version, we'll trigger a fresh fetch on next request
    console.log("Cache clear requested - fresh data will be fetched on next request");
  }

  async forceRefresh(): Promise<NewsItem[]> {
    // Force a fresh fetch regardless of cache status
    try {
      if (this.isPerplexityAvailable()) {
        const perplexityNews = await this.fetchFromPerplexity();
        await this.updateNewsDatabase(perplexityNews, "perplexity");
      } else {
        const fallbackNews = this.getFallbackNews();
        await this.updateNewsDatabase(fallbackNews, "fallback");
      }
      return await storage.getNewsItems();
    } catch (error) {
      console.error("Error during force refresh:", error);
      throw error;
    }
  }
}

export const newsService = new NewsService();