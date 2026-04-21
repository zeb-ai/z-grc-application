import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MetricDataPoint, HistogramDataPoint, MetricType } from "@/types/telemetry";

interface MetricChartProps {
  metricName: string;
  type: MetricType;
  dataPoints: MetricDataPoint[] | HistogramDataPoint[];
  loading?: boolean;
}

export function MetricChart({
  metricName,
  type,
  dataPoints,
  loading,
}: MetricChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!dataPoints || dataPoints.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{metricName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            No data available for the selected time range
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data for recharts
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "MMM dd HH:mm");
    } catch {
      return timestamp;
    }
  };

  if (type === "histogram") {
    const histogramData = dataPoints as HistogramDataPoint[];

    // For histogram, we'll show count over time
    const chartData = histogramData.map((point) => ({
      timestamp: formatTimestamp(point.timestamp),
      count: point.count,
      sum: point.sum,
      avg: point.count > 0 ? point.sum / point.count : 0,
    }));

    return (
      <Card>
        <CardHeader>
          <CardTitle>{metricName} (Histogram)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Count" />
              <Bar dataKey="avg" fill="#82ca9d" name="Average" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  // For gauge and sum metrics
  const metricData = dataPoints as MetricDataPoint[];
  const chartData = metricData.map((point) => ({
    timestamp: formatTimestamp(point.timestamp),
    value: Number(point.value),
  }));

  // Calculate statistics
  const values = chartData.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const avgValue = values.reduce((a, b) => a + b, 0) / values.length;

  // Determine chart type based on metric type
  const isCounter = type === "sum";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{metricName}</span>
          <span className="text-sm font-normal text-muted-foreground capitalize">
            {type}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          {isCounter ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  border: "none",
                  borderRadius: "4px",
                  color: "#fff",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#colorValue)"
                name="Value"
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  border: "none",
                  borderRadius: "4px",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                strokeWidth={3}
                dot={{ r: 5, fill: "#8884d8" }}
                activeDot={{ r: 7, fill: "#4f46e5" }}
                name="Value"
              />
            </LineChart>
          )}
        </ResponsiveContainer>

        {/* Data Summary */}
        <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Data Points</div>
            <div className="font-semibold text-lg">{chartData.length}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Average</div>
            <div className="font-semibold text-lg">
              {avgValue.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Min</div>
            <div className="font-semibold text-lg">
              {minValue.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Max</div>
            <div className="font-semibold text-lg">
              {maxValue.toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}