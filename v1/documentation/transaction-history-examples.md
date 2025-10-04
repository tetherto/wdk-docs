---
title: Transaction History Examples
description: Complete working code examples for implementing transaction history in wallet applications using the WDK.
lastReviewed: 2024-01-15
---

# Transaction History Examples

## Overview

This page provides complete, working code examples for implementing transaction history in your wallet application. All examples are production-ready and follow best practices for performance, accessibility, and user experience.

**Target Audience**: Developers implementing transaction history
**Prerequisites**: React knowledge, familiarity with WDK APIs
**Related Documentation**: [Transaction History Integration](transaction-history.md) | [UI Patterns](transaction-history-ui-patterns.md)

## Table of Contents

1. [Complete React Implementation](#complete-react-implementation)
2. [Service Layer Examples](#service-layer-examples)
3. [Testing Examples](#testing-examples)
4. [Mobile-Specific Examples](#mobile-specific-examples)
5. [Advanced Use Cases](#advanced-use-cases)

---

## Complete React Implementation

### Full Transaction History Component

```jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { formatDistanceToNow } from 'date-fns';

// Main Transaction History Container
function TransactionHistoryContainer({ addresses, userId }) {
  const [filters, setFilters] = useState({
    tokens: [],
    direction: 'all',
    status: 'all',
    dateRange: null,
    searchQuery: ''
  });

  const {
    transactions,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  } = useTransactionHistory(addresses, filters);

  const {
    filteredTransactions,
    groupedTransactions
  } = useTransactionProcessing(transactions, filters);

  return (
    <div className="transaction-history-container">
      <TransactionHeader 
        onRefresh={refresh}
        onFiltersChange={setFilters}
        filters={filters}
        loading={loading}
      />
      
      <TransactionFilters 
        filters={filters}
        onFiltersChange={setFilters}
        transactions={transactions}
      />
      
      <TransactionList
        transactions={groupedTransactions}
        loading={loading}
        error={error}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </div>
  );
}

// Custom Hook for Transaction History Management
function useTransactionHistory(addresses, filters) {
  const [state, setState] = useState({
    transactions: [],
    loading: true,
    error: null,
    hasMore: true,
    cursor: null
  });

  const transactionService = useMemo(
    () => new TransactionHistoryService(),
    []
  );

  const loadTransactions = useCallback(async (reset = false) => {
    if (state.loading && !reset) return;

    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null 
    }));

    try {
      const response = await transactionService.getTransactionHistory(
        addresses,
        {
          cursor: reset ? null : state.cursor,
          limit: 50,
          ...filters
        }
      );

      setState(prev => ({
        transactions: reset 
          ? response.transactions 
          : [...prev.transactions, ...response.transactions],
        loading: false,
        hasMore: response.pagination.hasNext,
        cursor: response.pagination.cursor,
        error: null
      }));

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error 
      }));
    }
  }, [addresses, filters, state.cursor, transactionService]);

  // Load initial data
  useEffect(() => {
    if (addresses?.length > 0) {
      loadTransactions(true);
    }
  }, [addresses]);

  // Reload when filters change
  useEffect(() => {
    loadTransactions(true);
  }, [filters]);

  const loadMore = useCallback(() => {
    if (state.hasMore && !state.loading) {
      loadTransactions(false);
    }
  }, [loadTransactions, state.hasMore, state.loading]);

  const refresh = useCallback(() => {
    loadTransactions(true);
  }, [loadTransactions]);

  return {
    ...state,
    loadMore,
    refresh
  };
}

// Transaction Processing Hook
function useTransactionProcessing(transactions, filters) {
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Apply search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          tx.transactionHash.toLowerCase().includes(query) ||
          tx.token.toLowerCase().includes(query) ||
          tx.from?.toLowerCase().includes(query) ||
          tx.to?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [transactions, filters]);

  const groupedTransactions = useMemo(() => {
    const groups = {};
    
    filteredTransactions.forEach(tx => {
      const date = new Date(tx.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(tx);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => new Date(b) - new Date(a))
      .map(([date, txs]) => ({
        date,
        transactions: txs.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        )
      }));
  }, [filteredTransactions]);

  return {
    filteredTransactions,
    groupedTransactions
  };
}

// Transaction Header Component
function TransactionHeader({ onRefresh, loading }) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="transaction-header">
      <h2 className="transaction-title">Transaction History</h2>
      <button
        onClick={handleRefresh}
        disabled={loading || refreshing}
        className="refresh-button"
      >
        {refreshing ? (
          <Spinner className="animate-spin" />
        ) : (
          <RefreshIcon />
        )}
        Refresh
      </button>
    </div>
  );
}

// Transaction List Component
function TransactionList({ 
  transactions, 
  loading, 
  error, 
  hasMore, 
  onLoadMore 
}) {
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px'
  });

  useEffect(() => {
    if (inView && hasMore && !loading) {
      onLoadMore();
    }
  }, [inView, hasMore, loading, onLoadMore]);

  if (error) {
    return <TransactionError error={error} />;
  }

  if (loading && transactions.length === 0) {
    return <TransactionSkeleton />;
  }

  if (transactions.length === 0) {
    return <EmptyTransactionState />;
  }

  return (
    <div className="transaction-list">
      {transactions.map(group => (
        <TransactionDateGroup 
          key={group.date}
          date={group.date}
          transactions={group.transactions}
        />
      ))}
      
      {hasMore && (
        <div ref={loadMoreRef} className="load-more-trigger">
          {loading && <TransactionLoadingMore />}
        </div>
      )}
    </div>
  );
}

// Date Group Component
function TransactionDateGroup({ date, transactions }) {
  return (
    <div className="transaction-date-group">
      <div className="date-header">
        <h3>{formatDateHeader(date)}</h3>
        <span className="transaction-count">
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="date-transactions">
        {transactions.map((transaction, index) => (
          <TransactionItem 
            key={`${transaction.transactionHash}-${index}`}
            transaction={transaction}
          />
        ))}
      </div>
    </div>
  );
}

// Individual Transaction Item
function TransactionItem({ transaction }) {
  const [expanded, setExpanded] = useState(false);

  const formatAmount = (amount, token, direction) => {
    const formatted = parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
    const sign = direction === 'out' ? '-' : '+';
    return `${sign}${formatted} ${token.toUpperCase()}`;
  };

  const handleClick = () => {
    setExpanded(!expanded);
  };

  return (
    <div 
      className={`transaction-item direction-${transaction.direction} status-${transaction.status}`}
      onClick={handleClick}
    >
      <div className="transaction-summary">
        <div className="transaction-icon">
          <DirectionIcon direction={transaction.direction} />
          <TokenLogo token={transaction.token} />
        </div>
        
        <div className="transaction-details">
          <div className="transaction-header">
            <span className="amount">
              {formatAmount(transaction.amount, transaction.token, transaction.direction)}
            </span>
            <span className="timestamp">
              {formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}
            </span>
          </div>
          
          <div className="transaction-meta">
            <span className="counterparty">
              {transaction.direction === 'in' 
                ? `From ${shortenAddress(transaction.from)}`
                : `To ${shortenAddress(transaction.to)}`
              }
            </span>
            <TransactionStatus transaction={transaction} />
          </div>
          
          {transaction.fiatValue && (
            <div className="fiat-value">
              ${parseFloat(transaction.fiatValue).toFixed(2)} USD
            </div>
          )}
        </div>
        
        <div className="transaction-actions">
          <ChevronIcon 
            className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>
      
      {expanded && (
        <TransactionDetails transaction={transaction} />
      )}
    </div>
  );
}

// Transaction Details Expansion
function TransactionDetails({ transaction }) {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Show toast notification
  };

  return (
    <div className="transaction-details-expanded">
      <div className="detail-row">
        <span className="detail-label">Transaction Hash</span>
        <span className="detail-value">
          {transaction.transactionHash}
          <button 
            onClick={() => copyToClipboard(transaction.transactionHash)}
            className="copy-button"
          >
            <CopyIcon />
          </button>
        </span>
      </div>
      
      <div className="detail-row">
        <span className="detail-label">Block Number</span>
        <span className="detail-value">{transaction.blockNumber}</span>
      </div>
      
      <div className="detail-row">
        <span className="detail-label">Network</span>
        <span className="detail-value">{transaction.blockchain}</span>
      </div>
      
      {transaction.fee && (
        <div className="detail-row">
          <span className="detail-label">Network Fee</span>
          <span className="detail-value">
            {transaction.fee} {getNativeToken(transaction.blockchain)}
          </span>
        </div>
      )}
      
      <div className="detail-actions">
        <button 
          onClick={() => openInExplorer(transaction)}
          className="action-button"
        >
          <ExternalLinkIcon />
          View on Explorer
        </button>
        
        <button 
          onClick={() => exportTransaction(transaction)}
          className="action-button"
        >
          <DownloadIcon />
          Export Details
        </button>
      </div>
    </div>
  );
}

// Utility Components
function TransactionStatus({ transaction }) {
  const getStatusConfig = (tx) => {
    if (tx.status === 'pending') {
      return {
        color: 'orange',
        text: 'Pending',
        icon: <ClockIcon />
      };
    }
    if (tx.status === 'confirmed') {
      return {
        color: 'green',
        text: 'Confirmed',
        icon: <CheckIcon />
      };
    }
    return {
      color: 'red',
      text: 'Failed',
      icon: <XIcon />
    };
  };

  const config = getStatusConfig(transaction);
  
  return (
    <div className={`transaction-status status-${config.color}`}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
}

function DirectionIcon({ direction }) {
  const icons = {
    'in': <ArrowDownIcon className="text-green-500" />,
    'out': <ArrowUpIcon className="text-red-500" />,
    'self': <RefreshIcon className="text-blue-500" />
  };
  
  return icons[direction] || <ArrowRightIcon />;
}

function TokenLogo({ token }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageFailed) {
    return (
      <div className="token-logo-fallback">
        {token.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={`/tokens/${token.toLowerCase()}.png`}
      alt={`${token} logo`}
      className="token-logo"
      onError={() => setImageFailed(true)}
    />
  );
}

// Loading and Error States
function TransactionSkeleton() {
  return (
    <div className="transaction-skeleton">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skeleton-item">
          <div className="skeleton-icon" />
          <div className="skeleton-content">
            <div className="skeleton-line skeleton-amount" />
            <div className="skeleton-line skeleton-meta" />
          </div>
          <div className="skeleton-timestamp" />
        </div>
      ))}
    </div>
  );
}

function TransactionError({ error }) {
  return (
    <div className="transaction-error">
      <AlertTriangleIcon className="error-icon" />
      <h3>Unable to load transactions</h3>
      <p>{error.message}</p>
      <button onClick={() => window.location.reload()}>
        Try Again
      </button>
    </div>
  );
}

function EmptyTransactionState() {
  return (
    <div className="empty-transaction-state">
      <WalletIcon className="empty-icon" />
      <h3>No transactions yet</h3>
      <p>Your transaction history will appear here once you start using your wallet.</p>
    </div>
  );
}

function TransactionLoadingMore() {
  return (
    <div className="loading-more">
      <Spinner className="animate-spin" />
      <span>Loading more transactions...</span>
    </div>
  );
}

// Utility Functions
function shortenAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDateHeader(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function getNativeToken(blockchain) {
  const nativeTokens = {
    bitcoin: 'BTC',
    ethereum: 'ETH',
    solana: 'SOL',
    ton: 'TON',
    tron: 'TRX'
  };
  return nativeTokens[blockchain] || blockchain.toUpperCase();
}

function openInExplorer(transaction) {
  const explorerUrls = {
    bitcoin: 'https://blockstream.info/tx/',
    ethereum: 'https://etherscan.io/tx/',
    solana: 'https://solscan.io/tx/',
    ton: 'https://tonscan.org/tx/',
    tron: 'https://tronscan.org/#/transaction/'
  };
  
  const baseUrl = explorerUrls[transaction.blockchain];
  if (baseUrl) {
    window.open(`${baseUrl}${transaction.transactionHash}`, '_blank');
  }
}

function exportTransaction(transaction) {
  const data = {
    hash: transaction.transactionHash,
    blockchain: transaction.blockchain,
    amount: transaction.amount,
    token: transaction.token,
    direction: transaction.direction,
    timestamp: transaction.timestamp,
    status: transaction.status,
    from: transaction.from,
    to: transaction.to,
    fee: transaction.fee,
    blockNumber: transaction.blockNumber
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transaction-${transaction.transactionHash.slice(0, 8)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default TransactionHistoryContainer;
```

## Service Layer Examples

### Transaction History Service

```javascript
// transaction-history.service.js
class TransactionHistoryService {
  constructor(config = {}) {
    this.apiClient = new WDKApiClient(config);
    this.cache = new TransactionCache();
    this.realTimeUpdates = null;
  }

  async getTransactionHistory(addresses, options = {}) {
    const cacheKey = this.getCacheKey(addresses, options);
    
    try {
      // Try cache first
      const cached = await this.cache.get(cacheKey);
      if (cached && !options.forceRefresh) {
        return {
          ...cached,
          source: 'cache'
        };
      }

      // Fetch from API
      const response = await this.apiClient.get('/v1/transactions', {
        params: {
          addresses: addresses.join(','),
          cursor: options.cursor,
          limit: options.limit || 50,
          tokens: options.tokens?.join(','),
          direction: options.direction,
          fromDate: options.fromDate,
          toDate: options.toDate,
          status: options.status
        }
      });

      const result = {
        transactions: response.data.transactions,
        pagination: response.data.pagination,
        meta: response.data.meta,
        source: 'api'
      };

      // Cache the result
      await this.cache.set(cacheKey, result);

      return result;

    } catch (error) {
      // Fallback to cache on error
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return {
          ...cached,
          source: 'cache',
          stale: true
        };
      }
      
      throw new TransactionHistoryError(
        'Failed to fetch transaction history',
        error
      );
    }
  }

  async getBalance(address, token) {
    try {
      const response = await this.apiClient.get('/v1/balance', {
        params: { address, token }
      });
      
      return response.data;
    } catch (error) {
      throw new TransactionHistoryError(
        'Failed to fetch balance',
        error
      );
    }
  }

  subscribeToUpdates(addresses, callback) {
    if (this.realTimeUpdates) {
      this.realTimeUpdates.disconnect();
    }

    this.realTimeUpdates = new RealTimeTransactionUpdates(
      this.apiClient,
      addresses
    );

    return this.realTimeUpdates.subscribe(callback);
  }

  getCacheKey(addresses, options) {
    const key = {
      addresses: addresses.sort(),
      ...options
    };
    return btoa(JSON.stringify(key));
  }
}

// Real-time updates service
class RealTimeTransactionUpdates {
  constructor(apiClient, addresses) {
    this.apiClient = apiClient;
    this.addresses = new Set(addresses);
    this.subscribers = new Set();
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    
    if (this.subscribers.size === 1) {
      this.connect();
    }
    
    return () => {
      this.subscribers.delete(callback);
      if (this.subscribers.size === 0) {
        this.disconnect();
      }
    };
  }

  connect() {
    const wsUrl = this.apiClient.getWebSocketUrl();
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      
      // Subscribe to address updates
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        addresses: Array.from(this.addresses)
      }));
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code);
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  handleMessage(data) {
    if (data.type === 'transaction') {
      this.notifySubscribers(data.transaction);
    } else if (data.type === 'balance_update') {
      this.notifySubscribers({
        type: 'balance_update',
        ...data
      });
    }
  }

  notifySubscribers(data) {
    this.subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Subscriber callback failed:', error);
      }
    });
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      this.reconnectAttempts++;
      
      setTimeout(() => {
        console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts exceeded');
      this.notifySubscribers({
        type: 'connection_failed',
        message: 'Unable to maintain real-time connection'
      });
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Caching service
class TransactionCache {
  constructor() {
    this.memoryCache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutes
    this.maxSize = 100;
  }

  async get(key) {
    // Check memory cache
    const cached = this.memoryCache.get(key);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < this.ttl) {
        return cached.data;
      } else {
        this.memoryCache.delete(key);
      }
    }

    // Check localStorage
    try {
      const stored = localStorage.getItem(`tx_cache_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;
        
        if (age < this.ttl) {
          // Promote to memory cache
          this.memoryCache.set(key, parsed);
          return parsed.data;
        } else {
          localStorage.removeItem(`tx_cache_${key}`);
        }
      }
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
    }

    return null;
  }

  async set(key, data) {
    const cacheEntry = {
      data,
      timestamp: Date.now()
    };

    // Store in memory cache
    this.memoryCache.set(key, cacheEntry);
    
    // Cleanup memory cache if too large
    if (this.memoryCache.size > this.maxSize) {
      const oldestKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldestKey);
    }

    // Store in localStorage
    try {
      localStorage.setItem(
        `tx_cache_${key}`,
        JSON.stringify(cacheEntry)
      );
    } catch (error) {
      // Handle storage quota exceeded
      this.cleanup();
      try {
        localStorage.setItem(
          `tx_cache_${key}`,
          JSON.stringify(cacheEntry)
        );
      } catch (retryError) {
        console.warn('Failed to store in localStorage:', retryError);
      }
    }
  }

  cleanup() {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.startsWith('tx_cache_')) {
        try {
          const stored = JSON.parse(localStorage.getItem(key));
          const age = now - stored.timestamp;
          
          if (age > this.ttl) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          localStorage.removeItem(key);
        }
      }
    });
  }
}

// Custom error class
class TransactionHistoryError extends Error {
  constructor(message, originalError, code) {
    super(message);
    this.name = 'TransactionHistoryError';
    this.code = code;
    this.originalError = originalError;
  }
}

export {
  TransactionHistoryService,
  RealTimeTransactionUpdates,
  TransactionCache,
  TransactionHistoryError
};
```

### API Client Implementation

```javascript
// wdk-api-client.js
class WDKApiClient {
  constructor(config = {}) {
    this.baseURL = config.baseURL || 'https://api.your-wdk-instance.com';
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
    this.retryAttempts = config.retryAttempts || 3;
    this.rateLimiter = new ClientRateLimiter();
  }

  async get(endpoint, options = {}) {
    return this.request('GET', endpoint, options);
  }

  async post(endpoint, data, options = {}) {
    return this.request('POST', endpoint, { ...options, body: data });
  }

  async request(method, endpoint, options = {}) {
    await this.rateLimiter.checkLimit();

    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...options.headers
      },
      signal: AbortSignal.timeout(this.timeout)
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    if (options.params) {
      const searchParams = new URLSearchParams(options.params);
      endpoint += `?${searchParams.toString()}`;
    }

    const url = `${this.baseURL}${endpoint}`;

    return this.requestWithRetry(url, config);
  }

  async requestWithRetry(url, config, attempt = 1) {
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await this.handleErrorResponse(response);
        throw error;
      }

      return await response.json();
      
    } catch (error) {
      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.requestWithRetry(url, config, attempt + 1);
      }
      
      throw error;
    }
  }

  async handleErrorResponse(response) {
    const errorData = await response.json().catch(() => ({}));
    
    const error = new Error(errorData.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.code = errorData.code;
    
    return error;
  }

  shouldRetry(error) {
    // Retry on network errors or 5xx responses
    return (
      error.name === 'TypeError' || // Network error
      (error.status >= 500 && error.status < 600) || // Server error
      error.status === 429 // Rate limited
    );
  }

  getWebSocketUrl() {
    return this.baseURL.replace('https://', 'wss://').replace('http://', 'ws://') + '/transactions/live';
  }
}

// Client-side rate limiter
class ClientRateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.requests = [];
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async checkLimit() {
    const now = Date.now();
    
    // Remove old requests
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.windowMs - (now - oldestRequest);
      throw new Error(`Rate limited. Try again in ${Math.ceil(waitTime / 1000)}s`);
    }
    
    this.requests.push(now);
  }
}

export { WDKApiClient, ClientRateLimiter };
```

## Testing Examples

### Component Testing

```javascript
// TransactionHistoryContainer.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import TransactionHistoryContainer from '../TransactionHistoryContainer';

const mockTransactions = [
  {
    transactionHash: '0x123...',
    blockchain: 'ethereum',
    direction: 'in',
    amount: '100.0',
    token: 'usdt',
    timestamp: '2024-01-15T10:30:00.000Z',
    status: 'confirmed',
    confirmations: 12,
    from: '0xabc...',
    to: '0xdef...',
    blockNumber: 18500000
  },
  {
    transactionHash: '0x456...',
    blockchain: 'bitcoin',
    direction: 'out',
    amount: '0.001',
    token: 'btc',
    timestamp: '2024-01-14T15:45:00.000Z',
    status: 'confirmed',
    confirmations: 6,
    from: '1abc...',
    to: '1def...',
    blockNumber: 825000
  }
];

const server = setupServer(
  rest.get('/v1/transactions', (req, res, ctx) => {
    return res(
      ctx.json({
        transactions: mockTransactions,
        pagination: {
          hasNext: false,
          cursor: null,
          limit: 50,
          total: 2
        },
        meta: {
          responseTime: '120ms',
          source: 'indexer'
        }
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('TransactionHistoryContainer', () => {
  test('renders transaction history correctly', async () => {
    render(
      <TransactionHistoryContainer 
        addresses={['0xtest...', '1test...']}
        userId="test-user"
      />
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading more transactions...')).not.toBeInTheDocument();
    });

    // Check that transactions are rendered
    expect(screen.getByText('+100.0 USDT')).toBeInTheDocument();
    expect(screen.getByText('-0.001 BTC')).toBeInTheDocument();
  });

  test('handles loading state correctly', () => {
    render(
      <TransactionHistoryContainer 
        addresses={['0xtest...']}
        userId="test-user"
      />
    );

    // Should show skeleton loading initially
    expect(document.querySelector('.transaction-skeleton')).toBeInTheDocument();
  });

  test('handles error state correctly', async () => {
    server.use(
      rest.get('/v1/transactions', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
      })
    );

    render(
      <TransactionHistoryContainer 
        addresses={['0xtest...']}
        userId="test-user"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Unable to load transactions')).toBeInTheDocument();
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  test('refresh functionality works', async () => {
    render(
      <TransactionHistoryContainer 
        addresses={['0xtest...']}
        userId="test-user"
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading more transactions...')).not.toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    // Should show loading state during refresh
    expect(refreshButton).toBeDisabled();
  });

  test('transaction item expansion works', async () => {
    render(
      <TransactionHistoryContainer 
        addresses={['0xtest...']}
        userId="test-user"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('+100.0 USDT')).toBeInTheDocument();
    });

    const transactionItem = screen.getByText('+100.0 USDT').closest('.transaction-item');
    fireEvent.click(transactionItem);

    // Should show expanded details
    await waitFor(() => {
      expect(screen.getByText('Transaction Hash')).toBeInTheDocument();
      expect(screen.getByText('0x123...')).toBeInTheDocument();
    });
  });

  test('infinite scroll triggers correctly', async () => {
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null
    });
    window.IntersectionObserver = mockIntersectionObserver;

    render(
      <TransactionHistoryContainer 
        addresses={['0xtest...']}
        userId="test-user"
      />
    );

    await waitFor(() => {
      expect(mockIntersectionObserver).toHaveBeenCalled();
    });
  });
});
```

### Service Testing

```javascript
// TransactionHistoryService.test.js
import { TransactionHistoryService } from '../TransactionHistoryService';
import { WDKApiClient } from '../WDKApiClient';

jest.mock('../WDKApiClient');

describe('TransactionHistoryService', () => {
  let service;
  let mockApiClient;

  beforeEach(() => {
    mockApiClient = {
      get: jest.fn(),
      getWebSocketUrl: jest.fn().mockReturnValue('ws://localhost/live')
    };
    WDKApiClient.mockImplementation(() => mockApiClient);
    
    service = new TransactionHistoryService();
  });

  test('getTransactionHistory returns data correctly', async () => {
    const mockResponse = {
      data: {
        transactions: [
          {
            transactionHash: '0x123',
            amount: '100.0',
            token: 'usdt'
          }
        ],
        pagination: {
          hasNext: false,
          cursor: null
        },
        meta: {
          responseTime: '120ms'
        }
      }
    };

    mockApiClient.get.mockResolvedValue(mockResponse);

    const result = await service.getTransactionHistory(['0xtest...']);

    expect(mockApiClient.get).toHaveBeenCalledWith('/v1/transactions', {
      params: {
        addresses: '0xtest...',
        limit: 50
      }
    });

    expect(result.transactions).toEqual(mockResponse.data.transactions);
    expect(result.source).toBe('api');
  });

  test('getTransactionHistory handles errors correctly', async () => {
    mockApiClient.get.mockRejectedValue(new Error('Network error'));

    await expect(
      service.getTransactionHistory(['0xtest...'])
    ).rejects.toThrow('Failed to fetch transaction history');
  });

  test('caching works correctly', async () => {
    const mockResponse = {
      data: {
        transactions: [{ transactionHash: '0x123' }],
        pagination: { hasNext: false },
        meta: {}
      }
    };

    mockApiClient.get.mockResolvedValue(mockResponse);

    // First call
    await service.getTransactionHistory(['0xtest...']);
    
    // Second call should use cache
    const result = await service.getTransactionHistory(['0xtest...']);

    expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    expect(result.source).toBe('cache');
  });

  test('real-time subscription works', () => {
    const mockCallback = jest.fn();
    const unsubscribe = service.subscribeToUpdates(['0xtest...'], mockCallback);

    expect(typeof unsubscribe).toBe('function');
    
    // Cleanup
    unsubscribe();
  });
});
```

### Integration Testing

```javascript
// TransactionHistory.integration.test.js
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import TransactionHistoryContainer from '../TransactionHistoryContainer';

const server = setupServer(
  rest.get('/v1/transactions', (req, res, ctx) => {
    const cursor = req.url.searchParams.get('cursor');
    
    if (!cursor) {
      // First page
      return res(
        ctx.json({
          transactions: Array.from({ length: 50 }, (_, i) => ({
            transactionHash: `0x${i.toString().padStart(3, '0')}`,
            blockchain: 'ethereum',
            direction: i % 2 === 0 ? 'in' : 'out',
            amount: `${(i + 1) * 10}.0`,
            token: 'usdt',
            timestamp: new Date(Date.now() - i * 60000).toISOString(),
            status: 'confirmed',
            confirmations: 12,
            blockNumber: 18500000 - i
          })),
          pagination: {
            hasNext: true,
            cursor: 'page-2',
            limit: 50,
            total: 150
          }
        })
      );
    } else {
      // Second page
      return res(
        ctx.json({
          transactions: Array.from({ length: 50 }, (_, i) => ({
            transactionHash: `0x${(i + 50).toString().padStart(3, '0')}`,
            blockchain: 'ethereum',
            direction: i % 2 === 0 ? 'out' : 'in',
            amount: `${(i + 51) * 10}.0`,
            token: 'usdt',
            timestamp: new Date(Date.now() - (i + 50) * 60000).toISOString(),
            status: 'confirmed',
            confirmations: 12,
            blockNumber: 18500000 - (i + 50)
          })),
          pagination: {
            hasNext: true,
            cursor: 'page-3',
            limit: 50,
            total: 150
          }
        })
      );
    }
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Transaction History Integration', () => {
  test('complete user flow works correctly', async () => {
    // Mock IntersectionObserver
    const mockIntersectionObserver = jest.fn();
    const mockObserve = jest.fn();
    const mockUnobserve = jest.fn();
    
    mockIntersectionObserver.mockReturnValue({
      observe: mockObserve,
      unobserve: mockUnobserve,
      disconnect: jest.fn()
    });
    
    window.IntersectionObserver = mockIntersectionObserver;

    render(
      <TransactionHistoryContainer 
        addresses={['0xtest123...', '0xtest456...']}
        userId="integration-test-user"
      />
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('+10.0 USDT')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Should show 50 initial transactions
    const transactionItems = document.querySelectorAll('.transaction-item');
    expect(transactionItems).toHaveLength(50);

    // Test transaction expansion
    fireEvent.click(transactionItems[0]);
    await waitFor(() => {
      expect(screen.getByText('Transaction Hash')).toBeInTheDocument();
    });

    // Test infinite scroll (simulate intersection observer)
    const calls = mockIntersectionObserver.mock.calls;
    const callback = calls[0][0];
    
    // Simulate load more trigger
    callback([{ isIntersecting: true }]);

    // Wait for second page to load
    await waitFor(() => {
      const updatedItems = document.querySelectorAll('.transaction-item');
      expect(updatedItems.length).toBeGreaterThan(50);
    }, { timeout: 5000 });

    // Test refresh functionality
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(refreshButton).not.toBeDisabled();
    });
  });

  test('error handling and recovery', async () => {
    // Start with error
    server.use(
      rest.get('/v1/transactions', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
      })
    );

    render(
      <TransactionHistoryContainer 
        addresses={['0xtest...']}
        userId="error-test-user"
      />
    );

    // Should show error state
    await waitFor(() => {
      expect(screen.getByText('Unable to load transactions')).toBeInTheDocument();
    });

    // Restore normal behavior
    server.restoreHandlers();

    // Try refresh
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    // Should recover and show transactions
    await waitFor(() => {
      expect(screen.getByText('+10.0 USDT')).toBeInTheDocument();
    });
  });
});
```

## Mobile-Specific Examples

### React Native Implementation

```jsx
// TransactionHistoryMobile.jsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TransactionHistoryMobile({ addresses, userId }) {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    transactions,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  } = useTransactionHistory(addresses);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const renderTransaction = ({ item: transaction, index }) => (
    <TransactionItemMobile 
      transaction={transaction}
      index={index}
    />
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No transactions yet</Text>
      <Text style={styles.emptyDescription}>
        Your transaction history will appear here
      </Text>
    </View>
  );

  if (loading && transactions.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item, index) => `${item.transactionHash}-${index}`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={transactions.length === 0 ? styles.emptyContainer : null}
      />
    </View>
  );
}

function TransactionItemMobile({ transaction, index }) {
  const [expanded, setExpanded] = useState(false);

  const formatAmount = (amount, token, direction) => {
    const formatted = parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
    const sign = direction === 'out' ? '-' : '+';
    return `${sign}${formatted} ${token.toUpperCase()}`;
  };

  const getAmountColor = (direction) => {
    switch (direction) {
      case 'in': return '#34C759';
      case 'out': return '#FF3B30';
      default: return '#007AFF';
    }
  };

  return (
    <TouchableOpacity 
      style={styles.transactionItem}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.transactionIcon}>
          <View style={[
            styles.directionIndicator,
            { backgroundColor: getAmountColor(transaction.direction) }
          ]}>
            <Text style={styles.directionText}>
              {transaction.direction === 'in' ? '↓' : '↑'}
            </Text>
          </View>
        </View>
        
        <View style={styles.transactionDetails}>
          <View style={styles.transactionRow}>
            <Text 
              style={[
                styles.amount,
                { color: getAmountColor(transaction.direction) }
              ]}
            >
              {formatAmount(transaction.amount, transaction.token, transaction.direction)}
            </Text>
            <Text style={styles.timestamp}>
              {formatRelativeTime(transaction.timestamp)}
            </Text>
          </View>
          
          <View style={styles.transactionMeta}>
            <Text style={styles.counterparty} numberOfLines={1}>
              {transaction.direction === 'in' 
                ? `From ${shortenAddress(transaction.from)}`
                : `To ${shortenAddress(transaction.to)}`
              }
            </Text>
            <TransactionStatusMobile transaction={transaction} />
          </View>
        </View>
      </View>
      
      {expanded && (
        <TransactionDetailsMobile transaction={transaction} />
      )}
    </TouchableOpacity>
  );
}

function TransactionStatusMobile({ transaction }) {
  const getStatusConfig = (tx) => {
    if (tx.status === 'pending') {
      return { color: '#FF9500', text: 'Pending' };
    }
    if (tx.status === 'confirmed') {
      return { color: '#34C759', text: 'Confirmed' };
    }
    return { color: '#FF3B30', text: 'Failed' };
  };

  const config = getStatusConfig(transaction);
  
  return (
    <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
      <Text style={styles.statusText}>{config.text}</Text>
    </View>
  );
}

function TransactionDetailsMobile({ transaction }) {
  const copyToClipboard = (text) => {
    // Implement clipboard functionality
    // Clipboard.setString(text);
  };

  return (
    <View style={styles.expandedDetails}>
      <DetailRow 
        label="Hash"
        value={transaction.transactionHash}
        onPress={() => copyToClipboard(transaction.transactionHash)}
      />
      <DetailRow 
        label="Block"
        value={transaction.blockNumber.toString()}
      />
      <DetailRow 
        label="Network"
        value={transaction.blockchain}
      />
      {transaction.fee && (
        <DetailRow 
          label="Fee"
          value={`${transaction.fee} ${getNativeToken(transaction.blockchain)}`}
        />
      )}
    </View>
  );
}

function DetailRow({ label, value, onPress }) {
  return (
    <TouchableOpacity 
      style={styles.detailRow}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={1}>
        {value}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93'
  },
  emptyContainer: {
    flex: 1
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8
  },
  emptyDescription: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center'
  },
  transactionItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  transactionIcon: {
    marginRight: 12
  },
  directionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  directionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  transactionDetails: {
    flex: 1
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4
  },
  amount: {
    fontSize: 18,
    fontWeight: '600'
  },
  timestamp: {
    fontSize: 14,
    color: '#8E8E93'
  },
  transactionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  counterparty: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
    marginRight: 8
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  expandedDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA'
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500'
  },
  detailValue: {
    fontSize: 14,
    color: '#1C1C1E',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16
  },
  footer: {
    padding: 20,
    alignItems: 'center'
  },
  footerText: {
    marginTop: 8,
    fontSize: 14,
    color: '#8E8E93'
  }
});

// Utility functions
function formatRelativeTime(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function shortenAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getNativeToken(blockchain) {
  const tokens = {
    bitcoin: 'BTC',
    ethereum: 'ETH',
    solana: 'SOL',
    ton: 'TON',
    tron: 'TRX'
  };
  return tokens[blockchain] || blockchain.toUpperCase();
}

export default TransactionHistoryMobile;
```

## Advanced Use Cases

### Multi-Wallet Transaction Aggregation

```javascript
// MultiWalletTransactionService.js
class MultiWalletTransactionService {
  constructor() {
    this.walletServices = new Map();
    this.aggregationCache = new Map();
  }

  addWallet(walletId, addresses, config = {}) {
    this.walletServices.set(walletId, {
      addresses,
      service: new TransactionHistoryService(config),
      enabled: true
    });
  }

  removeWallet(walletId) {
    const wallet = this.walletServices.get(walletId);
    if (wallet) {
      wallet.service.disconnect?.();
      this.walletServices.delete(walletId);
    }
  }

  async getAggregatedHistory(options = {}) {
    const enabledWallets = Array.from(this.walletServices.entries())
      .filter(([_, wallet]) => wallet.enabled);

    const promises = enabledWallets.map(([walletId, wallet]) =>
      this.getWalletTransactions(walletId, wallet, options)
    );

    const results = await Promise.allSettled(promises);
    
    const allTransactions = results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value.transactions.map(tx => ({
        ...tx,
        walletId: result.value.walletId
      })));

    // Sort by timestamp
    allTransactions.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    return {
      transactions: allTransactions,
      walletResults: results.map((result, index) => ({
        walletId: enabledWallets[index][0],
        status: result.status,
        error: result.reason?.message
      }))
    };
  }

  async getWalletTransactions(walletId, wallet, options) {
    try {
      const result = await wallet.service.getTransactionHistory(
        wallet.addresses,
        options
      );
      
      return {
        walletId,
        ...result
      };
    } catch (error) {
      throw new Error(`Wallet ${walletId}: ${error.message}`);
    }
  }

  async getPortfolioSummary() {
    const history = await this.getAggregatedHistory({ limit: 1000 });
    
    const summary = {
      totalTransactions: history.transactions.length,
      byChain: {},
      byToken: {},
      byDirection: { in: 0, out: 0, self: 0 },
      recentActivity: this.calculateRecentActivity(history.transactions)
    };

    history.transactions.forEach(tx => {
      // By chain
      summary.byChain[tx.blockchain] = (summary.byChain[tx.blockchain] || 0) + 1;
      
      // By token
      summary.byToken[tx.token] = (summary.byToken[tx.token] || 0) + 1;
      
      // By direction
      summary.byDirection[tx.direction]++;
    });

    return summary;
  }

  calculateRecentActivity(transactions) {
    const now = new Date();
    const periods = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    };

    const activity = {};
    
    Object.entries(periods).forEach(([period, duration]) => {
      const cutoff = new Date(now - duration);
      activity[period] = transactions.filter(tx => 
        new Date(tx.timestamp) > cutoff
      ).length;
    });

    return activity;
  }
}

export default MultiWalletTransactionService;
```

### Transaction Analytics and Insights

```javascript
// TransactionAnalytics.js
class TransactionAnalytics {
  constructor(transactionService) {
    this.transactionService = transactionService;
  }

  async generateInsights(addresses, timeframe = '30d') {
    const transactions = await this.getAllTransactionsInTimeframe(
      addresses, 
      timeframe
    );

    return {
      summary: this.generateSummary(transactions),
      patterns: this.analyzePatterns(transactions),
      recommendations: this.generateRecommendations(transactions),
      charts: this.generateChartData(transactions)
    };
  }

  generateSummary(transactions) {
    const incoming = transactions.filter(tx => tx.direction === 'in');
    const outgoing = transactions.filter(tx => tx.direction === 'out');

    return {
      totalTransactions: transactions.length,
      totalIncoming: incoming.length,
      totalOutgoing: outgoing.length,
      uniqueTokens: new Set(transactions.map(tx => tx.token)).size,
      averageAmount: this.calculateAverageAmount(transactions),
      largestTransaction: this.findLargestTransaction(transactions),
      mostActiveDay: this.findMostActiveDay(transactions)
    };
  }

  analyzePatterns(transactions) {
    return {
      timePatterns: this.analyzeTimePatterns(transactions),
      amountPatterns: this.analyzeAmountPatterns(transactions),
      tokenPatterns: this.analyzeTokenPatterns(transactions),
      counterpartyPatterns: this.analyzeCounterpartyPatterns(transactions)
    };
  }

  analyzeTimePatterns(transactions) {
    const hourlyActivity = Array(24).fill(0);
    const dailyActivity = Array(7).fill(0);
    
    transactions.forEach(tx => {
      const date = new Date(tx.timestamp);
      hourlyActivity[date.getHours()]++;
      dailyActivity[date.getDay()]++;
    });

    return {
      mostActiveHour: hourlyActivity.indexOf(Math.max(...hourlyActivity)),
      mostActiveDay: dailyActivity.indexOf(Math.max(...dailyActivity)),
      hourlyDistribution: hourlyActivity,
      dailyDistribution: dailyActivity
    };
  }

  analyzeAmountPatterns(transactions) {
    const amounts = transactions.map(tx => parseFloat(tx.amount));
    amounts.sort((a, b) => a - b);

    return {
      median: amounts[Math.floor(amounts.length / 2)],
      percentile90: amounts[Math.floor(amounts.length * 0.9)],
      percentile10: amounts[Math.floor(amounts.length * 0.1)],
      distribution: this.createAmountDistribution(amounts)
    };
  }

  generateRecommendations(transactions) {
    const recommendations = [];

    // High frequency trading detection
    const recentTransactions = transactions.filter(tx => {
      const age = Date.now() - new Date(tx.timestamp);
      return age < 24 * 60 * 60 * 1000; // Last 24 hours
    });

    if (recentTransactions.length > 10) {
      recommendations.push({
        type: 'efficiency',
        title: 'Consider batch transactions',
        description: 'You made many transactions recently. Batching could save on fees.',
        priority: 'medium'
      });
    }

    // Unused tokens detection
    const tokenActivity = this.analyzeTokenActivity(transactions);
    const inactiveTokens = Object.entries(tokenActivity)
      .filter(([token, data]) => data.lastActivity > 30) // 30 days
      .map(([token]) => token);

    if (inactiveTokens.length > 0) {
      recommendations.push({
        type: 'portfolio',
        title: 'Inactive tokens detected',
        description: `${inactiveTokens.length} tokens haven't been used recently`,
        priority: 'low'
      });
    }

    return recommendations;
  }

  generateChartData(transactions) {
    return {
      transactionVolume: this.generateVolumeChart(transactions),
      tokenDistribution: this.generateTokenChart(transactions),
      directionFlow: this.generateFlowChart(transactions),
      timeline: this.generateTimelineChart(transactions)
    };
  }

  generateVolumeChart(transactions) {
    const dailyVolume = {};
    
    transactions.forEach(tx => {
      const date = new Date(tx.timestamp).toDateString();
      if (!dailyVolume[date]) {
        dailyVolume[date] = { in: 0, out: 0 };
      }
      
      const amount = parseFloat(tx.amount);
      if (tx.direction === 'in') {
        dailyVolume[date].in += amount;
      } else if (tx.direction === 'out') {
        dailyVolume[date].out += amount;
      }
    });

    return Object.entries(dailyVolume).map(([date, volume]) => ({
      date,
      incoming: volume.in,
      outgoing: volume.out,
      net: volume.in - volume.out
    }));
  }

  // Additional utility methods...
  calculateAverageAmount(transactions) {
    const total = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    return total / transactions.length;
  }

  findLargestTransaction(transactions) {
    return transactions.reduce((largest, tx) => {
      const amount = parseFloat(tx.amount);
      const largestAmount = parseFloat(largest?.amount || 0);
      return amount > largestAmount ? tx : largest;
    }, null);
  }

  findMostActiveDay(transactions) {
    const dayCount = {};
    
    transactions.forEach(tx => {
      const date = new Date(tx.timestamp).toDateString();
      dayCount[date] = (dayCount[date] || 0) + 1;
    });

    return Object.entries(dayCount).reduce((most, [date, count]) => {
      return count > (most?.count || 0) ? { date, count } : most;
    }, null);
  }
}

export default TransactionAnalytics;
```

---

> **Note**: These examples provide production-ready implementations that you can adapt to your specific needs. For additional patterns and use cases, refer to the [UI Patterns guide](transaction-history-ui-patterns.md) and [Integration documentation](transaction-history.md). 