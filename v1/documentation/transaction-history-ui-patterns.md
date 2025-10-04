---
title: Transaction History UI Patterns
description: Complete UI/UX patterns, React components, and design guidelines for implementing transaction history in wallet applications.
lastReviewed: 2024-01-15
---

# Transaction History UI Patterns

## Overview

This guide provides comprehensive UI/UX patterns, React components, and design guidelines for implementing transaction history in wallet applications. It covers everything from basic transaction items to advanced features like infinite scroll and real-time updates.

**Target Audience**: Frontend developers, UI/UX designers
**Prerequisites**: React knowledge, understanding of transaction history concepts
**Related Documentation**: [Transaction History Integration](transaction-history.md) | [Code Examples](transaction-history-examples.md)

## Table of Contents

1. [Design Principles](#design-principles)
2. [Core Components](#core-components)
3. [Advanced Patterns](#advanced-patterns)
4. [Responsive Design](#responsive-design)
5. [Accessibility](#accessibility)
6. [Performance Patterns](#performance-patterns)

---

## Design Principles

### User-Centric Information Hierarchy

```typescript
interface TransactionDisplayPriority {
  primary: ['amount', 'direction', 'token'];
  secondary: ['timestamp', 'status', 'counterparty'];
  tertiary: ['fee', 'confirmations', 'fiatValue'];
  metadata: ['hash', 'blockNumber', 'gasUsed'];
}
```

### Visual Status Communication

```css
.transaction-item {
  --color-incoming: #10b981;     /* Green */
  --color-outgoing: #ef4444;     /* Red */
  --color-self: #6366f1;         /* Indigo */
  --color-pending: #f59e0b;      /* Amber */
  --color-failed: #ef4444;       /* Red */
  --color-confirmed: #10b981;    /* Green */
}
```

### Interaction Patterns

- **Tap/Click**: View transaction details
- **Long Press**: Context menu (copy, share, export)
- **Swipe**: Quick actions (mark, categorize)
- **Pull-to-Refresh**: Sync latest transactions

## Core Components

### Transaction Item Component

```jsx
import React from 'react';
import { formatDistanceToNow } from 'date-fns';

function TransactionItem({ transaction, onSelect, onAction }) {
  const formatAmount = (amount, token, direction) => {
    const formatted = parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
    const sign = direction === 'out' ? '-' : '+';
    return `${sign}${formatted} ${token.toUpperCase()}`;
  };

  const getDirectionIcon = (direction) => {
    const icons = {
      'in': '↓',
      'out': '↑', 
      'self': '⟲'
    };
    return icons[direction] || '→';
  };

  const getStatusBadge = (status, confirmations) => {
    switch (status) {
      case 'pending':
        return (
          <div className="status-badge status-pending">
            <span className="spinner" />
            <span>Pending</span>
          </div>
        );
      case 'confirmed':
        return (
          <div className="status-badge status-confirmed">
            <span>✓</span>
            <span>{confirmations} confirmations</span>
          </div>
        );
      case 'failed':
        return (
          <div className="status-badge status-failed">
            <span>✕</span>
            <span>Failed</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={`transaction-item direction-${transaction.direction} status-${transaction.status}`}
      onClick={() => onSelect(transaction)}
    >
      <div className="transaction-icon">
        <div className="direction-indicator">
          {getDirectionIcon(transaction.direction)}
        </div>
        <TokenLogo token={transaction.token} size="md" />
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
          {getStatusBadge(transaction.status, transaction.confirmations)}
        </div>
        
        {transaction.fiatValue && (
          <div className="fiat-value">
            ${parseFloat(transaction.fiatValue).toFixed(2)} USD
          </div>
        )}
      </div>
      
      <div className="transaction-actions">
        <button 
          className="action-btn"
          onClick={(e) => {
            e.stopPropagation();
            onAction('details', transaction);
          }}
        >
          <MoreIcon />
        </button>
      </div>
    </div>
  );
}
```

### Transaction List with Virtual Scrolling

```jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';

function VirtualTransactionList({ 
  transactions, 
  onLoadMore, 
  hasMore, 
  loading 
}) {
  const listRef = useRef();
  const [containerHeight, setContainerHeight] = useState(600);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups = [];
    let currentDate = null;
    
    transactions.forEach(tx => {
      const txDate = new Date(tx.timestamp).toDateString();
      
      if (txDate !== currentDate) {
        groups.push({
          type: 'date-header',
          date: txDate,
          id: `header-${txDate}`
        });
        currentDate = txDate;
      }
      
      groups.push({
        type: 'transaction',
        transaction: tx,
        id: tx.transactionHash
      });
    });
    
    return groups;
  }, [transactions]);

  const ItemRenderer = ({ index, style }) => {
    const item = groupedTransactions[index];
    
    // Load more when near end
    if (index === groupedTransactions.length - 10 && hasMore && !loading) {
      onLoadMore();
    }
    
    return (
      <div style={style}>
        {item.type === 'date-header' ? (
          <DateHeader date={item.date} />
        ) : (
          <TransactionItem transaction={item.transaction} />
        )}
      </div>
    );
  };

  return (
    <div className="virtual-transaction-list">
      <List
        ref={listRef}
        height={containerHeight}
        itemCount={groupedTransactions.length}
        itemSize={80}
        overscanCount={5}
      >
        {ItemRenderer}
      </List>
      
      {loading && (
        <div className="loading-indicator">
          <Spinner />
          <span>Loading more transactions...</span>
        </div>
      )}
    </div>
  );
}
```

### Transaction Status Component

```jsx
function TransactionStatus({ transaction }) {
  const getStatusConfig = (tx) => {
    const requiredConfirmations = getRequiredConfirmations(tx.blockchain);
    
    if (tx.status === 'pending') {
      const progress = Math.min(tx.confirmations / requiredConfirmations, 1);
      return {
        type: 'pending',
        color: 'orange',
        icon: 'clock',
        text: `${tx.confirmations}/${requiredConfirmations} confirmations`,
        progress
      };
    }
    
    if (tx.status === 'confirmed') {
      return {
        type: 'confirmed',
        color: 'green',
        icon: 'check-circle',
        text: `Confirmed (${tx.confirmations})`
      };
    }
    
    return {
      type: 'failed',
      color: 'red',
      icon: 'x-circle',
      text: 'Transaction failed'
    };
  };

  const config = getStatusConfig(transaction);
  
  return (
    <div className={`transaction-status status-${config.type}`}>
      <Icon name={config.icon} className={`text-${config.color}-500`} />
      <span className="status-text">{config.text}</span>
      
      {config.progress !== undefined && (
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${config.progress * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

function getRequiredConfirmations(blockchain) {
  const confirmations = {
    bitcoin: 6,
    ethereum: 12,
    solana: 32,
    ton: 5,
    tron: 19
  };
  return confirmations[blockchain] || 6;
}
```

### Transaction Grouping

```jsx
function TransactionGroup({ transactions, grouped = true }) {
  if (!grouped) {
    return (
      <div className="transaction-list">
        {transactions.map((tx, index) => (
          <TransactionItem key={`${tx.transactionHash}-${index}`} transaction={tx} />
        ))}
      </div>
    );
  }

  // Group by transaction hash (multiple transfers in one transaction)
  const groupedTxs = transactions.reduce((groups, tx) => {
    const key = tx.transactionHash;
    groups[key] = groups[key] || [];
    groups[key].push(tx);
    return groups;
  }, {});

  return (
    <div className="transaction-groups">
      {Object.entries(groupedTxs).map(([hash, txs]) => (
        <TransactionGroupItem key={hash} transactions={txs} />
      ))}
    </div>
  );
}

function TransactionGroupItem({ transactions }) {
  const [expanded, setExpanded] = useState(false);
  const mainTransaction = transactions[0];
  const hasMultiple = transactions.length > 1;

  return (
    <div className="transaction-group">
      <div className="group-header">
        <div className="timestamp">
          {formatTimestamp(mainTransaction.timestamp)}
        </div>
        <div className="hash">
          {shortenHash(mainTransaction.transactionHash)}
        </div>
        {hasMultiple && (
          <button 
            className="expand-button"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Collapse' : `Show ${transactions.length} transfers`}
          </button>
        )}
      </div>
      
      <div className="group-content">
        {expanded || !hasMultiple ? (
          transactions.map((tx, index) => (
            <TransactionItem key={index} transaction={tx} />
          ))
        ) : (
          <TransactionSummary transactions={transactions} />
        )}
      </div>
    </div>
  );
}
```

### Filtering and Search Interface

```jsx
function TransactionFilters({ onFiltersChange, availableTokens }) {
  const [filters, setFilters] = useState({
    tokens: [],
    direction: 'all',
    status: 'all',
    dateRange: { start: null, end: null },
    amountRange: { min: '', max: '' },
    searchQuery: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <div className="transaction-filters">
      {/* Quick Filters */}
      <div className="quick-filters">
        <SearchInput
          value={filters.searchQuery}
          onChange={(searchQuery) => 
            handleFilterChange({ ...filters, searchQuery })
          }
          placeholder="Search transactions..."
        />
        
        <FilterChip
          label="Direction"
          value={filters.direction}
          options={[
            { value: 'all', label: 'All' },
            { value: 'in', label: 'Received' },
            { value: 'out', label: 'Sent' },
            { value: 'self', label: 'Self' }
          ]}
          onChange={(direction) => 
            handleFilterChange({ ...filters, direction })
          }
        />
        
        <FilterChip
          label="Status"
          value={filters.status}
          options={[
            { value: 'all', label: 'All' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'pending', label: 'Pending' },
            { value: 'failed', label: 'Failed' }
          ]}
          onChange={(status) => 
            handleFilterChange({ ...filters, status })
          }
        />
      </div>

      {/* Token Selection */}
      <TokenSelector
        selectedTokens={filters.tokens}
        availableTokens={availableTokens}
        onChange={(tokens) => 
          handleFilterChange({ ...filters, tokens })
        }
      />

      {/* Advanced Filters */}
      <div className="advanced-toggle">
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-blue-600"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        </button>
      </div>

      {showAdvanced && (
        <div className="advanced-filters">
          <DateRangePicker
            value={filters.dateRange}
            onChange={(dateRange) => 
              handleFilterChange({ ...filters, dateRange })
            }
          />
          
          <AmountRangeInput
            value={filters.amountRange}
            onChange={(amountRange) => 
              handleFilterChange({ ...filters, amountRange })
            }
          />
        </div>
      )}
    </div>
  );
}
```

## Advanced Patterns

### Infinite Scroll Implementation

```jsx
import { useInView } from 'react-intersection-observer';

function useInfiniteTransactions(addresses, filters) {
  const [state, setState] = useState({
    transactions: [],
    loading: false,
    hasMore: true,
    cursor: null,
    error: null
  });

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px'
  });

  const loadMore = useCallback(async () => {
    if (state.loading || !state.hasMore) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await getTransactionHistory({
        addresses,
        cursor: state.cursor,
        limit: 50,
        ...filters
      });

      setState(prev => ({
        transactions: [...prev.transactions, ...response.transactions],
        loading: false,
        hasMore: response.pagination.hasNext,
        cursor: response.pagination.cursor,
        error: null
      }));

    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error }));
    }
  }, [addresses, filters, state.cursor, state.loading, state.hasMore]);

  // Load more when intersection observer triggers
  useEffect(() => {
    if (inView && state.hasMore && !state.loading) {
      loadMore();
    }
  }, [inView, loadMore, state.hasMore, state.loading]);

  // Reset when filters change
  useEffect(() => {
    setState({
      transactions: [],
      loading: false,
      hasMore: true,
      cursor: null,
      error: null
    });
  }, [addresses, filters]);

  return {
    ...state,
    loadMoreRef,
    loadMore
  };
}
```

### Pull-to-Refresh Pattern

```jsx
import { usePullToRefresh } from 'use-pull-to-refresh';

function RefreshableTransactionList({ children, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const { pullPosition, startPull, endPull } = usePullToRefresh({
    onRefresh: handleRefresh,
    maximumPullLength: 100,
    refreshThreshold: 60
  });

  return (
    <div 
      className="refreshable-container"
      onTouchStart={startPull}
      onTouchEnd={endPull}
    >
      <div 
        className="refresh-indicator"
        style={{
          transform: `translateY(${Math.max(0, pullPosition - 60)}px)`,
          opacity: pullPosition > 30 ? 1 : 0
        }}
      >
        {refreshing ? <Spinner /> : <RefreshIcon />}
        <span>
          {refreshing ? 'Refreshing...' : 
           pullPosition > 60 ? 'Release to refresh' : 'Pull to refresh'}
        </span>
      </div>
      
      <div 
        className="content"
        style={{ transform: `translateY(${Math.max(0, pullPosition)}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
```

### Real-Time Updates with Animations

```jsx
function AnimatedTransactionList({ transactions, newTransactions = [] }) {
  const [animatingItems, setAnimatingItems] = useState(new Set());

  useEffect(() => {
    if (newTransactions.length > 0) {
      // Animate new transactions
      const newHashes = new Set(newTransactions.map(tx => tx.transactionHash));
      setAnimatingItems(newHashes);
      
      // Remove animation after delay
      setTimeout(() => {
        setAnimatingItems(new Set());
      }, 2000);
    }
  }, [newTransactions]);

  return (
    <div className="animated-transaction-list">
      {transactions.map((transaction, index) => (
        <CSSTransition
          key={transaction.transactionHash}
          in={!animatingItems.has(transaction.transactionHash)}
          timeout={300}
          classNames="transaction"
        >
          <div 
            className={`transaction-wrapper ${
              animatingItems.has(transaction.transactionHash) ? 'new-transaction' : ''
            }`}
          >
            <TransactionItem transaction={transaction} />
          </div>
        </CSSTransition>
      ))}
    </div>
  );
}
```

### Context Menu and Quick Actions

```jsx
function TransactionWithContextMenu({ transaction }) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleLongPress = () => {
    // For mobile long press
    setShowContextMenu(true);
  };

  const actions = [
    {
      label: 'Copy Hash',
      icon: 'copy',
      action: () => navigator.clipboard.writeText(transaction.transactionHash)
    },
    {
      label: 'View on Explorer',
      icon: 'external-link',
      action: () => window.open(getExplorerUrl(transaction))
    },
    {
      label: 'Export Details',
      icon: 'download',
      action: () => exportTransaction(transaction)
    },
    {
      label: 'Add Note',
      icon: 'note',
      action: () => openNoteDialog(transaction)
    }
  ];

  return (
    <>
      <div 
        onContextMenu={handleContextMenu}
        onTouchStart={handleLongPress}
        className="transaction-with-menu"
      >
        <TransactionItem transaction={transaction} />
      </div>
      
      {showContextMenu && (
        <ContextMenu
          position={menuPosition}
          actions={actions}
          onClose={() => setShowContextMenu(false)}
        />
      )}
    </>
  );
}
```

## Responsive Design

### Mobile-First Layout

```css
.transaction-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  min-height: 80px;
}

.transaction-icon {
  display: flex;
  align-items: center;
  margin-right: 12px;
  position: relative;
}

.direction-indicator {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--background-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.transaction-details {
  flex: 1;
  min-width: 0; /* Allow text truncation */
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}

.amount {
  font-weight: 600;
  font-size: 16px;
}

.timestamp {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
}

/* Tablet and desktop adjustments */
@media (min-width: 768px) {
  .transaction-item {
    padding: 16px 24px;
  }
  
  .transaction-details {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 16px;
    align-items: center;
  }
  
  .transaction-meta {
    display: flex;
    gap: 16px;
    align-items: center;
  }
}

/* Large screens */
@media (min-width: 1024px) {
  .transaction-list {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .transaction-item:hover {
    background-color: var(--hover-background);
  }
}
```

### Adaptive Loading States

```jsx
function AdaptiveLoadingState({ loading, error, empty }) {
  if (loading) {
    return (
      <div className="loading-state">
        <div className="skeleton-items">
          {Array.from({ length: 5 }).map((_, i) => (
            <TransactionSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <ErrorIcon className="error-icon" />
        <h3>Unable to load transactions</h3>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="empty-state">
        <EmptyWalletIcon className="empty-icon" />
        <h3>No transactions yet</h3>
        <p>Your transaction history will appear here</p>
      </div>
    );
  }

  return null;
}

function TransactionSkeleton() {
  return (
    <div className="transaction-skeleton">
      <div className="skeleton-icon" />
      <div className="skeleton-content">
        <div className="skeleton-line skeleton-amount" />
        <div className="skeleton-line skeleton-meta" />
      </div>
      <div className="skeleton-timestamp" />
    </div>
  );
}
```

## Accessibility

### Screen Reader Support

```jsx
function AccessibleTransactionItem({ transaction }) {
  const announceText = `
    ${transaction.direction === 'in' ? 'Received' : 'Sent'} 
    ${transaction.amount} ${transaction.token.toUpperCase()}
    ${transaction.direction === 'in' ? 'from' : 'to'} 
    ${shortenAddress(transaction.direction === 'in' ? transaction.from : transaction.to)}
    on ${formatTimestamp(transaction.timestamp)}
    Status: ${transaction.status}
  `.trim();

  return (
    <div 
      className="transaction-item"
      role="listitem"
      tabIndex={0}
      aria-label={announceText}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(transaction);
        }
      }}
    >
      <div className="transaction-icon" aria-hidden="true">
        <TokenLogo token={transaction.token} />
      </div>
      
      <div className="transaction-details">
        <div className="transaction-header">
          <span className="amount" aria-label={`Amount: ${transaction.amount} ${transaction.token}`}>
            {formatAmount(transaction.amount, transaction.token, transaction.direction)}
          </span>
          <time 
            dateTime={transaction.timestamp}
            aria-label={`Date: ${formatTimestamp(transaction.timestamp)}`}
          >
            {formatRelativeTime(transaction.timestamp)}
          </time>
        </div>
      </div>
      
      <TransactionStatus 
        transaction={transaction}
        aria-label={`Status: ${transaction.status}`}
      />
    </div>
  );
}
```

### Keyboard Navigation

```jsx
function KeyboardNavigableTransactionList({ transactions, onSelect }) {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const itemRefs = useRef([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => 
            Math.min(prev + 1, transactions.length - 1)
          );
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(prev - 1, 0));
          break;
          
        case 'Enter':
        case ' ':
          if (focusedIndex >= 0) {
            e.preventDefault();
            onSelect(transactions[focusedIndex]);
          }
          break;
          
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;
          
        case 'End':
          e.preventDefault();
          setFocusedIndex(transactions.length - 1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [transactions, focusedIndex, onSelect]);

  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex].focus();
    }
  }, [focusedIndex]);

  return (
    <div 
      className="transaction-list"
      role="list"
      aria-label="Transaction history"
    >
      {transactions.map((transaction, index) => (
        <div
          key={transaction.transactionHash}
          ref={el => itemRefs.current[index] = el}
          className={`transaction-item ${
            index === focusedIndex ? 'focused' : ''
          }`}
          role="listitem"
          tabIndex={index === focusedIndex ? 0 : -1}
          onClick={() => onSelect(transaction)}
        >
          <AccessibleTransactionItem transaction={transaction} />
        </div>
      ))}
    </div>
  );
}
```

## Performance Patterns

### Memoization and Optimization

```jsx
import React, { memo, useMemo } from 'react';

const TransactionItem = memo(({ transaction, onSelect }) => {
  const formattedAmount = useMemo(() => 
    formatAmount(transaction.amount, transaction.token, transaction.direction),
    [transaction.amount, transaction.token, transaction.direction]
  );

  const relativeTime = useMemo(() =>
    formatRelativeTime(transaction.timestamp),
    [transaction.timestamp]
  );

  return (
    <div className="transaction-item" onClick={() => onSelect(transaction)}>
      {/* Component content */}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-rendering
  return (
    prevProps.transaction.transactionHash === nextProps.transaction.transactionHash &&
    prevProps.transaction.status === nextProps.transaction.status &&
    prevProps.transaction.confirmations === nextProps.transaction.confirmations
  );
});
```

### Image and Asset Optimization

```jsx
function OptimizedTokenLogo({ token, size = 'md' }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  if (imageFailed) {
    return (
      <div className={`token-logo-fallback ${sizeClasses[size]}`}>
        {token.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`token-logo ${sizeClasses[size]}`}>
      {!imageLoaded && (
        <div className="token-logo-skeleton" />
      )}
      <img
        src={`/tokens/${token.toLowerCase()}.png`}
        alt={`${token} logo`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageFailed(true)}
        style={{ display: imageLoaded ? 'block' : 'none' }}
      />
    </div>
  );
}
```

---

## CSS Styles

```css
/* Transaction List Styles */
.transaction-list {
  background: var(--background-color);
  border-radius: 8px;
  overflow: hidden;
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.transaction-item:hover {
  background-color: var(--hover-background);
}

.transaction-item:last-child {
  border-bottom: none;
}

/* Direction-based styling */
.transaction-item.direction-in .amount {
  color: var(--color-incoming);
}

.transaction-item.direction-out .amount {
  color: var(--color-outgoing);
}

.transaction-item.direction-self .amount {
  color: var(--color-self);
}

/* Status-based styling */
.transaction-item.status-pending {
  opacity: 0.7;
}

.transaction-item.status-failed {
  opacity: 0.5;
}

/* Loading states */
.skeleton-items {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.transaction-skeleton {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--background-color);
}

.skeleton-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--skeleton-color);
  margin-right: 12px;
  animation: skeleton-pulse 2s ease-in-out infinite;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 16px;
  background: var(--skeleton-color);
  border-radius: 4px;
  animation: skeleton-pulse 2s ease-in-out infinite;
}

.skeleton-amount {
  width: 120px;
}

.skeleton-meta {
  width: 80px;
}

.skeleton-timestamp {
  width: 60px;
  height: 14px;
  background: var(--skeleton-color);
  border-radius: 4px;
  animation: skeleton-pulse 2s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.6;
  }
}

/* Animation for new transactions */
.new-transaction {
  animation: slideInDown 0.5s ease-out;
  background-color: var(--accent-color-light);
}

@keyframes slideInDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Accessibility */
.transaction-item:focus {
  outline: 2px solid var(--focus-color);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .transaction-item,
  .new-transaction {
    animation: none;
    transition: none;
  }
}
```

---

> **Next Steps**: Implement these patterns in your application and refer to [Complete Code Examples](transaction-history-examples.md) for full working implementations. 