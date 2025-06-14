"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeProvider";
import CustomThemeCreator from "./CustomThemeCreator";
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import Button from "./ui/Button";
import {
  PaintBrushIcon,
  SunIcon,
  MoonIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  SpeakerWaveIcon,
  CursorArrowRaysIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function ThemeAccessibilitySettings() {
  const {
    currentTheme,
    predefinedThemes,
    customThemes,
    accessibilitySettings,
    saveTheme,
    updateAccessibilitySettings,
    exportTheme,
    importTheme,
    deleteCustomTheme,
  } = useTheme();

  const [activeTab, setActiveTab] = useState("themes");
  const [showCustomCreator, setShowCustomCreator] = useState(false);

  const allThemes = { ...predefinedThemes, ...customThemes };

  const handleAccessibilityChange = (setting, value) => {
    updateAccessibilitySettings({
      ...accessibilitySettings,
      [setting]: value,
    });
  };

  const handleImportTheme = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        await importTheme(file);
        // Reset file input
        event.target.value = "";
      } catch (error) {
        console.error("Failed to import theme:", error);
        alert("Failed to import theme. Please check the file format.");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-theme-text mb-2">
          Theme & Accessibility
        </h1>
        <p className="text-theme-text-secondary">
          Customize your visual experience and accessibility preferences
        </p>
      </div>
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-theme-secondary rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab("themes")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === "themes"
              ? "bg-theme-primary text-white shadow-md"
              : "text-theme-text-secondary hover:text-theme-text"
          }`}
        >
          <PaintBrushIcon className="h-4 w-4 inline mr-2" />
          Themes
        </button>
        <button
          onClick={() => setActiveTab("accessibility")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === "accessibility"
              ? "bg-theme-primary text-white shadow-md"
              : "text-theme-text-secondary hover:text-theme-text"
          }`}
        >
          <EyeIcon className="h-4 w-4 inline mr-2" />
          Accessibility
        </button>
      </div>
      <AnimatePresence mode="wait">
        {activeTab === "themes" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Theme Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Theme</CardTitle>
                <CardDescription>
                  Select from predefined themes or create your own custom theme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {Object.entries(allThemes).map(([themeId, theme]) => (
                    <motion.div
                      key={themeId}
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        currentTheme === themeId
                          ? "border-theme-primary shadow-lg"
                          : "border-theme-border hover:border-theme-primary-50"
                      }`}
                      onClick={() => saveTheme(themeId)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Theme Preview */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex space-x-1">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: theme.primary }}
                          />
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: theme.background }}
                          />
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: theme.secondary }}
                          />
                        </div>
                        <span className="font-medium text-theme-text">
                          {theme.name}
                        </span>
                      </div>

                      {/* Current theme indicator */}
                      {currentTheme === themeId && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2"
                        >
                          <CheckIcon className="h-5 w-5 text-theme-primary" />
                        </motion.div>
                      )}

                      {/* Custom theme actions */}
                      {customThemes[themeId] && (
                        <div className="flex space-x-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              exportTheme(themeId);
                            }}
                          >
                            <ArrowUpTrayIcon className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Delete this custom theme?")) {
                                deleteCustomTheme(themeId);
                              }
                            }}
                          >
                            <TrashIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Theme Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => setShowCustomCreator(true)}
                    className="bg-theme-primary hover:bg-theme-primary-dark text-white"
                  >
                    <PaintBrushIcon className="h-4 w-4 mr-2" />
                    Create Custom Theme
                  </Button>

                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportTheme}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Button variant="outline">
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Import Theme
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "accessibility" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Visual Accessibility */}
            <Card>
              <CardHeader>
                <CardTitle>Visual Accessibility</CardTitle>
                <CardDescription>
                  Adjust visual settings for better accessibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* High Contrast */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-theme-text">
                      High Contrast Mode
                    </h4>
                    <p className="text-sm text-theme-text-secondary">
                      Increase contrast for better visibility
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleAccessibilityChange(
                        "highContrast",
                        !accessibilitySettings.highContrast
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      accessibilitySettings.highContrast
                        ? "bg-theme-primary"
                        : "bg-theme-border"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        accessibilitySettings.highContrast
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Font Size */}
                <div>
                  <h4 className="font-medium text-theme-text mb-3">
                    Font Size
                  </h4>
                  <div className="flex space-x-2">
                    {["small", "medium", "large", "xl"].map((size) => (
                      <button
                        key={size}
                        onClick={() =>
                          handleAccessibilityChange("fontSize", size)
                        }
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          accessibilitySettings.fontSize === size
                            ? "bg-theme-primary text-white"
                            : "bg-theme-secondary text-theme-text hover:bg-theme-primary hover:text-white"
                        }`}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Focus Indicators */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-theme-text">
                      Enhanced Focus Indicators
                    </h4>
                    <p className="text-sm text-theme-text-secondary">
                      Show clear focus indicators for keyboard navigation
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleAccessibilityChange(
                        "focusIndicators",
                        !accessibilitySettings.focusIndicators
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      accessibilitySettings.focusIndicators
                        ? "bg-theme-primary"
                        : "bg-theme-border"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        accessibilitySettings.focusIndicators
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Reduced Motion */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-theme-text">
                      Reduced Motion
                    </h4>
                    <p className="text-sm text-theme-text-secondary">
                      Minimize animations and transitions
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleAccessibilityChange(
                        "reducedMotion",
                        !accessibilitySettings.reducedMotion
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      accessibilitySettings.reducedMotion
                        ? "bg-theme-primary"
                        : "bg-theme-border"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        accessibilitySettings.reducedMotion
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Motor Accessibility */}
            <Card>
              <CardHeader>
                <CardTitle>Motor Accessibility</CardTitle>
                <CardDescription>
                  Settings to improve motor accessibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Larger Click Targets */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-theme-text">
                      Larger Click Targets
                    </h4>
                    <p className="text-sm text-theme-text-secondary">
                      Make buttons and links easier to click
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleAccessibilityChange(
                        "largerClickTargets",
                        !accessibilitySettings.largerClickTargets
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      accessibilitySettings.largerClickTargets
                        ? "bg-theme-primary"
                        : "bg-theme-border"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        accessibilitySettings.largerClickTargets
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Sticky Focus */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-theme-text">
                      Sticky Focus
                    </h4>
                    <p className="text-sm text-theme-text-secondary">
                      Keep focus visible longer for easier navigation
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleAccessibilityChange(
                        "stickyFocus",
                        !accessibilitySettings.stickyFocus
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      accessibilitySettings.stickyFocus
                        ? "bg-theme-primary"
                        : "bg-theme-border"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        accessibilitySettings.stickyFocus
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Voice Navigation */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-theme-text">
                      Voice Navigation Support
                    </h4>
                    <p className="text-sm text-theme-text-secondary">
                      Enable voice commands for navigation
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleAccessibilityChange(
                        "voiceNavigation",
                        !accessibilitySettings.voiceNavigation
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      accessibilitySettings.voiceNavigation
                        ? "bg-theme-primary"
                        : "bg-theme-border"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        accessibilitySettings.voiceNavigation
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Audio Features */}
            <Card>
              <CardHeader>
                <CardTitle>Audio Features</CardTitle>
                <CardDescription>
                  Audio feedback and accessibility options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-theme-text">
                      Sound Effects
                    </h4>
                    <p className="text-sm text-theme-text-secondary">
                      Play sounds for UI interactions and feedback
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleAccessibilityChange(
                        "soundEffects",
                        !accessibilitySettings.soundEffects
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      accessibilitySettings.soundEffects
                        ? "bg-theme-primary"
                        : "bg-theme-border"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        accessibilitySettings.soundEffects
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>{" "}
      {/* Custom Theme Creator Modal */}
      <AnimatePresence>
        {showCustomCreator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCustomCreator(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-theme-background border border-theme-border rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <CustomThemeCreator
                  onClose={() => setShowCustomCreator(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}{" "}
      </AnimatePresence>
    </div>
  );
}
