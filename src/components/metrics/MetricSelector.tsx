import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MetricInfo, MetricType } from "@/types/telemetry";

interface MetricSelectorProps {
  metrics: MetricInfo[];
  selectedMetric: string | null;
  onMetricChange: (metricName: string, type: MetricType) => void;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

const timeRanges = [
  { value: "1h", label: "Last Hour" },
  { value: "6h", label: "Last 6 Hours" },
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "custom", label: "Custom Range" },
];

export function MetricSelector({
  metrics,
  selectedMetric,
  onMetricChange,
  timeRange,
  onTimeRangeChange,
}: MetricSelectorProps) {
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  useEffect(() => {
    setShowCustomRange(timeRange === "custom");
  }, [timeRange]);

  const handleMetricSelect = (metricName: string) => {
    const metric = metrics.find((m) => m.name === metricName);
    if (metric) {
      onMetricChange(metric.name, metric.type);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Metric Selector */}
        <div className="space-y-2">
          <Label>Metric</Label>
          <Select
            value={selectedMetric || ""}
            onValueChange={handleMetricSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a metric..." />
            </SelectTrigger>
            <SelectContent>
              {metrics.length === 0 ? (
                <SelectItem value="none" disabled>
                  No metrics available
                </SelectItem>
              ) : (
                metrics.map((metric) => (
                  <SelectItem key={metric.name} value={metric.name}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{metric.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({metric.type})
                      </span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {selectedMetric && (
            <div className="text-xs text-muted-foreground">
              {metrics.find((m) => m.name === selectedMetric)?.description ||
                "No description"}
            </div>
          )}
        </div>

        {/* Time Range Selector */}
        <div className="space-y-2">
          <Label>Time Range</Label>
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select time range..." />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Custom Date Range */}
      {showCustomRange && (
        <div className="grid gap-4 md:grid-cols-2 p-4 border rounded-lg bg-muted/30">
          <div className="space-y-2">
            <Label>From</Label>
            <div className="flex gap-2">
              <Input
                type="datetime-local"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>To</Label>
            <div className="flex gap-2">
              <Input
                type="datetime-local"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <Button
              onClick={() => {
                if (customFrom && customTo) {
                  // Trigger refetch with custom dates
                  onTimeRangeChange(`custom:${customFrom}:${customTo}`);
                }
              }}
              disabled={!customFrom || !customTo}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Apply Custom Range
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
