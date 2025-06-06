"use client";

import { useState, useRef, useEffect } from "react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  ChartBarIcon,
  XMarkIcon,
  TableCellsIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
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
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
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
  const config = {};
  data.forEach((item, index) => {
    const key = item.name.toLowerCase().replace(/\s+/g, "_");
    config[key] = {
      label: item.name,
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
• "Create a table of all my breached passwords"
• "When were most of my breaches discovered?"
• "Give me a timeline of my exposures"

What would you like to know about your security data?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

  const renderChart = (structuredData) => {
    if (!structuredData?.chartData) return null;

    const { chartType, chartData } = structuredData;
    const { title, data, description } = chartData;

    if (!data || !Array.isArray(data) || data.length === 0) return null;

    const chartConfig = createChartConfig(data);

    switch (chartType) {
      case "pie":
      case "doughnut":
        const totalValue = data.reduce((sum, item) => sum + item.value, 0);
        return (
          <Card className="mt-4">
            <CardHeader className="items-center pb-0">
              <CardTitle className="text-sm font-medium">
                {title || "Security Analysis"}
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
                className="mx-auto aspect-square max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={chartType === "doughnut" ? 60 : 0}
                    strokeWidth={5}
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                    {chartType === "doughnut" && (
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
                                  Total
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
          </Card>
        );

      case "bar":
        return (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {title || "Security Metrics"}
              </CardTitle>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <BarChart
                  accessibilityLayer
                  data={data}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) =>
                      value.slice(0, 10) + (value.length > 10 ? "..." : "")
                    }
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={8} />
                </BarChart>
              </ChartContainer>
            </CardContent>
            <div className="flex items-center gap-2 text-sm p-4 pt-0">
              <Activity className="h-4 w-4" />
              <span className="font-medium">Breach analysis by category</span>
            </div>
          </Card>
        );

      case "line":
        const trendDirection =
          data.length > 1 && data[data.length - 1].value > data[0].value;
        return (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {title || "Timeline Analysis"}
              </CardTitle>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <LineChart
                  accessibilityLayer
                  data={data}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 10)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />                  <Line
                    dataKey="value"
                    type="monotone"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{
                      fill: "#3B82F6",
                    }}
                    activeDot={{
                      r: 6,
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
          </Card>
        );

      default:
        return null;
    }
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
                      {renderChart(message.structuredData)}
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
          </div>{" "}
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
