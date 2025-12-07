"use client";

import { io, Socket } from 'socket.io-client';

// Finnhub WebSocket for real-time stock data
const FINNHUB_WS_URL = 'wss://ws.finnhub.io';

export interface RealTimeQuote {
  symbol: string;
  price: number;
  timestamp: number;
  volume?: number;
  conditions?: string[];
}

export interface WebSocketCallbacks {
  onMessage: (data: RealTimeQuote[]) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

class FinnhubWebSocket {
  private ws: WebSocket | null = null;
  private apiKey: string = '';
  private subscribedSymbols: Set<string> = new Set();
  private callbacks: WebSocketCallbacks | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;
  private messageBuffer: RealTimeQuote[] = [];
  private bufferTimeout: NodeJS.Timeout | null = null;

  constructor() {
    // Default API key - users should provide their own
    this.apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || 'd4qj8f1r01quli1cvg6gd4qj8f1r01quli1cvg70';
  }

  connect(callbacks: WebSocketCallbacks): void {
    if (typeof window === 'undefined') return;
    
    this.callbacks = callbacks;
    
    try {
      this.ws = new WebSocket(`${FINNHUB_WS_URL}?token=${this.apiKey}`);
      
      this.ws.onopen = () => {
        console.log('🔌 Finnhub WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Re-subscribe to all symbols
        this.subscribedSymbols.forEach(symbol => {
          this.sendSubscribe(symbol);
        });
        
        callbacks.onConnect?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'trade' && data.data) {
            const quotes: RealTimeQuote[] = data.data.map((trade: any) => ({
              symbol: trade.s,
              price: trade.p,
              timestamp: trade.t,
              volume: trade.v,
              conditions: trade.c,
            }));
            
            // Buffer messages to reduce re-renders
            this.messageBuffer.push(...quotes);
            
            if (!this.bufferTimeout) {
              this.bufferTimeout = setTimeout(() => {
                if (this.messageBuffer.length > 0) {
                  callbacks.onMessage([...this.messageBuffer]);
                  this.messageBuffer = [];
                }
                this.bufferTimeout = null;
              }, 100); // Flush every 100ms
            }
          }
        } catch (err) {
          console.error('WebSocket message parse error:', err);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 Finnhub WebSocket disconnected');
        this.isConnected = false;
        callbacks.onDisconnect?.();
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        // Check if market might be closed (weekends or outside trading hours)
        const now = new Date();
        const day = now.getUTCDay(); // 0 = Sunday, 6 = Saturday
        const hour = now.getUTCHours();
        const isWeekend = day === 0 || day === 6;
        const isMarketHours = hour >= 14 && hour <= 21; // ~9:30 AM - 4 PM EST in UTC
        
        let errorMsg = 'WebSocket connection failed.';
        if (isWeekend) {
          errorMsg = 'US markets are closed (weekend). Real-time data available Mon-Fri.';
        } else if (!isMarketHours) {
          errorMsg = 'US markets are closed. Real-time data available during trading hours.';
        } else {
          errorMsg = 'WebSocket error. Check your connection or API key.';
        }
        
        console.warn('WebSocket error:', errorMsg);
        callbacks.onError?.(new Error(errorMsg));
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      callbacks.onError?.(error as Error);
    }
  }

  private sendSubscribe(symbol: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', symbol }));
    }
  }

  private sendUnsubscribe(symbol: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    }
  }

  subscribe(symbols: string[]): void {
    symbols.forEach(symbol => {
      const upperSymbol = symbol.toUpperCase();
      if (!this.subscribedSymbols.has(upperSymbol)) {
        this.subscribedSymbols.add(upperSymbol);
        this.sendSubscribe(upperSymbol);
      }
    });
  }

  unsubscribe(symbols: string[]): void {
    symbols.forEach(symbol => {
      const upperSymbol = symbol.toUpperCase();
      if (this.subscribedSymbols.has(upperSymbol)) {
        this.subscribedSymbols.delete(upperSymbol);
        this.sendUnsubscribe(upperSymbol);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`Attempting reconnect in ${delay}ms...`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      if (this.callbacks) {
        this.connect(this.callbacks);
      }
    }, delay);
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.bufferTimeout) {
      clearTimeout(this.bufferTimeout);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribedSymbols.clear();
    this.isConnected = false;
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getSubscribedSymbols(): string[] {
    return Array.from(this.subscribedSymbols);
  }
}

// Singleton instance
export const finnhubWebSocket = new FinnhubWebSocket();

// Custom hook for using WebSocket in components
import { useState, useEffect, useCallback } from 'react';

export const useRealTimeData = (symbols: string[]) => {
  const [quotes, setQuotes] = useState<Map<string, RealTimeQuote>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (symbols.length === 0) return;

    finnhubWebSocket.connect({
      onMessage: (data) => {
        setQuotes(prev => {
          const newMap = new Map(prev);
          data.forEach(quote => {
            newMap.set(quote.symbol, quote);
          });
          return newMap;
        });
      },
      onConnect: () => setIsConnected(true),
      onDisconnect: () => setIsConnected(false),
      onError: (err) => setError(err),
    });

    finnhubWebSocket.subscribe(symbols);

    return () => {
      finnhubWebSocket.unsubscribe(symbols);
    };
  }, [symbols.join(',')]);

  const getQuote = useCallback((symbol: string) => {
    return quotes.get(symbol.toUpperCase());
  }, [quotes]);

  return { quotes, isConnected, error, getQuote };
};
