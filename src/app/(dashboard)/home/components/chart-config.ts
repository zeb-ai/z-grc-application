// Professional Chart.js configuration inspired by Datadog
import type { ChartOptions } from "chart.js";

export const chartTheme = {
  light: {
    primary: "rgba(99, 102, 241, 1)", // indigo-500
    success: "rgba(34, 197, 94, 1)", // green-500
    warning: "rgba(245, 158, 11, 1)", // yellow-500
    danger: "rgba(239, 68, 68, 1)", // red-500
    info: "rgba(59, 130, 246, 1)", // blue-500
    grid: "rgba(229, 231, 235, 1)", // gray-200
    text: "rgba(17, 24, 39, 1)", // gray-900
    background: "rgba(255, 255, 255, 1)",
  },
  dark: {
    primary: "rgba(129, 140, 248, 1)", // indigo-400
    success: "rgba(74, 222, 128, 1)", // green-400
    warning: "rgba(251, 191, 36, 1)", // yellow-400
    danger: "rgba(248, 113, 113, 1)", // red-400
    info: "rgba(96, 165, 250, 1)", // blue-400
    grid: "rgba(55, 65, 81, 1)", // gray-700
    text: "rgba(243, 244, 246, 1)", // gray-100
    background: "rgba(17, 24, 39, 1)",
  },
};

export function getChartTheme() {
  if (typeof window === "undefined") return chartTheme.light;
  const isDark = document.documentElement.classList.contains("dark");
  return isDark ? chartTheme.dark : chartTheme.light;
}

export const baseChartOptions: ChartOptions<any> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "index",
    intersect: false,
  },
  plugins: {
    legend: {
      display: true,
      position: "top",
      align: "end",
      labels: {
        boxWidth: 12,
        boxHeight: 12,
        padding: 15,
        font: {
          size: 11,
          family: "'Inter', 'system-ui', sans-serif",
          weight: "500",
        },
        usePointStyle: true,
        pointStyle: "circle",
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: "rgba(17, 24, 39, 0.95)",
      titleColor: "rgba(243, 244, 246, 1)",
      bodyColor: "rgba(209, 213, 219, 1)",
      borderColor: "rgba(75, 85, 99, 0.5)",
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      titleFont: {
        size: 12,
        weight: "600",
      },
      bodyFont: {
        size: 11,
      },
      displayColors: true,
      boxWidth: 10,
      boxHeight: 10,
      usePointStyle: true,
    },
  },
};

export const lineChartOptions: ChartOptions<"line"> = {
  ...baseChartOptions,
  scales: {
    x: {
      grid: {
        display: true,
        drawTicks: false,
        color: "rgba(229, 231, 235, 0.5)",
      },
      ticks: {
        font: {
          size: 10,
          family: "'Inter', 'system-ui', sans-serif",
        },
        padding: 8,
      },
      border: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        drawTicks: false,
        color: "rgba(229, 231, 235, 0.5)",
      },
      ticks: {
        font: {
          size: 10,
          family: "'Inter', 'system-ui', sans-serif",
        },
        padding: 8,
      },
      border: {
        display: false,
      },
    },
  },
};

export const areaChartOptions: ChartOptions<"line"> = {
  ...lineChartOptions,
  elements: {
    line: {
      tension: 0.4,
      fill: true,
    },
    point: {
      radius: 0,
      hitRadius: 10,
      hoverRadius: 5,
    },
  },
};

export const barChartOptions: ChartOptions<"bar"> = {
  ...baseChartOptions,
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 10,
          family: "'Inter', 'system-ui', sans-serif",
        },
        padding: 8,
      },
      border: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        drawTicks: false,
        color: "rgba(229, 231, 235, 0.5)",
      },
      ticks: {
        font: {
          size: 10,
          family: "'Inter', 'system-ui', sans-serif",
        },
        padding: 8,
      },
      border: {
        display: false,
      },
    },
  },
};

export const doughnutChartOptions: ChartOptions<"doughnut"> = {
  ...baseChartOptions,
  cutout: "70%",
  plugins: {
    ...baseChartOptions.plugins,
    legend: {
      ...baseChartOptions.plugins?.legend,
      position: "right",
    },
  },
};