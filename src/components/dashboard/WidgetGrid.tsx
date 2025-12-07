import React, { useState, useCallback, useRef } from "react";
import { Widget } from "@/types";
import { StockChartWidget } from "@/components/widgets/StockChartWidget";
import { StockCardWidget } from "@/components/widgets/StockCardWidget";
import { StockTableWidget } from "@/components/widgets/StockTableWidget";
import { APIDataWidget } from "@/components/widgets/APIDataWidget";
import { EnhancedTableWidget } from "@/components/widgets/EnhancedTableWidget";
import { FinanceCardsWidget } from "@/components/widgets/FinanceCardsWidget";
import { EnhancedChartWidget } from "@/components/widgets/EnhancedChartWidget";
import { RealTimeStockWidget } from "@/components/widgets/RealTimeStockWidget";
import styles from "./WidgetGrid.module.css";

interface WidgetGridProps {
  widgets: Widget[];
  isEditMode: boolean;
  selectedWidgetId?: string | null;
  onUpdateWidget: (widget: Widget) => void;
  onRemoveWidget: (widgetId: string) => void;
  onRearrange: (widgets: Widget[]) => void;
  onEditWidget?: (widget: Widget) => void;
  onSelectWidget?: (widgetId: string | null) => void;
}

// Min/max size constraints
const MIN_WIDTH = 280;
const MIN_HEIGHT = 200;
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 800;

export const WidgetGrid: React.FC<WidgetGridProps> = ({
  widgets,
  isEditMode,
  selectedWidgetId,
  onUpdateWidget,
  onRemoveWidget,
  onRearrange,
  onEditWidget,
  onSelectWidget,
}) => {
  // Drag and drop state
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dragOverWidget, setDragOverWidget] = useState<string | null>(null);

  // Resize state
  const [resizingWidget, setResizingWidget] = useState<string | null>(null);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const resizeStartRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // Drag handlers
  const handleDragStart = useCallback(
    (e: React.DragEvent, widgetId: string) => {
      if (!isEditMode) return;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", widgetId);
      setDraggedWidget(widgetId);
      // Add visual feedback - capture element reference before setTimeout
      const target = e.currentTarget as HTMLElement;
      if (target) {
        setTimeout(() => {
          target.classList.add(styles.dragging);
        }, 0);
      }
    },
    [isEditMode]
  );

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDraggedWidget(null);
    setDragOverWidget(null);
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.classList.remove(styles.dragging);
    }
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, widgetId: string) => {
      if (!isEditMode || !draggedWidget || draggedWidget === widgetId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverWidget(widgetId);
    },
    [isEditMode, draggedWidget]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverWidget(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetWidgetId: string) => {
      e.preventDefault();
      const sourceWidgetId = e.dataTransfer.getData("text/plain");

      if (!sourceWidgetId || sourceWidgetId === targetWidgetId) {
        setDragOverWidget(null);
        return;
      }

      // Reorder widgets
      const sourceIndex = widgets.findIndex((w) => w.id === sourceWidgetId);
      const targetIndex = widgets.findIndex((w) => w.id === targetWidgetId);

      if (sourceIndex === -1 || targetIndex === -1) return;

      const newWidgets = [...widgets];
      const [movedWidget] = newWidgets.splice(sourceIndex, 1);
      newWidgets.splice(targetIndex, 0, movedWidget);

      // Update positions
      const updatedWidgets = newWidgets.map((w, idx) => ({
        ...w,
        position: { ...w.position, order: idx },
      }));

      onRearrange(updatedWidgets);
      setDragOverWidget(null);
      setDraggedWidget(null);
    },
    [widgets, onRearrange]
  );

  // Resize handlers - only height is resizable (width is controlled by grid)
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, widgetId: string, direction: string) => {
      if (!isEditMode) return;
      e.preventDefault();
      e.stopPropagation();

      const widget = widgets.find((w) => w.id === widgetId);
      if (!widget) return;

      setResizingWidget(widgetId);
      setResizeDirection(direction);
      resizeStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: widget.size?.width || 320,
        height: widget.size?.height || 350,
      };

      // Add mouse move and up listeners to document
      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!resizeStartRef.current) return;

        const deltaY = moveEvent.clientY - resizeStartRef.current.y;

        let newHeight = resizeStartRef.current.height;

        // Only allow vertical resizing
        if (direction.includes("s")) {
          newHeight = Math.min(
            MAX_HEIGHT,
            Math.max(MIN_HEIGHT, resizeStartRef.current.height + deltaY)
          );
        }
        if (direction.includes("n")) {
          newHeight = Math.min(
            MAX_HEIGHT,
            Math.max(MIN_HEIGHT, resizeStartRef.current.height - deltaY)
          );
        }

        // Update widget height only
        const updatedWidget = {
          ...widget,
          size: { width: resizeStartRef.current.width, height: newHeight },
        };
        onUpdateWidget(updatedWidget);
      };

      const handleMouseUp = () => {
        setResizingWidget(null);
        setResizeDirection(null);
        resizeStartRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor =
        direction.includes("e") || direction.includes("w")
          ? direction.includes("n") || direction.includes("s")
            ? `${direction}-resize`
            : "ew-resize"
          : "ns-resize";
      document.body.style.userSelect = "none";
    },
    [isEditMode, widgets, onUpdateWidget]
  );

  const renderWidget = (widget: Widget) => {
    // Route based on new unified widget type
    const widgetType = widget.config.widgetType as string;
    const displayMode = widget.config.displayMode;

    // Real-time WebSocket widget
    if (
      displayMode === "realtime" ||
      widget.config.apiUrl?.startsWith("websocket:")
    ) {
      return (
        <RealTimeStockWidget
          widget={widget}
          onDelete={onRemoveWidget}
          onEdit={onEditWidget || onUpdateWidget}
        />
      );
    }

    // Chart widgets (line, bar, candle)
    if (widgetType === "chart" || displayMode === "chart") {
      return (
        <EnhancedChartWidget
          widget={widget}
          onDelete={onRemoveWidget}
          onEdit={onEditWidget || onUpdateWidget}
        />
      );
    }

    if (widgetType === "custom-api" || widget.config.apiUrl) {
      return (
        <APIDataWidget
          widget={widget}
          onDelete={onRemoveWidget}
          onEdit={onEditWidget || onUpdateWidget}
        />
      );
    }

    if (widgetType === "table") {
      return (
        <EnhancedTableWidget
          widget={widget}
          onDelete={onRemoveWidget}
          onEdit={onEditWidget || onUpdateWidget}
        />
      );
    }

    if (widgetType === "finance-cards") {
      return (
        <FinanceCardsWidget
          widget={widget}
          onDelete={onRemoveWidget}
          onEdit={onEditWidget || onUpdateWidget}
        />
      );
    }

    // Legacy widget routing (backward compatibility)
    switch (widget.type) {
      case "stock-table":
        return <StockTableWidget widget={widget} onUpdate={onUpdateWidget} />;
      case "stock-card":
        return <StockCardWidget widget={widget} onUpdate={onUpdateWidget} />;
      case "line-chart":
      case "candle-chart":
        return <StockChartWidget widget={widget} onUpdate={onUpdateWidget} />;
      default:
        return (
          <div className={styles.placeholder}>Unsupported widget type</div>
        );
    }
  };

  return (
    <div className={styles.grid}>
      {widgets.map((widget) => {
        const customHeight = widget.size?.height;
        const colSpan = widget.size?.colSpan || 1;
        const hasCustomSize = customHeight || colSpan > 1;

        // Helper to cycle column span
        const cycleColSpan = () => {
          const newSpan = colSpan >= 3 ? 1 : ((colSpan + 1) as 1 | 2 | 3);
          onUpdateWidget({
            ...widget,
            size: { ...widget.size, colSpan: newSpan },
          });
        };

        const isSelected = selectedWidgetId === widget.id;

        return (
          <div
            key={widget.id}
            className={`${styles.gridItem} ${
              isEditMode ? styles.editable : ""
            } ${draggedWidget === widget.id ? styles.dragging : ""} ${
              dragOverWidget === widget.id ? styles.dragOver : ""
            } ${resizingWidget === widget.id ? styles.resizing : ""} ${
              hasCustomSize ? styles.customSize : ""
            } ${colSpan === 2 ? styles.colSpan2 : ""} ${
              colSpan === 3 ? styles.colSpan3 : ""
            } ${isSelected && isEditMode ? styles.selected : ""}`}
            style={
              customHeight
                ? {
                    height: `${customHeight}px`,
                    minHeight: `${customHeight}px`,
                  }
                : undefined
            }
            draggable={isEditMode && !resizingWidget}
            onClick={(e) => {
              // Select widget when clicked in edit mode
              if (isEditMode && onSelectWidget) {
                e.stopPropagation();
                onSelectWidget(widget.id);
              }
            }}
            onDragStart={(e) => handleDragStart(e, widget.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, widget.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, widget.id)}
          >
            <div className={styles.widgetWrapper}>
              {isEditMode && (
                <>
                  <div className={styles.actions}>
                    <button
                      className={styles.widthBtn}
                      onClick={cycleColSpan}
                      title={`Width: ${colSpan} column${
                        colSpan > 1 ? "s" : ""
                      } (click to change)`}
                    >
                      {colSpan === 1 ? "▭" : colSpan === 2 ? "▭▭" : "▭▭▭"}
                    </button>
                    <span className={styles.dragHandle} title="Drag to reorder">
                      ⠿
                    </span>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => onRemoveWidget(widget.id)}
                      title="Delete widget"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Resize handle - only bottom for height adjustment */}
                  <div
                    className={`${styles.resizeHandle} ${styles.resizeS}`}
                    onMouseDown={(e) => handleResizeStart(e, widget.id, "s")}
                    title="Drag to resize height"
                  />
                </>
              )}
              {renderWidget(widget)}
            </div>
          </div>
        );
      })}

      {widgets.length === 0 && (
        <div className={styles.empty}>
          <p>No widgets yet. Add your first widget to get started!</p>
        </div>
      )}
    </div>
  );
};
