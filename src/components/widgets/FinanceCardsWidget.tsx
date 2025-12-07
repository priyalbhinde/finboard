"use client";

import React from "react";
import { Widget } from "@/types";

interface FinanceCardsWidgetProps {
  widget: Widget;
  onUpdate?: (widget: Widget) => void;
  onDelete?: (widgetId: string) => void;
  onEdit?: (widget: Widget) => void;
}

export const FinanceCardsWidget: React.FC<FinanceCardsWidgetProps> = ({
  widget,
  onEdit,
}) => {
  const config = widget.config;
  const cardType = (config.cardType as string) || "watchlist";
  const cardsPerRow = (config.cardsPerRow as number) || 4;

  // Sample data - in production would come from API
  const cards = [
    { id: 1, name: "Apple Inc.", symbol: "AAPL", value: 178.45, change: 2.5 },
    { id: 2, name: "Google LLC", symbol: "GOOGL", value: 142.8, change: -1.2 },
    {
      id: 3,
      name: "Microsoft Corp",
      symbol: "MSFT",
      value: 412.35,
      change: 3.1,
    },
    { id: 4, name: "Tesla Inc.", symbol: "TSLA", value: 248.92, change: 5.2 },
  ];

  return (
    <div style={{ padding: "16px", height: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: "700",
            color: "var(--text-color)",
          }}
        >
          {widget.title}
        </h3>
        {onEdit && (
          <button
            onClick={() => onEdit(widget)}
            style={{
              padding: "8px 12px",
              background: "var(--primary)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            ⚙️ Edit
          </button>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.max(1, cardsPerRow)}, 1fr)`,
          gap: "12px",
        }}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            style={{
              padding: "16px",
              background: "var(--surface-secondary)",
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface-hover)";
              e.currentTarget.style.borderColor = "var(--primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--surface-secondary)";
              e.currentTarget.style.borderColor = "var(--border-color)";
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "8px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    marginBottom: "4px",
                  }}
                >
                  {card.symbol}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "var(--text-color)",
                  }}
                >
                  {card.name}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "var(--primary)",
                }}
              >
                ${card.value.toFixed(2)}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: card.change >= 0 ? "#10b981" : "#ef4444",
                }}
              >
                {card.change >= 0 ? "▲" : "▼"} {Math.abs(card.change)}%
              </div>
            </div>

            <div
              style={{
                fontSize: "11px",
                color: "var(--text-tertiary)",
                marginTop: "8px",
              }}
            >
              {cardType === "watchlist" && "📌 In Watchlist"}
              {cardType === "gainers" && "🚀 Top Gainer"}
              {cardType === "losers" && "📉 Top Loser"}
              {cardType === "performance" && "📊 Performance"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
