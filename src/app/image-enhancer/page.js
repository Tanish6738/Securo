"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Download,
  Settings,
  Zap,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Eye,
  Info,
} from "lucide-react";
import {
  ImageEnhancer,
  downloadImage,
  getImageMetadata,
} from "../../lib/imageEnhancer";

export default function ImageEnhancerPage() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [processedImages, setProcessedImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enhancementSettings, setEnhancementSettings] = useState({
    scale: 2,
    method: "bicubic", // bicubic, bilinear, lanczos
    denoise: 30,
    sharpen: 25,
    brightness: 0,
    contrast: 10,
    saturation: 5,
    gamma: 1,
    highlights: 0,
    shadows: 0,
    vibrance: 10,
    edgeEnhancement: 15,
  });
  const [dragOver, setDragOver] = useState(false);
  const [previewMode, setPreviewMode] = useState("side-by-side"); // 'side-by-side', 'overlay', 'original', 'enhanced'
  const fileInputRef = useRef(null);
  const enhancerRef = useRef(null);

  // Initialize image enhancer
  if (!enhancerRef.current && typeof window !== "undefined") {
    enhancerRef.current = new ImageEnhancer();
  }

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    handleFileSelection(files);
  }, []);
  const handleFileSelection = async (files) => {
    const filePromises = files.map(async (file) => {
      const reader = new FileReader();
      const metadata = await getImageMetadata(file);

      return new Promise((resolve) => {
        reader.onload = (e) => {
          resolve({
            file,
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            metadata,
            originalDataUrl: e.target.result,
            processedDataUrl: null,
            processing: false,
            processingProgress: 0,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const newFiles = await Promise.all(filePromises);
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };
  const processImage = async (imageFile) => {
    try {
      const img = await enhancerRef.current.loadImage(
        imageFile.originalDataUrl
      );
      const processedDataUrl = await enhancerRef.current.processImage(
        img,
        enhancementSettings
      );
      return processedDataUrl;
    } catch (error) {
      console.error("Error processing image:", error);
      throw error;
    }
  };

  const handleEnhanceImages = async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);

    // Process images one by one to avoid memory issues
    const processed = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      // Update processing status
      setSelectedFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, processing: true } : f))
      );

      try {
        const processedDataUrl = await processImage(file);
        const processedImage = {
          ...file,
          processedDataUrl,
          processing: false,
        };
        processed.push(processedImage);

        // Update individual file
        setSelectedFiles((prev) =>
          prev.map((f) => (f.id === file.id ? processedImage : f))
        );
      } catch (error) {
        console.error("Error processing image:", error);
        setSelectedFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, processing: false } : f))
        );
      }
    }

    setProcessedImages(processed);
    setIsProcessing(false);

    // Log analytics
    try {
      await fetch("/api/image-enhancer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "log_enhancement",
          metadata: {
            count: processed.length,
            settings: enhancementSettings,
            timestamp: new Date().toISOString(),
          },
        }),
      });
    } catch (error) {
      console.error("Failed to log enhancement:", error);
    }
  };
  const downloadImageFile = (image) => {
    downloadImage(image.processedDataUrl, `enhanced_${image.name}`);
  };
  const downloadAllImages = () => {
    processedImages.forEach((image, index) => {
      setTimeout(() => downloadImageFile(image), index * 200);
    });
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setProcessedImages([]);
  };

  return (
    <div className="min-h-screen bg-theme-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-theme-primary/10 rounded-2xl">
              <Sparkles className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-4xl font-bold text-theme-text">
              AI Image Enhancer
            </h1>
          </div>
          <p className="text-theme-text-secondary text-lg max-w-2xl mx-auto">
            Enhance your images with advanced AI-powered algorithms. Upscale,
            denoise, sharpen, and improve image quality - all processed locally
            in your browser for maximum privacy.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Settings Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="card-theme p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-theme-primary" />
                <h2 className="text-xl font-semibold text-theme-text">
                  Enhancement Settings
                </h2>
              </div>

              <div className="space-y-6">
                {/* Preset Selection */}
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    Enhancement Presets
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        setEnhancementSettings({
                          scale: 2,
                          method: "bicubic",
                          denoise: 20,
                          sharpen: 15,
                          brightness: 5,
                          contrast: 10,
                          saturation: 5,
                          gamma: 1,
                          highlights: 0,
                          shadows: 5,
                          vibrance: 10,
                          edgeEnhancement: 10,
                        })
                      }
                      className="p-2 text-xs bg-theme-secondary hover:bg-theme-primary/20 rounded-lg transition-colors"
                    >
                      📸 Photo
                    </button>
                    <button
                      onClick={() =>
                        setEnhancementSettings({
                          scale: 4,
                          method: "bicubic",
                          denoise: 40,
                          sharpen: 30,
                          brightness: 0,
                          contrast: 15,
                          saturation: 0,
                          gamma: 1,
                          highlights: -10,
                          shadows: 10,
                          vibrance: 0,
                          edgeEnhancement: 25,
                        })
                      }
                      className="p-2 text-xs bg-theme-secondary hover:bg-theme-primary/20 rounded-lg transition-colors"
                    >
                      🎨 Artwork
                    </button>
                    <button
                      onClick={() =>
                        setEnhancementSettings({
                          scale: 1,
                          method: "lanczos",
                          denoise: 30,
                          sharpen: 20,
                          brightness: 10,
                          contrast: 20,
                          saturation: 15,
                          gamma: 0.9,
                          highlights: -5,
                          shadows: 15,
                          vibrance: 20,
                          edgeEnhancement: 15,
                        })
                      }
                      className="p-2 text-xs bg-theme-secondary hover:bg-theme-primary/20 rounded-lg transition-colors"
                    >
                      🌅 Landscape
                    </button>
                    <button
                      onClick={() =>
                        setEnhancementSettings({
                          scale: 2,
                          method: "bicubic",
                          denoise: 50,
                          sharpen: 10,
                          brightness: 5,
                          contrast: 5,
                          saturation: 10,
                          gamma: 1.1,
                          highlights: 5,
                          shadows: 0,
                          vibrance: 15,
                          edgeEnhancement: 5,
                        })
                      }
                      className="p-2 text-xs bg-theme-secondary hover:bg-theme-primary/20 rounded-lg transition-colors"
                    >
                      👤 Portrait
                    </button>
                  </div>
                </div>{" "}
                {/* Scale */}
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-3">
                    Upscale Factor:{" "}
                    <span className="text-theme-primary font-bold">
                      {enhancementSettings.scale}x
                    </span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="0.5"
                    value={enhancementSettings.scale}
                    onChange={(e) =>
                      setEnhancementSettings((prev) => ({
                        ...prev,
                        scale: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full h-3 bg-theme-secondary rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                      background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${((enhancementSettings.scale - 1) / 3) * 100}%, var(--color-secondary) ${((enhancementSettings.scale - 1) / 3) * 100}%, var(--color-secondary) 100%)`,
                    }}
                  />
                </div>{" "}
                {/* Method */}
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-3">
                    Upscaling Method
                  </label>
                  <select
                    value={enhancementSettings.method}
                    onChange={(e) =>
                      setEnhancementSettings((prev) => ({
                        ...prev,
                        method: e.target.value,
                      }))
                    }
                    className="w-full input-theme border-2 border-theme-border focus:border-theme-primary"
                  >
                    <option value="bicubic">Bicubic (Best Quality)</option>
                    <option value="lanczos">Lanczos (Balanced)</option>
                    <option value="bilinear">Bilinear (Fastest)</option>
                  </select>
                </div>
                {/* Denoise */}
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-3">
                    Noise Reduction:{" "}
                    <span className="text-theme-primary font-bold">
                      {enhancementSettings.denoise}%
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={enhancementSettings.denoise}
                    onChange={(e) =>
                      setEnhancementSettings((prev) => ({
                        ...prev,
                        denoise: parseInt(e.target.value),
                      }))
                    }
                    className="w-full h-3 bg-theme-secondary rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                      background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${enhancementSettings.denoise}%, var(--color-secondary) ${enhancementSettings.denoise}%, var(--color-secondary) 100%)`,
                    }}
                  />
                </div>
                {/* Sharpen */}
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-3">
                    Sharpening:{" "}
                    <span className="text-theme-primary font-bold">
                      {enhancementSettings.sharpen}%
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={enhancementSettings.sharpen}
                    onChange={(e) =>
                      setEnhancementSettings((prev) => ({
                        ...prev,
                        sharpen: parseInt(e.target.value),
                      }))
                    }
                    className="w-full h-3 bg-theme-secondary rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                      background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${enhancementSettings.sharpen}%, var(--color-secondary) ${enhancementSettings.sharpen}%, var(--color-secondary) 100%)`,
                    }}
                  />
                </div>
                {/* Brightness */}
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-3">
                    Brightness:{" "}
                    <span className="text-theme-primary font-bold">
                      {enhancementSettings.brightness > 0 ? "+" : ""}
                      {enhancementSettings.brightness}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={enhancementSettings.brightness}
                    onChange={(e) =>
                      setEnhancementSettings((prev) => ({
                        ...prev,
                        brightness: parseInt(e.target.value),
                      }))
                    }
                    className="w-full h-3 bg-theme-secondary rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                      background: `linear-gradient(to right, var(--color-secondary) 0%, var(--color-secondary) ${((enhancementSettings.brightness + 100) / 200) * 100}%, var(--color-primary) ${((enhancementSettings.brightness + 100) / 200) * 100}%, var(--color-primary) 100%)`,
                    }}
                  />
                </div>
                {/* Contrast */}
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-3">
                    Contrast:{" "}
                    <span className="text-theme-primary font-bold">
                      {enhancementSettings.contrast > 0 ? "+" : ""}
                      {enhancementSettings.contrast}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={enhancementSettings.contrast}
                    onChange={(e) =>
                      setEnhancementSettings((prev) => ({
                        ...prev,
                        contrast: parseInt(e.target.value),
                      }))
                    }
                    className="w-full h-3 bg-theme-secondary rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                      background: `linear-gradient(to right, var(--color-secondary) 0%, var(--color-secondary) ${((enhancementSettings.contrast + 100) / 200) * 100}%, var(--color-primary) ${((enhancementSettings.contrast + 100) / 200) * 100}%, var(--color-primary) 100%)`,
                    }}                  />
                </div>

                {/* Saturation */}
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-3">
                    Saturation: <span className="text-theme-primary font-bold">{enhancementSettings.saturation > 0 ? "+" : ""}{enhancementSettings.saturation}</span>
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={enhancementSettings.saturation}
                    onChange={(e) =>
                      setEnhancementSettings((prev) => ({
                        ...prev,
                        saturation: parseInt(e.target.value),
                      }))
                    }
                    className="w-full h-3 bg-theme-secondary rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                      background: `linear-gradient(to right, var(--color-secondary) 0%, var(--color-secondary) ${((enhancementSettings.saturation + 100) / 200) * 100}%, var(--color-primary) ${((enhancementSettings.saturation + 100) / 200) * 100}%, var(--color-primary) 100%)`
                    }}
                  />
                </div>

                {/* Gamma */}
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-3">
                    Gamma:{" "}
                    <span className="text-theme-primary font-bold">
                      {enhancementSettings.gamma.toFixed(2)}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={enhancementSettings.gamma}
                    onChange={(e) =>
                      setEnhancementSettings((prev) => ({
                        ...prev,
                        gamma: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full h-3 bg-theme-secondary rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                      background: `linear-gradient(to right, var(--color-secondary) 0%, var(--color-secondary) ${((enhancementSettings.gamma - 0.5) / 2) * 100}%, var(--color-primary) ${((enhancementSettings.gamma - 0.5) / 2) * 100}%, var(--color-primary) 100%)`,
                    }}
                  />
                </div>
                {/* Highlights */}
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-3">
                    Highlights:{" "}
                    <span className="text-theme-primary font-bold">
                      {enhancementSettings.highlights > 0 ? "+" : ""}
                      {enhancementSettings.highlights}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={enhancementSettings.highlights}
                    onChange={(e) =>
                      setEnhancementSettings((prev) => ({
                        ...prev,
                        highlights: parseInt(e.target.value),
                      }))
                    }
                    className="w-full h-3 bg-theme-secondary rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                      background: `linear-gradient(to right, var(--color-secondary) 0%, var(--color-secondary) ${((enhancementSettings.highlights + 100) / 200) * 100}%, var(--color-primary) ${((enhancementSettings.highlights + 100) / 200) * 100}%, var(--color-primary) 100%)`,
                    }}
                  />
                </div>                {/* Shadows */}
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-3">
                    Shadows: <span className="text-theme-primary font-bold">{enhancementSettings.shadows > 0 ? "+" : ""}{enhancementSettings.shadows}</span>
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={enhancementSettings.shadows}
                    onChange={(e) =>
                      setEnhancementSettings((prev) => ({
                        ...prev,
                        shadows: parseInt(e.target.value),
                      }))
                    }
                    className="w-full h-3 bg-theme-secondary rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                      background: `linear-gradient(to right, var(--color-secondary) 0%, var(--color-secondary) ${((enhancementSettings.shadows + 100) / 200) * 100}%, var(--color-primary) ${((enhancementSettings.shadows + 100) / 200) * 100}%, var(--color-primary) 100%)`
                    }}
                  />
                </div>
                {/* Vibrance */}
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-3">
                    Vibrance: <span className="text-theme-primary font-bold">{enhancementSettings.vibrance > 0 ? "+" : ""}{enhancementSettings.vibrance}</span>
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={enhancementSettings.vibrance}
                    onChange={(e) =>
                      setEnhancementSettings((prev) => ({
                        ...prev,
                        vibrance: parseInt(e.target.value),
                      }))
                    }
                    className="w-full h-3 bg-theme-secondary rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                      background: `linear-gradient(to right, var(--color-secondary) 0%, var(--color-secondary) ${((enhancementSettings.vibrance + 100) / 200) * 100}%, var(--color-primary) ${((enhancementSettings.vibrance + 100) / 200) * 100}%, var(--color-primary) 100%)`
                    }}
                  />
                </div>{" "}                {/* Edge Enhancement */}
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-3">
                    Edge Enhancement: <span className="text-theme-primary font-bold">{enhancementSettings.edgeEnhancement}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={enhancementSettings.edgeEnhancement}
                    onChange={(e) =>
                      setEnhancementSettings((prev) => ({
                        ...prev,
                        edgeEnhancement: parseInt(e.target.value),
                      }))
                    }
                    className="w-full h-3 bg-theme-secondary rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                      background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${enhancementSettings.edgeEnhancement}%, var(--color-secondary) ${enhancementSettings.edgeEnhancement}%, var(--color-secondary) 100%)`
                    }}
                  />
                </div>
                {/* Processing Info */}
                {isProcessing && (
                  <div className="mt-6 p-4 bg-theme-primary/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="w-4 h-4 text-theme-primary animate-spin" />
                      <span className="text-theme-primary font-medium">
                        Processing Images...
                      </span>
                    </div>
                    <div className="text-theme-text-secondary text-sm">
                      Applying{" "}
                      {
                        Object.keys(enhancementSettings).filter(
                          (key) =>
                            enhancementSettings[key] !== 0 &&
                            enhancementSettings[key] !== 1
                        ).length
                      }{" "}
                      enhancements
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                dragOver
                  ? "border-theme-primary bg-theme-primary/5"
                  : "border-theme-border bg-theme-secondary/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-theme-primary/10 rounded-full">
                  <Upload className="w-8 h-8 text-theme-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-theme-text mb-2">
                    Drag & Drop Images Here
                  </h3>
                  <p className="text-theme-text-secondary mb-4">
                    Support for JPEG, PNG, and WebP files up to 10MB each
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-primary px-6 py-3 rounded-xl font-medium"
                  >
                    Choose Files
                  </button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) =>
                  handleFileSelection(Array.from(e.target.files))
                }
                className="hidden"
              />
            </div>
            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="card-theme p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-theme-text">
                    Selected Images ({selectedFiles.length})
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleEnhanceImages}
                      disabled={isProcessing}
                      className="btn-primary px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                      {isProcessing ? "Processing..." : "Enhance All"}
                    </button>
                    <button
                      onClick={clearAll}
                      className="btn-outline-primary px-4 py-2 rounded-lg font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {selectedFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-theme-secondary/50 rounded-xl p-4"
                    >
                      {" "}
                      <div className="flex items-center gap-4">                        <div className="relative">
                          <Image
                            src={file.originalDataUrl}
                            alt={file.name}
                            width={64}
                            height={64}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          {file.processing && (
                            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                              <RefreshCw className="w-6 h-6 text-white animate-spin" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-theme-text font-medium truncate">
                            {file.name}
                          </p>
                          <div className="text-theme-text-secondary text-sm space-y-1">
                            <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            {file.metadata && (
                              <p>
                                {file.metadata.width}×{file.metadata.height}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          {file.processedDataUrl && (
                            <button
                              onClick={() => downloadImageFile(file)}
                              className="p-2 bg-theme-primary text-white rounded-lg hover:bg-opacity-90 transition-all"
                              title="Download enhanced image"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setPreviewMode(
                                previewMode === "enhanced"
                                  ? "original"
                                  : "enhanced"
                              )
                            }
                            className="p-2 bg-theme-secondary text-theme-text rounded-lg hover:bg-theme-primary/20 transition-all"
                            title="Toggle preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}{" "}
            {/* Processed Images */}
            {processedImages.length > 0 && (
              <div className="card-theme p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-theme-text">
                    Enhanced Images ({processedImages.length})
                  </h3>
                  <div className="flex items-center gap-2">
                    {/* Preview Mode Toggle */}
                    <div className="flex bg-theme-secondary rounded-lg p-1">
                      <button
                        onClick={() => setPreviewMode("side-by-side")}
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          previewMode === "side-by-side"
                            ? "bg-theme-primary text-white"
                            : "text-theme-text-secondary hover:text-theme-text"
                        }`}
                      >
                        Side by Side
                      </button>
                      <button
                        onClick={() => setPreviewMode("enhanced")}
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          previewMode === "enhanced"
                            ? "bg-theme-primary text-white"
                            : "text-theme-text-secondary hover:text-theme-text"
                        }`}
                      >
                        Enhanced Only
                      </button>
                    </div>
                    <button
                      onClick={downloadAllImages}
                      className="btn-primary px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download All
                    </button>
                  </div>
                </div>

                <div className="grid gap-6">
                  {processedImages.map((image) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-theme-secondary/50 rounded-xl p-6"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <ImageIcon className="w-5 h-5 text-theme-primary" />
                        <h4 className="text-theme-text font-medium">
                          {image.name}
                        </h4>
                        {image.metadata && (
                          <div className="flex items-center gap-2 text-theme-text-secondary text-sm">
                            <Info className="w-4 h-4" />
                            <span>
                              {image.metadata.width}×{image.metadata.height}
                            </span>
                            <ArrowRight className="w-4 h-4" />
                            <span className="text-theme-success">
                              {Math.floor(
                                image.metadata.width * enhancementSettings.scale
                              )}
                              ×
                              {Math.floor(
                                image.metadata.height *
                                  enhancementSettings.scale
                              )}
                            </span>
                          </div>
                        )}
                        <div className="ml-auto">
                          <span className="text-theme-success text-sm font-medium bg-theme-success/10 px-2 py-1 rounded">
                            Enhanced
                          </span>
                        </div>
                      </div>

                      {previewMode === "side-by-side" ? (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-theme-text-secondary text-sm mb-2">
                              Original
                            </p>                            <Image
                              src={image.originalDataUrl}
                              alt={`Original ${image.name}`}
                              width={400}
                              height={256}
                              className="w-full h-64 object-contain rounded-lg bg-theme-secondary"
                            />
                          </div>
                          <div>
                            <p className="text-theme-text-secondary text-sm mb-2">
                              Enhanced
                            </p>                            <Image
                              src={image.processedDataUrl}
                              alt={`Enhanced ${image.name}`}
                              width={400}
                              height={256}
                              className="w-full h-64 object-contain rounded-lg bg-theme-secondary"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-theme-text-secondary text-sm mb-2">
                            Enhanced Image
                          </p>                          <Image
                            src={image.processedDataUrl}
                            alt={`Enhanced ${image.name}`}
                            width={600}
                            height={384}
                            className="w-full max-h-96 object-contain rounded-lg bg-theme-secondary mx-auto"
                          />
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-4">
                        <div className="text-theme-text-secondary text-sm">
                          Processing completed with{" "}
                          {
                            Object.keys(enhancementSettings).filter(
                              (key) =>
                                enhancementSettings[key] !== 0 &&
                                enhancementSettings[key] !== 1
                            ).length
                          }{" "}
                          enhancements applied
                        </div>
                        <button
                          onClick={() => downloadImageFile(image)}
                          className="btn-primary px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download Enhanced
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
