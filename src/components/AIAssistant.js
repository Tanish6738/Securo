"use client";

import { useState, useRef, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  ChartBarIcon,
  XMarkIcon,
  TableCellsIcon,
  ClockIcon,
  ArrowPathIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon, 
  Target,
  Info
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  Label,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area,
  AreaChart,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from "./ui/Card";

const COLORS = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#F59E0B", // Yellow/Amber
  "#10B981", // Green
  "#8B5CF6", // Purple
  "#F97316", // Orange
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#6366F1", // Indigo
];

// Chart configuration for Shadcn UI charts
const createChartConfig = (data) => {
  const config = {
    // Default configuration for radar charts
    desktop: {
      label: "Value",
      color: "#3B82F6",
    },
  };
  
  data.forEach((item, index) => {
    const key = (item.name || item.subject || `item${index}`).toLowerCase().replace(/\s+/g, "_");
    config[key] = {
      label: item.name || item.subject || `Item ${index + 1}`,
      color: COLORS[index % COLORS.length],
    };
  });
  
  return config;
};

export default function AIAssistant({ breachData, isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello! I'm your AI security analyst. I've analyzed your breach data and I'm ready to help you understand your security status. You can ask me questions like:

• "Show me a pie chart of my breaches by industry"
• "What's my biggest security risk?"
• "Create a table of all my breaches with dates and records affected"
• "When were most of my breaches discovered?"
• "Give me a timeline of my exposures"
• "Show me a radar chart of security metrics"
• "Filter breaches from 2020-2023"

🎯 **New Features:**
• **Chart Type Switching**: Click the chart type buttons to switch between pie, bar, line, radar, and area charts
• **Time Filtering**: Use time filters to focus on specific year ranges
• **Interactive Charts**: All charts are fully interactive with beautiful tooltips and legends
• **Enhanced Data Context**: Charts now include detailed legends, statistical summaries, and data insights

What would you like to know about your security data?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeChartTypes, setActiveChartTypes] = useState({}); // Track chart types for each message
  const [timeFilters, setTimeFilters] = useState({}); // Track time filters for each message
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          breachData: breachData,
          conversationHistory: messages.slice(-10), // Keep last 10 messages for context
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get AI response");
      }

      const assistantMessage = {
        role: "assistant",
        content: data.response,
        structuredData: data.structuredData,
        timestamp: data.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Assistant error:", error);
      const errorMessage = {
        role: "assistant",
        content:
          "I apologize, but I encountered an error while processing your request. Please make sure the Gemini API key is configured and try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter data based on time range
  const filterDataByTime = (data, startYear, endYear) => {
    if (!data || !Array.isArray(data)) return data;
    return data.filter(item => {
      const year = parseInt(item.name) || parseInt(item.year) || new Date().getFullYear();
      return year >= startYear && year <= endYear;
    });
  };

  // Transform data for different chart types
  const transformDataForChartType = (originalData, chartType) => {
    if (!originalData || !Array.isArray(originalData)) return originalData;
    
    switch (chartType) {
      case 'radar':
        // Transform for radar chart - ensure we have the right structure
        return originalData.map((item, index) => ({
          subject: item.name || item.subject || `Metric ${index + 1}`,
          value: Number(item.value) || 0,
        }));
      case 'area':
        // For area charts, ensure we have proper time-series data
        return originalData.map(item => ({
          ...item,
          name: item.name || item.time || item.date,
          value: item.value || 0
        }));
      default:
        return originalData;
    }
  };

  // Get available chart types for data
  const getAvailableChartTypes = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    
    const types = ['pie', 'bar', 'line'];
    
    // Add radar chart if we have multiple metrics
    if (data.length >= 3) {
      types.push('radar');
    }
    
    // Add area chart for time series data
    if (data.some(item => item.name && !isNaN(parseInt(item.name)))) {
      types.push('area');
    }
    
    return types;
  };

  // Chart controls component
  const ChartControls = ({ messageIndex, currentData, currentChartType, title }) => {
    const availableTypes = getAvailableChartTypes(currentData);
    const messageId = `message-${messageIndex}`;
    
    const handleChartTypeChange = (newType) => {
      setActiveChartTypes(prev => ({
        ...prev,
        [messageId]: newType
      }));
    };

    const handleTimeFilterChange = (startYear, endYear) => {
      setTimeFilters(prev => ({
        ...prev,
        [messageId]: { startYear, endYear }
      }));
    };

    if (availableTypes.length <= 1) return null;

    return (
      <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-lg mt-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Chart Type:</span>
          {availableTypes.map((type) => (
            <Button
              key={type}
              variant={currentChartType === type ? "default" : "outline"}
              size="sm"
              onClick={() => handleChartTypeChange(type)}
              className="h-7 text-xs"
            >
              {type === 'pie' && <PieChartIcon className="h-3 w-3 mr-1" />}
              {type === 'bar' && <BarChart3 className="h-3 w-3 mr-1" />}
              {type === 'line' && <LineChartIcon className="h-3 w-3 mr-1" />}
              {type === 'radar' && <Target className="h-3 w-3 mr-1" />}
              {type === 'area' && <Activity className="h-3 w-3 mr-1" />}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
        
        {/* Time filter for timeline data */}
        {currentData.some(item => !isNaN(parseInt(item.name))) && (
          <div className="flex items-center gap-2 ml-4">
            <CalendarIcon className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Filter:</span>
            <select
              className="text-xs border rounded px-2 py-1 bg-background"
              onChange={(e) => {
                const range = e.target.value.split('-');
                if (range.length === 2) {
                  handleTimeFilterChange(parseInt(range[0]), parseInt(range[1]));
                }
              }}
            >
              <option value="">All Years</option>
              <option value="2020-2024">2020-2024</option>
              <option value="2018-2022">2018-2022</option>
              <option value="2015-2020">2015-2020</option>
            </select>
          </div>
        )}
      </div>
    );
  };

  const renderChart = (structuredData, messageIndex = 0) => {
    if (!structuredData?.chartData) return null;

    const { chartType: originalChartType, chartData } = structuredData;
    const { title, data, description } = chartData;

    if (!data || !Array.isArray(data) || data.length === 0) return null;

    const messageId = `message-${messageIndex}`;
    const activeChartType = activeChartTypes[messageId] || originalChartType;
    const timeFilter = timeFilters[messageId];
    
    // Apply time filtering if active
    let filteredData = data;
    if (timeFilter) {
      filteredData = filterDataByTime(data, timeFilter.startYear, timeFilter.endYear);
    }
    
    // Transform data for the active chart type
    const processedData = transformDataForChartType(filteredData, activeChartType);
    const chartConfig = createChartConfig(processedData);

    // Calculate enhanced statistics for context
    const totalValue = processedData.reduce((sum, item) => sum + (item.value || 0), 0);
    const averageValue = totalValue / processedData.length;
    const maxValue = Math.max(...processedData.map(item => item.value || 0));
    const minValue = Math.min(...processedData.map(item => item.value || 0));

    // Enhanced legend component
    const renderLegend = () => (
      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Info className="h-4 w-4" />
          Data Legend & Summary
        </h4>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {processedData.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full border" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs text-muted-foreground truncate">
                {entry.name || entry.subject}: {entry.value} 
                {totalValue > 0 && `(${((entry.value / totalValue) * 100).toFixed(1)}%)`}
              </span>
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Total:</span>
            <span className="font-medium">{totalValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Average:</span>
            <span className="font-medium">{averageValue.toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span>Range:</span>
            <span className="font-medium">{minValue} - {maxValue}</span>
          </div>
          <div className="pt-1 border-t">
            <span className="text-xs">Source: Breach monitoring analysis • {processedData.length} data points</span>
          </div>
        </div>
      </div>
    );

    const renderChartContent = () => {
      switch (activeChartType) {
        case "pie":
        case "doughnut":
          return (
            <Card className="mt-4">
              <CardHeader className="items-center pb-0">
                <CardTitle className="text-sm font-medium">
                  {title || "Security Breach Distribution"}
                </CardTitle>
                {description && (
                  <p className="text-xs text-muted-foreground text-center">
                    {description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square max-h-[300px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          const percentage = ((data.value / totalValue) * 100).toFixed(1);
                          return (
                            <div className="bg-white p-3 border rounded shadow-lg">
                              <p className="font-semibold">{data.name}</p>
                              <p className="text-blue-600">{data.value} breaches ({percentage}%)</p>
                              <p className="text-xs text-gray-500">
                                {data.value > averageValue ? 'Above average' : 'Below average'}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie
                      data={processedData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={activeChartType === "doughnut" ? 60 : 0}
                      strokeWidth={5}
                      label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {processedData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                      {activeChartType === "doughnut" && (
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-3xl font-bold"
                                  >
                                    {totalValue.toLocaleString()}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground"
                                  >
                                    Total Breaches
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      )}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
              <div className="flex items-center gap-2 text-sm p-4 pt-0">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">
                  Security breach distribution analysis
                </span>
              </div>
              {renderLegend()}
            </Card>
          );

        case "bar":
          return (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {title || "Security Metrics Comparison"}
                </CardTitle>
                {description && (
                  <p className="text-xs text-muted-foreground">{description}</p>
                )}
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <BarChart
                    accessibilityLayer
                    data={processedData}
                    margin={{
                      left: 12,
                      right: 12,
                      bottom: 40,
                      top: 20
                    }}
                  >
                    <CartesianGrid vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      fontSize={11}
                      tickFormatter={(value) =>
                        value.slice(0, 12) + (value.length > 12 ? "..." : "")
                      }
                    />
                    <YAxis 
                      label={{ value: 'Number of Breaches', angle: -90, position: 'insideLeft' }}
                      fontSize={11}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          const percentage = ((data.value / totalValue) * 100).toFixed(1);
                          return (
                            <div className="bg-white p-3 border rounded shadow-lg">
                              <p className="font-semibold">{label}</p>
                              <p className="text-blue-600">{data.value} breaches</p>
                              <p className="text-xs text-gray-500">
                                {percentage}% of total • {data.value > averageValue ? 'Above' : 'Below'} average
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
              <div className="flex items-center gap-2 text-sm p-4 pt-0">
                <Activity className="h-4 w-4" />
                <span className="font-medium">Breach analysis by category</span>
              </div>
              {renderLegend()}
            </Card>
          );

        case "line":
          const trendDirection =
            processedData.length > 1 && processedData[processedData.length - 1].value > processedData[0].value;
          return (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {title || "Timeline Security Analysis"}
                </CardTitle>
                {description && (
                  <p className="text-xs text-muted-foreground">{description}</p>
                )}
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <LineChart
                    accessibilityLayer
                    data={processedData}
                    margin={{
                      left: 12,
                      right: 12,
                      top: 20,
                      bottom: 20
                    }}
                  >
                    <CartesianGrid vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={11}
                      label={{ value: 'Time Period', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                      label={{ value: 'Breach Count', angle: -90, position: 'insideLeft' }}
                      fontSize={11}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          return (
                            <div className="bg-white p-3 border rounded shadow-lg">
                              <p className="font-semibold">{label}</p>
                              <p className="text-blue-600">{data.value} breaches</p>
                              <p className="text-xs text-gray-500">
                                Trend analysis • {data.value > averageValue ? 'Peak' : 'Low'} period
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      dataKey="value"
                      type="monotone"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{
                        fill: "#3B82F6",
                        strokeWidth: 2,
                        r: 4
                      }}
                      activeDot={{
                        r: 6,
                        stroke: "#3B82F6",
                        strokeWidth: 2
                      }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
              <div className="flex items-center gap-2 text-sm p-4 pt-0">
                {trendDirection ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="font-medium">
                  {trendDirection
                    ? "Increasing trend detected"
                    : "Declining trend observed"}
                </span>
              </div>
              {renderLegend()}
            </Card>
          );

        case "radar":
          return (
            <Card className="mt-4">
              <CardHeader className="items-center pb-0">
                <CardTitle className="text-sm font-medium">
                  {title || "Multi-Dimensional Security Assessment"}
                </CardTitle>
                {description && (
                  <CardDescription className="text-xs text-muted-foreground text-center">
                    {description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square max-h-[350px]"
                >
                  <RadarChart
                    data={processedData}
                    margin={{
                      top: 20,
                      right: 80,
                      bottom: 20,
                      left: 80,
                    }}
                  >
                    <ChartTooltip
                      cursor={false}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          return (
                            <div className="bg-white p-3 border rounded shadow-lg">
                              <p className="font-semibold">{data.subject || label}</p>
                              <p className="text-blue-600">Score: {data.value}</p>
                              <p className="text-xs text-gray-500">
                                Security metric • {data.value > averageValue ? 'Above' : 'Below'} average
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <PolarAngleAxis dataKey="subject" fontSize={11} />
                    <PolarGrid stroke="#e0e0e0" />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, maxValue]} 
                      fontSize={10}
                      tickCount={5}
                    />
                    <Radar
                      dataKey="value"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{
                        r: 4,
                        fillOpacity: 1,
                      }}
                    />
                  </RadarChart>
                </ChartContainer>
              </CardContent>
              <div className="flex items-center gap-2 text-sm p-4 pt-0">
                <Target className="h-4 w-4" />
                <span className="font-medium">
                  Multi-dimensional security analysis
                </span>
              </div>
              <div className="px-4 pb-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Higher values indicate better security posture • Outer ring represents maximum score
                </p>
              </div>
              {renderLegend()}
            </Card>
          );

        case "area":
          return (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {title || "Cumulative Security Analysis"}
                </CardTitle>
                {description && (
                  <p className="text-xs text-muted-foreground">{description}</p>
                )}
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <AreaChart
                    accessibilityLayer
                    data={processedData}
                    margin={{
                      left: 12,
                      right: 12,
                      top: 20,
                      bottom: 20
                    }}
                  >
                    <CartesianGrid vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={11}
                      label={{ value: 'Time Period', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                      label={{ value: 'Cumulative Breaches', angle: -90, position: 'insideLeft' }}
                      fontSize={11}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          return (
                            <div className="bg-white p-3 border rounded shadow-lg">
                              <p className="font-semibold">{label}</p>
                              <p className="text-blue-600">{data.value} total breaches</p>
                              <p className="text-xs text-gray-500">Cumulative breach analysis</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3B82F6" 
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
              <div className="flex items-center gap-2 text-sm p-4 pt-0">
                <Activity className="h-4 w-4" />
                <span className="font-medium">
                  Cumulative trend analysis
                </span>
              </div>
              {renderLegend()}
            </Card>
          );

        default:
          return null;
      }
    };

    return (
      <div>
        {renderChartContent()}
        <ChartControls
          messageIndex={messageIndex}
          currentData={processedData}
          currentChartType={activeChartType}
          title={title}
        />
      </div>
    );
  };

  const renderTable = (structuredData) => {
    if (!structuredData?.tableData) return null;

    const { tableData } = structuredData;
    const { headers, rows, title, description } = tableData;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            {title || "Security Data Table"}
          </CardTitle>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-w-full">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-4 py-3 text-sm text-foreground break-words max-w-xs"
                      >
                        <div className="truncate" title={cell}>
                          {cell}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        <div className="flex items-center gap-2 text-sm p-4 pt-0 border-t">
          <Activity className="h-4 w-4" />
          <span className="font-medium">
            Showing {rows.length} record{rows.length !== 1 ? "s" : ""}
          </span>
        </div>
      </Card>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col bg-white dark:bg-gray-900">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <CardTitle className="flex items-center text-lg">
            <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            AI Security Analyst
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="ml-4"
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-lg break-words ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                  {/* Render Charts */}
                  {message.structuredData?.chartData && (
                    <div className="w-full overflow-hidden">
                      {renderChart(message.structuredData, index)}
                    </div>
                  )}

                  {/* Render Tables */}
                  {message.structuredData?.tableData && (
                    <div className="w-full overflow-hidden">
                      {renderTable(message.structuredData)}
                    </div>
                  )}

                  <div className="text-xs opacity-70 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Buttons */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0 bg-white dark:bg-gray-900">
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setInputMessage(
                    "Show me a pie chart of my breaches by industry"
                  )
                }
                disabled={isLoading}
                className="text-xs"
              >
                <ChartBarIcon className="h-3 w-3 mr-1" />
                Industry Chart
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setInputMessage(
                    "Create a table of all my breaches with dates and records affected"
                  )
                }
                disabled={isLoading}
                className="text-xs"
              >
                <TableCellsIcon className="h-3 w-3 mr-1" />
                Breach Table
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setInputMessage("Show me a timeline of my breach exposures")
                }
                disabled={isLoading}
                className="text-xs"
              >
                <ClockIcon className="h-3 w-3 mr-1" />
                Timeline
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setInputMessage("Show me a radar chart of security metrics")
                }
                disabled={isLoading}
                className="text-xs"
              >
                <Target className="h-3 w-3 mr-1" />
                Radar Chart
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setInputMessage(
                    "What are my biggest security risks and recommendations?"
                  )
                }
                disabled={isLoading}
                className="text-xs"
              >
                Risk Analysis
              </Button>
            </div>

            {/* Input Area */}
            <div className="flex space-x-2">
              <Input
                placeholder="Ask me about your breach data..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
