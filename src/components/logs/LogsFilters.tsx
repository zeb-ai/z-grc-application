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
import type { LogFilters, LogSeverity } from "@/types/telemetry";

interface LogsFiltersProps {
  filters: LogFilters;
  onFiltersChange: (filters: LogFilters) => void;
  services?: string[];
}

const severities: (LogSeverity | "ALL")[] = [
  "ALL",
  "FATAL",
  "ERROR",
  "WARN",
  "INFO",
  "DEBUG",
  "TRACE",
];

export function LogsFilters({
  filters,
  onFiltersChange,
  services = [],
}: LogsFiltersProps) {
  const hasActiveFilters =
    filters.user_id ||
    filters.group_id ||
    filters.service ||
    filters.search ||
    (filters.severity && filters.severity !== "ALL");

  const clearFilters = () => {
    onFiltersChange({
      severity: "ALL",
      limit: filters.limit,
      offset: 0,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Filter */}
        <div className="flex-1 min-w-[250px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search log body..."
              value={filters.search || ""}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value, offset: 0 })
              }
              className="pl-9"
            />
          </div>
        </div>

        {/* Severity Filter */}
        <Select
          value={filters.severity || "ALL"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              severity: value as LogSeverity | "ALL",
              offset: 0,
            })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Severities" />
          </SelectTrigger>
          <SelectContent>
            {severities.map((severity) => (
              <SelectItem key={severity} value={severity}>
                {severity}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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

        {/* User ID Filter */}
        <Input
          type="text"
          placeholder="User ID..."
          value={filters.user_id || ""}
          onChange={(e) =>
            onFiltersChange({ ...filters, user_id: e.target.value, offset: 0 })
          }
          className="w-[180px]"
        />

        {/* Group ID Filter */}
        <Input
          type="text"
          placeholder="Group ID..."
          value={filters.group_id || ""}
          onChange={(e) =>
            onFiltersChange({ ...filters, group_id: e.target.value, offset: 0 })
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