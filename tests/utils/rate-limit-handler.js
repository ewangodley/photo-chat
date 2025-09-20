class RateLimitHandler {
  constructor() {
    this.lastRequestTime = 0;
    this.minInterval = 2000; // 2 seconds between requests
  }

  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastRequest;
      console.log(`⏳ Waiting ${waitTime}ms to avoid rate limiting...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  async handleRateLimitedRequest(requestFn, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      await this.waitForRateLimit();
      
      try {
        const response = await requestFn();
        
        if (response.status === 429) {
          const retryAfter = response.data?.error?.details?.retryAfter || 60;
          console.log(`⚠️  Rate limited (attempt ${attempt}/${maxRetries}), waiting ${retryAfter}s...`);
          
          if (attempt === maxRetries) {
            throw new Error(`Rate limit exceeded after ${maxRetries} attempts`);
          }
          
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }
        
        return response;
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        console.log(`🔄 Request failed (attempt ${attempt}/${maxRetries}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
}

module.exports = RateLimitHandler;