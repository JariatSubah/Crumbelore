// js/realtime-sync.js - Real-time Backend Synchronization
window.API_BASE_URL = 'http://127.0.0.1:8000/api';

class RealtimeSync {
    constructor() {
        this.syncIntervals = {
            products: null,
            books: null,
            events: null,
            orders: null
        };
        
        this.lastUpdated = {
            products: null,
            books: null,
            events: null,
            orders: null
        };
        
        this.callbacks = {
            products: [],
            books: [],
            events: [],
            orders: []
        };
        
        this.isConnected = false;
        this.checkConnection();
    }

    // Check if backend is accessible
    async checkConnection() {
        try {
            const response = await fetch(`${API_BASE_URL}/products/`, {
                method: 'HEAD',
                signal: AbortSignal.timeout(5000)
            });
            this.isConnected = response.ok;
            if (this.isConnected) {
                console.log('✅ Backend connected - real-time sync enabled');
                this.showNotification('Live updates enabled', 'success');
            }
            return this.isConnected;
        } catch (error) {
            this.isConnected = false;
            console.warn('⚠️ Backend not accessible - using cached data');
            return false;
        }
    }

    // Register callback for data updates
    onUpdate(dataType, callback) {
        if (this.callbacks[dataType]) {
            this.callbacks[dataType].push(callback);
        }
    }

    // Trigger all callbacks for a data type
    triggerCallbacks(dataType, data) {
        if (this.callbacks[dataType]) {
            this.callbacks[dataType].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${dataType} callback:`, error);
                }
            });
        }
    }

    // Start syncing specific data type
    startSync(dataType, intervalSeconds = 10) {
        if (this.syncIntervals[dataType]) {
            console.log(`${dataType} sync already running`);
            return;
        }

        console.log(`🔄 Starting ${dataType} sync (every ${intervalSeconds}s)`);
        
        // Initial fetch
        this.fetchData(dataType);
        
        // Set up polling
        this.syncIntervals[dataType] = setInterval(() => {
            this.fetchData(dataType);
        }, intervalSeconds * 1000);
    }

    // Stop syncing specific data type
    stopSync(dataType) {
        if (this.syncIntervals[dataType]) {
            clearInterval(this.syncIntervals[dataType]);
            this.syncIntervals[dataType] = null;
            console.log(`${dataType} sync stopped`);
        }
    }

    // Stop all syncing
    stopAllSync() {
        Object.keys(this.syncIntervals).forEach(type => {
            this.stopSync(type);
        });
    }

    // Fetch data from backend
    async fetchData(dataType) {
        if (!this.isConnected) {
            return null;
        }

        const endpoints = {
            products: '/products/',
            books: '/books/',
            events: '/events/',
            orders: '/orders/'
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoints[dataType]}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const items = Array.isArray(data) ? data : data.results || data.items || [];
            
            // Check if data has changed
            const hasChanged = this.hasDataChanged(dataType, items);
            
            if (hasChanged) {
                console.log(`📥 ${dataType} updated: ${items.length} items`);
                this.lastUpdated[dataType] = Date.now();
                
                // Store in cache
                this.cacheData(dataType, items);
                
                // Trigger callbacks
                this.triggerCallbacks(dataType, items);
                
                // Show subtle notification
                if (this.lastUpdated[dataType]) { // Not first load
                    this.showNotification(`${dataType} updated (${items.length} items)`, 'info');
                }
            }
            
            return items;
            
        } catch (error) {
            console.error(`Error fetching ${dataType}:`, error);
            // Use cached data as fallback
            return this.getCachedData(dataType);
        }
    }

    // Check if data has actually changed
    hasDataChanged(dataType, newData) {
        const cached = this.getCachedData(dataType);
        if (!cached) return true;
        
        // Simple comparison by length and IDs
        if (cached.length !== newData.length) return true;
        
        const cachedIds = cached.map(item => item.id).sort();
        const newIds = newData.map(item => item.id).sort();
        
        return JSON.stringify(cachedIds) !== JSON.stringify(newIds);
    }

    // Cache data
    cacheData(dataType, data) {
        try {
            sessionStorage.setItem(`cached_${dataType}`, JSON.stringify({
                data: data,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error(`Error caching ${dataType}:`, error);
        }
    }

    // Get cached data
    getCachedData(dataType) {
        try {
            const cached = sessionStorage.getItem(`cached_${dataType}`);
            if (cached) {
                const parsed = JSON.parse(cached);
                // Cache valid for 5 minutes
                if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
                    return parsed.data;
                }
            }
        } catch (error) {
            console.error(`Error reading cached ${dataType}:`, error);
        }
        return null;
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create subtle notification
        const notification = document.createElement('div');
        notification.className = 'realtime-notification';
        notification.innerHTML = `
            <i class="fas fa-sync-alt"></i>
            <span>${message}</span>
        `;
        
        const styles = {
            info: 'background: #2196F3; color: white;',
            success: 'background: #4CAF50; color: white;',
            warning: 'background: #FF9800; color: white;',
            error: 'background: #f44336; color: white;'
        };
        
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            ${styles[type]}
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideInUp 0.3s ease;
            opacity: 0.9;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutDown 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Get statistics
    getStats() {
        return {
            connected: this.isConnected,
            lastUpdated: this.lastUpdated,
            activeSyncs: Object.entries(this.syncIntervals)
                .filter(([_, interval]) => interval !== null)
                .map(([type, _]) => type)
        };
    }
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            transform: translateY(100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 0.9;
        }
    }
    
    @keyframes slideOutDown {
        from {
            transform: translateY(0);
            opacity: 0.9;
        }
        to {
            transform: translateY(100%);
            opacity: 0;
        }
    }
    
    .realtime-notification i {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Create global instance
window.realtimeSync = new RealtimeSync();

console.log('🔄 Real-time sync system initialized');

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealtimeSync;
}