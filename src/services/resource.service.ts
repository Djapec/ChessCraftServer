interface CachedResource {
    data: any;
    timestamp: number;
}

interface PendingRequest {
    promise: Promise<any>;
    timestamp: number;
    abortController?: AbortController;
}

export class ResourceService {
    private inflightRequests = new Map<string, PendingRequest>();
    private cache = new Map<string, CachedResource>();
    private readonly CACHE_TTL = 5000;
    private readonly REQUEST_TIMEOUT = 30000;

    constructor() {
        setInterval(() => this.cleanup(), 60000);
    }

    async getResource(resourceKey: string, fetchFunction: () => Promise<any>): Promise<any> {
        const cached = this.cache.get(resourceKey);
        if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
            // console.log(`Cache hit for: ${resourceKey}`);
            return cached.data;
        }

        return await this.getOrCreateInflightRequest(resourceKey, fetchFunction);
    }

    private async getOrCreateInflightRequest(resourceKey: string, fetchFunction: () => Promise<any>): Promise<any> {
        // This entire block must be synchronous to prevent race conditions
        let pending = this.inflightRequests.get(resourceKey);

        if (!pending) {
            const abortController = new AbortController();
            const newPromise = this.executeRequest(resourceKey, fetchFunction, abortController);

            // Create pending object
            pending = {
                promise: newPromise,
                timestamp: Date.now(),
                abortController
            };

            // ATOMIC SET: Must happen immediately after creation
            this.inflightRequests.set(resourceKey, pending);
            console.log(`🚀 Created new request for: ${resourceKey}`);
        } else {
            console.log(`🔗 Joining existing request for: ${resourceKey}`);
        }

        try {
            return await pending.promise;
        } catch (error) {
            throw error;
        }
    }

    private async executeRequest(resourceKey: string, fetchFunction: () => Promise<any>, abortController: AbortController): Promise<any> {
        try {
            // console.log(`EXTERNAL API CALL for: ${resourceKey}`);
            const result = await fetchFunction();

            // Cache the successful result
            this.cache.set(resourceKey, {
                data: result,
                timestamp: Date.now()
            });

            // console.log(`Request completed for: ${resourceKey}`);
            return result;
        } catch (error) {
            // console.error(`Request failed for: ${resourceKey}:`, error);
            throw error;
        } finally {
            // CRITICAL: Always clean up in-flight request
            this.inflightRequests.delete(resourceKey);
            // console.log(`Cleaned up request for: ${resourceKey}`);
        }
    }

    cleanup(): void {
        const now = Date.now();

        for (const [key, cached] of this.cache.entries()) {
            if (now - cached.timestamp > this.CACHE_TTL) {
                this.cache.delete(key);
            }
        }

        for (const [key, pending] of this.inflightRequests.entries()) {
            if (now - pending.timestamp > this.REQUEST_TIMEOUT) {
                // console.log(`Aborting stale request: ${key}`);
                if (pending.abortController) {
                    pending.abortController.abort();
                }
                this.inflightRequests.delete(key);
            }
        }
    }

    getStats() {
        return {
            cacheSize: this.cache.size,
            inflightRequests: this.inflightRequests.size,
            cacheEntries: Array.from(this.cache.keys()),
            inflightKeys: Array.from(this.inflightRequests.keys())
        };
    }
}