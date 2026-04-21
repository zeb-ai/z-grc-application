import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TelemetryFilters as Filters } from "@/types/telemetry";

interface TelemetryFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  services?: string[];
}

export function TelemetryFilters({
  filters,
  onFiltersChange,
  services = [],
}: TelemetryFiltersProps) {
  const hasActiveFilters =
    filters.user_id ||
    filters.group_id ||
    filters.service ||
    (filters.status && filters.status !== "ALL") ||
    filters.min_duration;

  const clearFilters = () => {
    onFiltersChange({
      status: "ALL",
      limit: filters.limit,
      offset: 0,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* User ID Filter */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="User ID..."
              value={filters.user_id || ""}
              onChange={(e) =>
                onFiltersChange({ ...filters, user_id: e.target.value, offset: 0 })
              }
              className="pl-9"
            />
          </div>
        </div>

        {/* Group ID Filter */}
        <div className="flex-1 min-w-[200px]">
          <Input
            type="text"
            placeholder="Group ID..."
            value={filters.group_id || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, group_id: e.target.value, offset: 0 })
            }
          />
        </div>

        {/* Service Filter */}
        <Select
          value={filters.service || "all"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              service: value === "all" ? undefined : value,
              offset: 0,
            })
          }
        >
          <SelectTrigger className="w-[180px]">
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

        {/* Status Filter */}
        <Select
          value={filters.status || "ALL"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              status: value as "SUCCESS" | "ERROR" | "ALL",
              offset: 0,
            })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="SUCCESS">Success</SelectItem>
            <SelectItem value="ERROR">Error</SelectItem>
          </SelectContent>
        </Select>

        {/* Min Duration Filter */}
        <Input
          type="number"
          placeholder="Min duration (ms)"
          value={filters.min_duration || ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              min_duration: e.target.value
                ? Number.parseFloat(e.target.value)
                : undefined,
              offset: 0,
            })
          }
          className="w-[180px]"
        />

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}