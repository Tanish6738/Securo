"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import Header from "@/components/Header";
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  CloudArrowUpIcon,
  DocumentIcon,
  TrashIcon,
  EyeIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  TagIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  PlusIcon,
  FolderIcon,
  PhotoIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  ArchiveBoxIcon,
  DocumentTextIcon,
  ClockIcon,
  CalendarIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  StarIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  DocumentIcon as DocumentSolidIcon,
  FolderIcon as FolderSolidIcon,
  PhotoIcon as PhotoSolidIcon,
  VideoCameraIcon as VideoSolidIcon,
  SpeakerWaveIcon as AudioSolidIcon,
  ArchiveBoxIcon as ArchiveSolidIcon,
  StarIcon as StarSolidIcon,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";

export default function VaultPage() {
  const { user, isLoaded } = useUser();
  const [vaultItems, setVaultItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vaultPassword, setVaultPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadTags, setUploadTags] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [hasVaultPassword, setHasVaultPassword] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState("name"); // 'name', 'date', 'size', 'type'
  const [filterBy, setFilterBy] = useState("all"); // 'all', 'documents', 'images', 'videos', 'audio', 'archives'
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  useEffect(() => {
    if (isLoaded && user) {
      checkUserVaultStatus();
      loadVaultItems();
    }
  }, [isLoaded, user]);

  useEffect(() => {
    // Enhanced filtering and sorting
    let filtered = vaultItems;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.tags?.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Filter by file type
    if (filterBy !== "all") {
      filtered = filtered.filter((item) => {
        const fileType = getFileCategory(item.originalName, item.mimeType);
        return fileType === filterBy;
      });
    }

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.originalName.localeCompare(b.originalName);
        case "date":
          return new Date(b.uploadedAt) - new Date(a.uploadedAt);
        case "size":
          return (b.size || 0) - (a.size || 0);
        case "type":
          return (a.mimeType || "").localeCompare(b.mimeType || "");
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
  }, [searchTerm, vaultItems, filterBy, sortBy]);

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileValidation(file);
    }
  };

  // File category helper
  const getFileCategory = (filename, mimeType) => {
    const extension = filename.split(".").pop().toLowerCase();

    if (
      ["jpg", "jpeg", "png", "gif", "svg", "bmp", "tiff", "webp"].includes(
        extension
      ) ||
      mimeType?.startsWith("image/")
    ) {
      return "images";
    }
    if (
      ["mp4", "mov", "avi", "mkv", "webm"].includes(extension) ||
      mimeType?.startsWith("video/")
    ) {
      return "videos";
    }
    if (
      ["mp3", "wav", "ogg", "flac"].includes(extension) ||
      mimeType?.startsWith("audio/")
    ) {
      return "audio";
    }
    if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
      return "archives";
    }
    return "documents";
  };

  // Get file icon based on type
  const getFileIcon = (filename, mimeType, size = "h-8 w-8") => {
    const category = getFileCategory(filename, mimeType);

    switch (category) {
      case "images":
        return <PhotoSolidIcon className={`${size} text-purple-500`} />;
      case "videos":
        return <VideoSolidIcon className={`${size} text-red-500`} />;
      case "audio":
        return <AudioSolidIcon className={`${size} text-green-500`} />;
      case "archives":
        return <ArchiveSolidIcon className={`${size} text-yellow-500`} />;
      default:
        return <DocumentSolidIcon className={`${size} text-blue-500`} />;
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };
  const checkUserVaultStatus = async () => {
    try {
      const response = await fetch("/api/user");
      const data = await response.json();
      setHasVaultPassword(data.user?.hasVaultPassword || false);
    } catch (error) {
      console.error("Error checking vault status:", error);
    }
  };

  const loadVaultItems = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/vault");
      const data = await response.json();

      if (response.ok) {
        setVaultItems(data.items || []);
      } else {
        throw new Error(data.error || "Failed to load vault items");
      }
    } catch (error) {
      console.error("Error loading vault items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileValidation = (file) => {
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return false;
      }

      // Check file type (basic validation)
      const allowedTypes = [
        // Documents
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "text/csv",
        "application/json",
        "application/xml",
        // Spreadsheets
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        // Presentations
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        // Images
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/svg+xml",
        "image/bmp",
        "image/tiff",
        "image/webp",
        // Videos
        "video/mp4",
        "video/quicktime",
        "video/x-msvideo",
        "video/x-matroska",
        "video/webm",
        // Audio
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        // Archives
        "application/zip",
        "application/x-rar-compressed",
        "application/x-7z-compressed",
        // Other
        "application/octet-stream",
      ];

      const fileExtension = file.name.split(".").pop().toLowerCase();
      const commonExtensions = [
        "pdf",
        "doc",
        "docx",
        "txt",
        "csv",
        "xlsx",
        "xls",
        "ppt",
        "pptx",
        "jpg",
        "jpeg",
        "png",
        "gif",
        "svg",
        "bmp",
        "tiff",
        "webp",
        "mp4",
        "mov",
        "avi",
        "mkv",
        "webm",
        "mp3",
        "wav",
        "zip",
        "rar",
        "7z",
      ];

      if (
        !allowedTypes.includes(file.type) &&
        !commonExtensions.includes(fileExtension)
      ) {
        alert(
          "File type not supported. Please choose a document, image, video, audio, or archive file."
        );
        return false;
      }

      setSelectedFile(file);
      setCurrentAction({ type: "upload" });
      setShowPasswordModal(true);
      return true;
    }
    return false;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!handleFileValidation(file)) {
      event.target.value = ""; // Clear the input
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !vaultPassword) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("vaultPassword", vaultPassword);
      formData.append("description", uploadDescription);
      formData.append("tags", uploadTags);

      const response = await fetch("/api/vault", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setVaultItems((prev) => [data.item, ...prev]);
        setSelectedFile(null);
        setUploadDescription("");
        setUploadTags("");
        setVaultPassword("");
        setShowPasswordModal(false);
        setHasVaultPassword(true);
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (item) => {
    if (!vaultPassword) {
      setCurrentAction({ type: "preview", item });
      setShowPasswordModal(true);
      return;
    }

    try {
      setPreviewLoading(true);
      setPreviewItem(item);
      setShowPreviewModal(true);

      const response = await fetch(
        `/api/vault/preview?id=${item._id}&password=${encodeURIComponent(vaultPassword)}`
      );

      if (response.ok) {
        const contentType = response.headers.get("content-type");

        if (contentType?.includes("application/json")) {
          // Text content
          const data = await response.json();
          setPreviewContent(data);
        } else {
          // Binary content (images, videos, etc.)
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setPreviewContent({
            type: "binary",
            url: url,
            mimeType: item.mimeType,
            originalName: item.originalName,
          });
        }
      } else {
        const data = await response.json();
        throw new Error(data.error || "Preview failed");
      }
    } catch (error) {
      alert("Preview failed: " + error.message);
      setShowPreviewModal(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = async (item) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/vault/download?id=${item._id}&password=${encodeURIComponent(vaultPassword)}`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = item.originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        throw new Error(data.error || "Download failed");
      }
    } catch (error) {
      alert("Download failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Are you sure you want to delete "${item.originalName}"?`))
      return;

    try {
      setLoading(true);
      const response = await fetch(`/api/vault?id=${item._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setVaultItems((prev) => prev.filter((i) => i._id !== item._id));
      } else {
        const data = await response.json();
        throw new Error(data.error || "Delete failed");
      }
    } catch (error) {
      alert("Delete failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const executeCurrentAction = async () => {
    if (!vaultPassword) {
      alert("Please enter your vault password");
      return;
    }

    if (currentAction?.type === "upload") {
      await handleUpload();
    } else if (currentAction?.type === "preview") {
      await handlePreview(currentAction.item);
      setCurrentAction(null);
      setShowPasswordModal(false);
    }
  };

  const isPreviewable = (mimeType) => {
    return (
      mimeType?.startsWith("image/") ||
      mimeType?.startsWith("video/") ||
      mimeType?.startsWith("audio/") ||
      mimeType?.startsWith("text/") ||
      mimeType?.includes("pdf") ||
      mimeType === "application/json" ||
      mimeType === "application/xml"
    );
  };

  const closePreview = () => {
    setShowPreviewModal(false);
    setPreviewItem(null);
    if (previewContent?.url) {
      URL.revokeObjectURL(previewContent.url);
    }
    setPreviewContent(null);
  };
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">        {/* User-Friendly Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl blur-3xl opacity-20 transform scale-110"></div>
          <div className="relative bg-gray-800/70 backdrop-blur-lg border border-gray-700/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/20">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-2xl blur-lg opacity-40"></div>
                  <div className="relative p-3 sm:p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                    <LockClosedIcon className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                    <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Secure Vault
                    </h1>
                    <div className="px-3 py-1.5 bg-gradient-to-r from-green-900/60 to-emerald-900/60 border border-green-700/40 rounded-full self-start">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-300">
                          Protected
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-4 text-base sm:text-lg leading-relaxed">
                    Your private vault protected with military-grade encryption.
                    Store sensitive files securely with zero-knowledge architecture.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
                    <div className="flex items-center gap-2 min-w-fit">
                      <FolderSolidIcon className="h-5 w-5 text-indigo-400" />
                      <span className="font-semibold text-white">
                        {filteredItems.length}
                      </span>
                      <span className="text-gray-400">files</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-fit">
                      <ArchiveBoxIcon className="h-5 w-5 text-purple-400" />
                      <span className="font-semibold text-white">
                        {formatFileSize(
                          filteredItems.reduce(
                            (acc, item) => acc + (item.size || 0),
                            0
                          )
                        )}
                      </span>
                      <span className="text-gray-400">total</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-fit">
                      <ShieldCheckIcon className="h-5 w-5 text-green-400" />
                      <span className="text-green-300 font-medium">
                        AES-256 Encrypted
                      </span>
                    </div>
                  </div>
                </div>
              </div>              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 touch-manipulation"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center gap-3">
                    <PlusIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-sm sm:text-base">Upload Files</span>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>        {/* User-Friendly Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="border-0 shadow-xl shadow-black/30 bg-gray-800/80 backdrop-blur-lg rounded-2xl overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {/* Enhanced Search - Full Width on Mobile */}
                <div className="w-full relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors duration-300" />
                  <Input
                    type="text"
                    placeholder="Search your files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 sm:h-14 text-base border-gray-600/50 bg-gray-900/50 backdrop-blur-sm focus:border-indigo-400 focus:ring-indigo-500/30 rounded-xl transition-all duration-300 w-full text-white placeholder-gray-400"
                  />
                </div>

                {/* Filters and View Controls - Responsive Layout */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <div className="relative flex-1 sm:flex-none sm:min-w-[140px]">
                      <select
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value)}
                        className="appearance-none w-full px-4 py-3 pr-10 border border-gray-600/50 rounded-xl bg-gray-900/70 backdrop-blur-sm text-gray-200 focus:border-indigo-400 focus:ring-indigo-500/30 focus:ring-2 focus:ring-opacity-20 transition-all duration-300 text-sm sm:text-base"
                      >
                        <option value="all">All Files</option>
                        <option value="documents">📄 Documents</option>
                        <option value="images">🖼️ Images</option>
                        <option value="videos">🎥 Videos</option>
                        <option value="audio">🎵 Audio</option>
                        <option value="archives">📦 Archives</option>
                      </select>
                      <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    
                    <div className="relative flex-1 sm:flex-none sm:min-w-[140px]">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none w-full px-4 py-3 pr-10 border border-gray-600/50 rounded-xl bg-gray-900/70 backdrop-blur-sm text-gray-200 focus:border-indigo-400 focus:ring-indigo-500/30 focus:ring-2 focus:ring-opacity-20 transition-all duration-300 text-sm sm:text-base"
                      >
                        <option value="name">Sort by Name</option>
                        <option value="date">Sort by Date</option>
                        <option value="size">Sort by Size</option>
                        <option value="type">Sort by Type</option>
                      </select>
                      <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* View Mode Toggle - Larger Touch Targets */}
                  <div className="flex bg-gray-700/70 backdrop-blur-sm rounded-xl p-1 shadow-inner self-center">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 min-w-[70px] justify-center ${
                        viewMode === 'grid' 
                          ? 'bg-gray-800 text-indigo-400 shadow-md shadow-black/50' 
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <Squares2X2Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">Grid</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 min-w-[70px] justify-center ${
                        viewMode === 'list' 
                          ? 'bg-gray-800 text-indigo-400 shadow-md shadow-black/50' 
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <ListBulletIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">List</span>
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>        
        </motion.div>

        {/* Two Section Layout */}
        <div className="grid lg:grid-cols-5 gap-6 sm:gap-8">
          {/* File Upload Section */}
          <div className="lg:col-span-2">
            <motion.div
              ref={dropZoneRef}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`relative transition-all duration-500 touch-manipulation ${
                dragActive ? "transform scale-105 rotate-1" : "hover:scale-[1.02]"
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-2xl sm:rounded-3xl blur-xl transition-all duration-500 ${
                  dragActive ? "opacity-100 scale-110" : "opacity-0 scale-100"
                }`}
              ></div>

              <Card
                className={`relative border-2 border-dashed transition-all duration-500 rounded-2xl sm:rounded-3xl overflow-hidden ${
                  dragActive
                    ? "border-indigo-400 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 shadow-2xl shadow-indigo-500/30"
                    : "border-gray-600/50 hover:border-indigo-400/50 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-800/70"
                }`}
              >
                <CardHeader className="text-center pb-3">
                  <CardTitle className="text-lg sm:text-xl font-bold text-white flex items-center justify-center gap-2">
                    <CloudArrowUpIcon className="h-6 w-6 text-indigo-400" />
                    File Upload
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Drag & drop or click to upload
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-4 sm:p-6 text-center">
                  <motion.div
                    animate={
                      dragActive
                        ? { scale: 1.1, rotate: 5 }
                        : { scale: 1, rotate: 0 }
                    }
                    transition={{ duration: 0.3 }}
                    className="mb-4 sm:mb-6"
                  >
                    <div
                      className={`mx-auto h-16 w-16 sm:h-20 sm:w-20 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        dragActive
                          ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg"
                          : "bg-gradient-to-br from-gray-700 to-gray-800 text-gray-400 hover:from-indigo-800 hover:to-purple-800 hover:text-indigo-300"
                      }`}
                    >
                      <CloudArrowUpIcon className="h-8 w-8 sm:h-10 sm:w-10" />
                    </div>
                  </motion.div>

                  <h3
                    className={`text-lg sm:text-xl font-bold mb-2 sm:mb-3 transition-colors duration-300 ${
                      dragActive ? "text-indigo-300" : "text-gray-200"
                    }`}
                  >
                    {dragActive ? "Drop your files here!" : "Upload Files"}
                  </h3>

                  <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base px-2">
                    Secure your documents with military-grade encryption
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-xl touch-manipulation min-h-[44px] w-full justify-center"
                  >
                    <FolderIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-sm sm:text-base">Choose Files</span>
                  </motion.button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mov,.zip,.rar,.xlsx,.xls,.ppt,.pptx,.csv,.json,.xml,.mp3,.wav,.avi,.mkv,.webm,.svg,.bmp,.tiff,.psd,.ai,.eps,.rtf,.odt,.ods,.odp"
                    className="hidden"
                  />

                  <div className="mt-4 sm:mt-6 text-sm text-gray-400 bg-gray-900/50 rounded-xl p-3 sm:p-4">
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
                      <span className="flex items-center gap-1">
                        <DocumentSolidIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                        <span className="hidden sm:inline">Documents</span>
                        <span className="sm:hidden">Docs</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <PhotoSolidIcon className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
                        <span className="hidden sm:inline">Images</span>
                        <span className="sm:hidden">Pics</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <VideoSolidIcon className="h-3 w-3 sm:h-4 sm:w-4 text-red-400" />
                        <span className="hidden sm:inline">Videos</span>
                        <span className="sm:hidden">Vids</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <AudioSolidIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                        Audio
                      </span>
                      <span className="flex items-center gap-1">
                        <ArchiveSolidIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                        <span className="hidden sm:inline">Archives</span>
                        <span className="sm:hidden">Zips</span>
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-center">Maximum file size: 10MB</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* File Display Section */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl shadow-black/30 bg-gray-800/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl font-bold text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderSolidIcon className="h-6 w-6 text-indigo-400" />
                      Your Files
                      <span className="px-2 py-1 bg-indigo-600/20 text-indigo-300 rounded-lg text-sm font-medium">
                        {filteredItems.length}
                      </span>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Manage and access your encrypted files
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-4 sm:p-6">
                  {loading ? (
                    <div className="py-16 text-center">
                      <div className="mb-6">
                        <div className="relative mx-auto w-16 h-16">
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full animate-spin opacity-20"></div>
                          <div className="absolute inset-2 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-full animate-ping"></div>
                          <div className="absolute inset-4 bg-gray-800 rounded-full flex items-center justify-center">
                            <LockClosedIcon className="h-6 w-6 text-indigo-400" />
                          </div>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-200 mb-2">
                        Decrypting Your Files
                      </h3>
                      <p className="text-gray-400">
                        Please wait while we securely access your vault...
                      </p>
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="mb-8">
                        <div className="relative mx-auto w-24 h-24">
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full"></div>
                          <div className="absolute inset-6 bg-gray-800 rounded-full flex items-center justify-center">
                            <FolderIcon className="h-8 w-8 text-gray-500" />
                          </div>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-200 mb-3">
                        {vaultItems.length === 0
                          ? "Your vault awaits"
                          : "No matching files"}
                      </h3>
                      <p className="text-gray-400 mb-8 text-lg max-w-md mx-auto">
                        {vaultItems.length === 0
                          ? "Start building your secure digital fortress by uploading your first file."
                          : "Try adjusting your search terms or filters to find what you're looking for."}
                      </p>
                      {vaultItems.length === 0 && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300"
                        >
                          <CloudArrowUpIcon className="h-6 w-6" />
                          Upload Your First File
                        </motion.button>
                      )}
                    </div>
                  ) : (
                    <div
                      className={
                        viewMode === "grid"
                          ? "grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3"
                          : "space-y-3 sm:space-y-4"
                      }
                    >
              <AnimatePresence>
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}                    className={
                      viewMode === "grid"
                        ? "group relative bg-gray-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-gray-700/40 shadow-lg shadow-black/50 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-500 overflow-hidden touch-manipulation"
                        : "group bg-gray-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-gray-700/40 shadow-lg hover:shadow-xl shadow-black/30 hover:shadow-indigo-500/20 transition-all duration-300 p-4 sm:p-6 touch-manipulation"
                    }
                  >
                    {viewMode === "grid" ? (
                      <>
                        {/* Enhanced Grid File Preview */}                        <div className="relative aspect-square bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20"></div>

                          <div className="relative">
                            {getFileIcon(
                              item.originalName,
                              item.mimeType,
                              "h-16 w-16 sm:h-20 sm:w-20"
                            )}

                            {/* File Extension Badge */}                            <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gray-900 rounded-full shadow-lg flex items-center justify-center border-2 border-gray-700">
                              <span className="text-xs font-bold text-gray-200">
                                {item.originalName
                                  .split(".")
                                  .pop()
                                  ?.toUpperCase()
                                  .slice(0, 3)}
                              </span>
                            </div>
                          </div>

                          {/* Enhanced Touch-Friendly Actions Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handlePreview(item)}
                                className="p-2.5 sm:p-3 bg-gray-800/95 backdrop-blur-sm rounded-full text-gray-200 hover:bg-gray-700 hover:text-indigo-400 transition-all shadow-lg hover:shadow-xl touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                              >
                                <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDownload(item)}
                                className="p-2.5 sm:p-3 bg-gray-800/95 backdrop-blur-sm rounded-full text-gray-200 hover:bg-gray-700 hover:text-blue-400 transition-all shadow-lg hover:shadow-xl touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                              >
                                <ArrowDownTrayIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(item)}
                                className="p-2.5 sm:p-3 bg-gray-800/95 backdrop-blur-sm rounded-full text-gray-200 hover:bg-red-900/80 hover:text-red-300 transition-all shadow-lg hover:shadow-xl touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                              >
                                <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                              </motion.button>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Grid File Info */}
                        <div className="p-3 sm:p-5">
                          <div className="mb-2 sm:mb-3">
                            <h3 className="font-semibold text-gray-200 truncate group-hover:text-indigo-400 transition-colors mb-1 text-sm sm:text-base">
                              {item.originalName}
                            </h3>                            <div className="flex items-center justify-between text-xs sm:text-sm">
                              <span className="text-gray-400 font-medium">
                                {formatFileSize(item.size)}
                              </span>
                              <span className="text-gray-500">
                                {formatDate(item.uploadedAt || item.createdAt)}
                              </span>
                            </div>
                          </div>

                          {item.description && (
                            <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 mb-2 sm:mb-3">
                              {item.description}
                            </p>
                          )}

                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 sm:gap-1.5">
                              {item.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-medium bg-indigo-900/60 text-indigo-300 border border-indigo-700/40"
                                >
                                  {tag}
                                </span>
                              ))}
                              {item.tags.length > 2 && (
                                <span className="text-xs text-gray-500 px-1">
                                  +{item.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      /* Enhanced List View */
                      <div className="flex items-center gap-4 sm:gap-6">                        <div className="flex-shrink-0">
                          <div className="relative">
                            {getFileIcon(
                              item.originalName,
                              item.mimeType,
                              "h-10 w-10 sm:h-12 sm:w-12"
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0 pr-2">
                              <h3 className="font-semibold text-gray-200 truncate group-hover:text-indigo-400 transition-colors text-base sm:text-lg">
                                {item.originalName}
                              </h3>
                              <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm mt-1">                                <span className="text-gray-400 font-medium">
                                  {formatFileSize(item.size)}
                                </span>
                                <span className="text-gray-500">
                                  {formatDate(item.uploadedAt || item.createdAt)}
                                </span>
                                {item.description && (
                                  <span className="text-gray-400 truncate max-w-xs hidden sm:inline">
                                    {item.description}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Enhanced Touch-Friendly Action Buttons */}
                            <div className="flex items-center gap-1 sm:gap-2 ml-2">
                              <button
                                onClick={() => handlePreview(item)}
                                className="p-2 sm:p-2.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-900/50 rounded-lg transition-all touch-manipulation min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center"
                              >
                                <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                              </button>
                              <button
                                onClick={() => handleDownload(item)}
                                className="p-2 sm:p-2.5 text-gray-400 hover:text-blue-400 hover:bg-blue-900/50 rounded-lg transition-all touch-manipulation min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center"
                              >
                                <ArrowDownTrayIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item)}
                                className="p-2 sm:p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-900/50 rounded-lg transition-all touch-manipulation min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center"
                              >
                                <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                              </button>
                            </div>
                          </div>

                          {/* Mobile-Friendly Description */}
                          {item.description && (
                            <p className="text-xs sm:text-sm text-gray-600 truncate mb-2 sm:hidden">
                              {item.description}
                            </p>
                          )}

                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 sm:gap-1.5">
                              {item.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>            </div>
          )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Enhanced Mobile-Friendly Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
          >            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden max-h-[90vh] overflow-y-auto border border-gray-700"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black"></div>

              <div className="relative p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg">
                    <LockClosedIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                      {hasVaultPassword ? "Vault Access" : "Create Vault"}
                    </h3>
                    <p className="text-gray-300 text-xs sm:text-sm">
                      {hasVaultPassword
                        ? "Enter your password"
                        : "Set a secure password"}
                    </p>
                  </div>
                </div>

                <div className="mb-4 sm:mb-6">
                  <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">
                    {hasVaultPassword
                      ? "Please enter your vault password to continue with this action."
                      : "Create a strong password to encrypt your vault. This password cannot be recovered if lost."}
                  </p>

                  {!hasVaultPassword && (
                    <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-amber-900/40 to-orange-900/40 border border-amber-700/50 rounded-xl">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <ExclamationTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs sm:text-sm">
                          <p className="font-semibold text-amber-200 mb-1">
                            Security Notice
                          </p>
                          <p className="text-amber-300">
                            This password encrypts your files with
                            military-grade security. Store it safely - we cannot
                            recover it if forgotten.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <Input
                      type="password"
                      placeholder="Enter your vault password"
                      value={vaultPassword}
                      onChange={(e) => setVaultPassword(e.target.value)}
                      className="h-11 sm:h-12 lg:h-14 text-sm sm:text-base border-gray-600 focus:border-indigo-400 focus:ring-indigo-500/30 bg-gray-900/50 backdrop-blur-sm touch-manipulation text-white placeholder-gray-400"
                      onKeyPress={(e) =>
                        e.key === "Enter" && executeCurrentAction()
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button
                    onClick={() => {
                      setShowPasswordModal(false);                      setVaultPassword("");
                      setSelectedFile(null);
                      setCurrentAction(null);
                    }}
                    variant="outline"
                    className="flex-1 h-11 sm:h-12 lg:h-14 rounded-xl border-gray-600 hover:border-gray-500 bg-gray-800 text-gray-200 hover:bg-gray-700 text-sm sm:text-base touch-manipulation"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={executeCurrentAction}
                    disabled={!vaultPassword || loading}
                    className="flex-1 h-11 sm:h-12 lg:h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-indigo-500/25 text-sm sm:text-base touch-manipulation"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </div>                {selectedFile && (
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-900/70 rounded-xl border border-gray-700">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      {getFileIcon(
                        selectedFile.name,
                        selectedFile.type,
                        "h-6 w-6 sm:h-8 sm:w-8"
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-200 truncate text-sm sm:text-base">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <Input
                        placeholder="Description (optional)"
                        value={uploadDescription}
                        onChange={(e) => setUploadDescription(e.target.value)}
                        className="bg-gray-800 border-gray-600 h-10 sm:h-11 text-sm sm:text-base touch-manipulation text-gray-200 placeholder-gray-400 focus:border-indigo-400"
                      />                      <Input
                        placeholder="Tags (comma-separated, optional)"
                        value={uploadTags}
                        onChange={(e) => setUploadTags(e.target.value)}
                        className="bg-gray-800 border-gray-600 h-10 sm:h-11 text-sm sm:text-base touch-manipulation text-gray-200 placeholder-gray-400 focus:border-indigo-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>      {/* Enhanced Mobile-Friendly Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
          >            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-4xl lg:max-w-6xl h-[85vh] sm:h-5/6 flex flex-col overflow-hidden border border-gray-700"
            >
              {/* Enhanced Modal Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
                  <div className="p-1.5 sm:p-2 bg-gray-700 rounded-lg sm:rounded-xl shadow-sm shrink-0">
                    {getFileIcon(
                      previewItem?.originalName,
                      previewItem?.mimeType,
                      "h-6 w-6 sm:h-8 sm:w-8"
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-white truncate">
                      {previewItem?.originalName}
                    </h3>
                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-gray-300 overflow-hidden">
                      <span className="shrink-0">{formatFileSize(previewItem?.size)}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline truncate">{previewItem?.mimeType}</span>
                      <span className="hidden lg:inline">•</span>
                      <span className="hidden lg:inline shrink-0">
                        {formatDate(
                          previewItem?.uploadedAt || previewItem?.createdAt
                        )}
                      </span>                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 shrink-0">
                  <Button
                    onClick={() => handleDownload(previewItem)}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm touch-manipulation min-h-[36px] sm:min-h-[40px] bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                  >
                    <ArrowDownTrayIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                  <Button
                    onClick={closePreview}
                    variant="outline"
                    size="sm"
                    className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl touch-manipulation min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                  >
                    <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              </div>              {/* Enhanced Modal Content */}
              <div className="flex-1 overflow-hidden">
                {previewLoading ? (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-800 to-gray-900 p-4">
                    <div className="text-center">
                      <div className="relative mx-auto w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4">                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full animate-spin opacity-20"></div>
                        <div className="absolute inset-1 sm:inset-2 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-full animate-ping"></div>
                        <div className="absolute inset-2 sm:inset-4 bg-gray-800 rounded-full flex items-center justify-center">
                          <EyeIcon className="h-4 w-4 sm:h-6 sm:w-6 text-indigo-400" />
                        </div>
                      </div>
                      <h4 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">
                        Decrypting Preview
                      </h4>
                      <p className="text-gray-300 text-sm sm:text-base">
                        Preparing your file for secure viewing...
                      </p>
                    </div>
                  </div>
                ) : previewContent ? (
                  <div className="h-full p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-gray-700 to-gray-800">
                    {previewContent.type === "text" ? (
                      <div className="bg-gray-900 rounded-xl sm:rounded-2xl shadow-inner h-full p-3 sm:p-4 lg:p-6 overflow-auto border border-gray-700">
                        <pre className="whitespace-pre-wrap text-xs sm:text-sm font-mono text-gray-200 leading-relaxed">
                          {previewContent.content}
                        </pre>
                      </div>
                    ) : previewContent.type === "binary" ? (                      <div className="flex items-center justify-center h-full">                        {previewContent.mimeType?.startsWith("image/") ? (
                          <div className="w-full h-full flex flex-col">
                            {/* Image Controls */}
                            <div className="flex justify-center mb-2 sm:mb-4">
                              <div className="flex items-center gap-2 bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 border border-gray-600">
                                <button
                                  onClick={() => {
                                    const img = document.querySelector('.preview-image');
                                    const currentScale = parseFloat(img.style.transform?.match(/scale\(([^)]+)\)/)?.[1] || '1');
                                    const newScale = Math.min(currentScale * 1.2, 3);
                                    img.style.transform = `scale(${newScale})`;
                                  }}
                                  className="p-1.5 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
                                  title="Zoom In"
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    const img = document.querySelector('.preview-image');
                                    const currentScale = parseFloat(img.style.transform?.match(/scale\(([^)]+)\)/)?.[1] || '1');
                                    const newScale = Math.max(currentScale / 1.2, 0.3);
                                    img.style.transform = `scale(${newScale})`;
                                  }}
                                  className="p-1.5 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
                                  title="Zoom Out"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    const img = document.querySelector('.preview-image');
                                    img.style.transform = 'scale(1)';
                                  }}
                                  className="px-2 py-1.5 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors text-xs"
                                  title="Reset Zoom"
                                >
                                  Reset
                                </button>
                              </div>
                            </div>
                              {/* Image Container */}
                            <div className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-auto">
                              <div className="relative w-full h-full flex items-center justify-center">
                                <Image
                                  src={previewContent.url}
                                  alt={previewContent.originalName}
                                  width={800}
                                  height={600}
                                  className="preview-image max-w-full max-h-full object-contain rounded-lg sm:rounded-xl shadow-2xl cursor-grab active:cursor-grabbing transition-transform duration-200"
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    width: 'auto',
                                    height: 'auto',
                                    transformOrigin: 'center center'
                                  }}
                                  draggable={false}
                                  onLoad={(e) => {
                                    // Ensure image fits properly in container
                                    const img = e.target;
                                    const container = img.parentElement;
                                    const containerRect = container.getBoundingClientRect();
                                    const imgAspectRatio = img.naturalWidth / img.naturalHeight;
                                    const containerAspectRatio = containerRect.width / containerRect.height;
                                    
                                    if (imgAspectRatio > containerAspectRatio) {
                                      // Image is wider than container
                                      img.style.width = '100%';
                                      img.style.height = 'auto';
                                    } else {
                                      // Image is taller than container
                                      img.style.width = 'auto';
                                      img.style.height = '100%';
                                    }
                                  }}
                                  onMouseDown={(e) => {
                                    // Add drag functionality for panning when zoomed
                                    const img = e.target;
                                    const startX = e.clientX;
                                    const startY = e.clientY;
                                    const currentTransform = img.style.transform || '';
                                    const translateMatch = currentTransform.match(/translate\(([^)]+)\)/);
                                    const startTranslateX = translateMatch ? parseFloat(translateMatch[1].split(',')[0]) : 0;
                                    const startTranslateY = translateMatch ? parseFloat(translateMatch[1].split(',')[1]) : 0;
                                    
                                    const handleMouseMove = (e) => {
                                      const deltaX = e.clientX - startX;
                                      const deltaY = e.clientY - startY;
                                      const newTranslateX = startTranslateX + deltaX;
                                      const newTranslateY = startTranslateY + deltaY;
                                      
                                      const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/);
                                      const scale = scaleMatch ? scaleMatch[1] : '1';
                                      
                                      img.style.transform = `translate(${newTranslateX}px, ${newTranslateY}px) scale(${scale})`;
                                    };
                                    
                                    const handleMouseUp = () => {
                                      document.removeEventListener('mousemove', handleMouseMove);
                                      document.removeEventListener('mouseup', handleMouseUp);
                                    };
                                    
                                    document.addEventListener('mousemove', handleMouseMove);
                                    document.addEventListener('mouseup', handleMouseUp);
                                  }}
                                />
                              </div>
                            </div>
                            
                            {/* Image Info */}
                            <div className="mt-2 text-center">
                              <p className="text-xs text-gray-400">
                                Click and drag to pan • Use controls to zoom
                              </p>
                            </div>
                          </div>
                        ) : previewContent.mimeType?.startsWith("video/") ? (
                          <div className="bg-black rounded-xl sm:rounded-2xl shadow-lg overflow-hidden w-full max-w-full border border-gray-700">
                            <video
                              src={previewContent.url}
                              controls
                              className="max-w-full max-h-full w-full"
                            >
                              Your browser does not support the video tag.
                            </video>                          </div>
                        ) : previewContent.mimeType?.startsWith("audio/") ? (
                          <div className="text-center bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 shadow-lg max-w-lg mx-auto border border-gray-700">
                            <div className="mb-4 sm:mb-6">
                              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-800 to-emerald-800 rounded-full flex items-center justify-center">
                                <AudioSolidIcon className="h-8 w-8 sm:h-10 sm:w-10 text-green-400" />
                              </div>
                            </div>
                            <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 truncate">
                              {previewContent.originalName}
                            </h4>
                            <audio
                              src={previewContent.url}
                              controls
                              className="w-full max-w-md mx-auto"
                            >
                              Your browser does not support the audio tag.
                            </audio>
                          </div>
                        ) : previewContent.mimeType?.includes("pdf") ? (
                          <div className="w-full h-full bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-gray-700">
                            <iframe
                              src={previewContent.url}
                              className="w-full h-full border-0"
                              title={previewContent.originalName}
                            />
                          </div>
                        ) : (
                          <div className="text-center bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 shadow-lg max-w-lg mx-auto border border-gray-700">
                            <div className="mb-4 sm:mb-6">
                              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center">
                                <DocumentSolidIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                              </div>
                            </div>
                            <h4 className="text-base sm:text-lg font-semibold text-white mb-2">
                              Preview not available
                            </h4>
                            <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
                              This file type cannot be previewed directly.
                            </p>
                            <Button
                              onClick={() => handleDownload(previewItem)}
                              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base touch-manipulation"
                            >
                              <ArrowDownTrayIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                              Download to view
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full p-4">
                        <div className="text-center bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 shadow-lg max-w-lg mx-auto border border-gray-700">
                          <div className="mb-4 sm:mb-6">
                            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-800 to-red-900 rounded-full flex items-center justify-center">
                              <ExclamationTriangleIcon className="h-8 w-8 sm:h-10 sm:w-10 text-red-400" />
                            </div>
                          </div>
                          <h4 className="text-base sm:text-lg font-semibold text-white mb-2">
                            Preview failed
                          </h4>
                          <p className="text-gray-300 text-sm sm:text-base">
                            Unable to preview this file.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
