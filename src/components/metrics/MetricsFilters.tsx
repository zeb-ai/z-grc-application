import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MetricFilters } from "@/types/telemetry";

interface MetricsFiltersProps {
  filters: MetricFilters;
  onFiltersChange: (filters: MetricFilters) => void;
  services?: string[];
}

export function MetricsFilters({
  filters,
  onFiltersChange,
  services = [],
}: MetricsFiltersProps) {
  const hasActiveFilters =
    filters.user_id ||
    filters.group_id ||
    filters.service;

  const clearFilters = () => {
    onFiltersChange({
      metric_name: filters.metric_name,
      type: filters.type,
      from: filters.from,
      to: filters.to,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* User ID Filter */}
        <Input
          type="text"
          placeholder="User ID..."
          value={filters.user_id || ""}
          onChange={(e) =>
            onFiltersChange({ ...filters, user_id: e.target.value })
          }
          className="w-[200px]"
        />

        {/* Group ID Filter */}
        <Input
          type="text"
          placeholder="Group ID..."
          value={filters.group_id || ""}
          onChange={(e) =>
            onFiltersChange({ ...filters, group_id: e.target.value })
          }
          className="w-[200px]"
        />

        {/* Service Filter */}
        <Select
          value={filters.service || "all"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              service: value === "all" ? undefined : value,
            })
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Services" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            {services.map((service) => (
              <SelectItem key={service} value={service}>
                {service}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}