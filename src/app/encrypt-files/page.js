"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  encryptFile,
  decryptFile,
  validatePassword,
} from "@/lib/clientEncryption";
import {
  storeEncryptedFile,
  getEncryptedFile,
  listEncryptedFiles,
  deleteEncryptedFile,
  exportVaultFile,
  importVaultFile,
  getStorageStats,
  clearAllFiles,
} from "@/lib/localVault";
import PasswordStrengthIndicator from "@/components/PasswordStrengthIndicator";
import {
  Lock,
  Archive,
  Settings,
  Upload,
  Download,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  FileText,
  Shield,
  AlertTriangle,
  Key,
  HardDrive,
} from "lucide-react";

export default function EncryptFilesPage() {
  const { user } = useUser();
  const [selectedFile, setSelectedFile] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValidation, setPasswordValidation] = useState(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [encryptedFiles, setEncryptedFiles] = useState([]);
  const [storageStats, setStorageStats] = useState(null);
  const [activeTab, setActiveTab] = useState("encrypt");  const [decryptPassword, setDecryptPassword] = useState("");  const [selectedEncryptedFile, setSelectedEncryptedFile] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  // Helper functions
  const showNotification = useCallback((message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const loadEncryptedFiles = useCallback(async () => {
    try {
      const files = await listEncryptedFiles();
      setEncryptedFiles(files);
    } catch (error) {
      console.error("Error loading encrypted files:", error);
      showNotification("Failed to load encrypted files", "error");
    }
  }, [showNotification]);

  const loadStorageStats = useCallback(async () => {
    try {
      const stats = await getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error("Error loading storage stats:", error);
    }
  }, []);

  // Load encrypted files and storage stats on component mount
  useEffect(() => {
    loadEncryptedFiles();
    loadStorageStats();
  }, [loadEncryptedFiles, loadStorageStats]);

  // Validate password in real-time
  useEffect(() => {
    if (password) {
      setPasswordValidation(validatePassword(password));
    } else {
      setPasswordValidation(null);
    }  }, [password]);
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    
    if (dragCounter === 1) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      showNotification(`File "${file.name}" selected for encryption`, 'success');
    }
  };

  const handleFileInputClick = (e) => {
    // Allow file input to work normally when clicked
    e.stopPropagation();
  };

  const handleEncrypt = async () => {
    if (!selectedFile || !password || !passwordValidation?.isValid) {
      showNotification(
        "Please select a file and enter a valid password",
        "error"
      );
      return;
    }

    if (password !== confirmPassword) {
      showNotification("Passwords do not match", "error");
      return;
    }

    setIsEncrypting(true);
    try {
      // Encrypt file on client-side
      const encryptedData = await encryptFile(selectedFile, password);
      // Store encrypted file locally
      const localFileId = await storeEncryptedFile(encryptedData);

      // Store metadata in MongoDB
      if (user) {
        try {
          const response = await fetch("/api/encrypt-files", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fileName: encryptedData.fileName,
              fileType: encryptedData.fileType,
              fileSize: encryptedData.fileSize,
              salt: encryptedData.salt,
              iv: encryptedData.iv,
              keyHash: encryptedData.keyHash,
              localFileId,
              userId: user.id,
            }),
          });

          if (!response.ok) {
            console.warn(
              "Failed to store metadata in database:",
              await response.text()
            );
          }
        } catch (error) {
          console.warn("Failed to store metadata in database:", error);
          // Continue anyway since the file is stored locally
        }
      }

      // Reset form
      setSelectedFile(null);
      setPassword("");
      setConfirmPassword("");

      // Reload files and stats
      await loadEncryptedFiles();
      await loadStorageStats();

      showNotification(
        `File "${selectedFile.name}" encrypted and stored successfully!`,
        "success"
      );

      // Reset file input
      const fileInput = document.getElementById("file-input");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Encryption error:", error);
      showNotification("Failed to encrypt file: " + error.message, "error");
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleDecrypt = async (fileId) => {
    if (!decryptPassword) {
      showNotification("Please enter the decryption password", "error");
      return;
    }

    setIsDecrypting(true);
    try {
      // Get encrypted file from local storage
      const encryptedFileData = await getEncryptedFile(fileId);

      // Decrypt file on client-side
      const decryptedFile = await decryptFile(
        encryptedFileData,
        decryptPassword
      );

      // Download decrypted file
      const url = URL.createObjectURL(decryptedFile);
      const a = document.createElement("a");
      a.href = url;
      a.download = decryptedFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      // Update last accessed timestamp in metadata
      if (user) {
        try {
          await fetch("/api/encrypt-files", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              metadataId: encryptedFileData.metadataId,
              userId: user.id,
              lastAccessed: new Date().toISOString(),
            }),
          });
        } catch (error) {
          console.warn("Failed to update metadata:", error);
          // Continue anyway since decryption was successful
        }
      }

      setDecryptPassword("");
      setSelectedEncryptedFile(null);
      showNotification(
        `File "${decryptedFile.name}" decrypted and downloaded!`,
        "success"
      );
    } catch (error) {
      console.error("Decryption error:", error);
      if (error.message === "Invalid password") {
        showNotification("Invalid password. Please try again.", "error");
      } else {
        showNotification("Failed to decrypt file: " + error.message, "error");
      }
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleDeleteFile = async (fileId, fileName) => {
    if (
      !confirm(
        `Are you sure you want to delete "${fileName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteEncryptedFile(fileId);
      await loadEncryptedFiles();
      await loadStorageStats();
      showNotification(`File "${fileName}" deleted successfully`, "success");
    } catch (error) {
      console.error("Delete error:", error);
      showNotification("Failed to delete file: " + error.message, "error");
    }
  };

  const handleExportFile = async (fileId) => {
    try {
      await exportVaultFile(fileId);
      showNotification("File exported as .vault file", "success");
    } catch (error) {
      console.error("Export error:", error);
      showNotification("Failed to export file: " + error.message, "error");
    }
  };
  const handleImportFile = async (event) => {
    const file = event.target.files[0];
    if (!file || !file.name.endsWith(".vault")) {
      showNotification("Please select a valid .vault file", "error");
      return;
    }

    try {
      await importVaultFile(file);
      await loadEncryptedFiles();
      await loadStorageStats();
      showNotification("Vault file imported successfully", "success");

      // Reset file input
      event.target.value = "";
    } catch (error) {
      console.error("Import error:", error);
      showNotification("Failed to import file: " + error.message, "error");
    }
  };

  // Drag and drop handlers for vault import
  const handleVaultDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleVaultDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleVaultDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleVaultDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.name.endsWith(".vault")) {
        showNotification("Please drop a valid .vault file", "error");
        return;
      }
      
      importVaultFile(file)
        .then(() => {
          loadEncryptedFiles();
          loadStorageStats();
          showNotification("Vault file imported successfully", "success");
        })
        .catch((error) => {
          console.error("Import error:", error);
          showNotification("Failed to import file: " + error.message, "error");
        });
    }
  };

  const handleClearAllFiles = async () => {
    if (
      !confirm(
        "Are you sure you want to delete ALL encrypted files? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await clearAllFiles();
      await loadEncryptedFiles();
      await loadStorageStats();
      showNotification("All files cleared successfully", "success");
    } catch (error) {
      console.error("Clear error:", error);
      showNotification("Failed to clear files: " + error.message, "error");
    }
  };
  return (
    <div className="min-h-screen bg-theme-background">
      <div className="container mx-auto px-4 py-6 md:py-8 lg:py-12 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-theme-primary/10 rounded-xl mr-4">
              <Lock className="h-8 w-8 md:h-10 md:w-10 text-theme-primary" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-theme-text">
                File Encryption Vault
              </h1>
              <div className="flex items-center mt-2">
                <Shield className="h-4 w-4 text-theme-success mr-2" />
                <span className="text-sm text-theme-textSecondary">Military-grade security</span>
              </div>
            </div>
          </div>
          <p className="text-base md:text-lg text-theme-textSecondary max-w-2xl mx-auto leading-relaxed">
            Encrypt files client-side with AES-256-GCM encryption. Your files never leave your device,
            ensuring maximum privacy and security.
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-xl border ${
            notification.type === "success"
              ? "bg-theme-success/10 text-theme-success border-theme-success/20"
              : "bg-theme-error/10 text-theme-error border-theme-error/20"
          } animate-in fade-in duration-300`}>
            <div className="flex items-start">
              {notification.type === "success" ? (
                <Shield className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
              )}
              <span className="text-sm md:text-base">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Storage Stats */}
        {storageStats && (
          <div className="mb-8 lg:mb-12">
            <h2 className="text-lg font-semibold text-theme-text mb-4 flex items-center">
              <HardDrive className="h-5 w-5 mr-2 text-theme-primary" />
              Storage Overview
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card-theme p-4 md:p-6">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="h-5 w-5 text-theme-primary" />
                  <span className="text-xs text-theme-textSecondary">Files</span>
                </div>
                <div className="text-2xl font-bold text-theme-text">{storageStats.totalFiles}</div>
                <div className="text-xs text-theme-textSecondary">Total Files</div>
              </div>
              <div className="card-theme p-4 md:p-6">
                <div className="flex items-center justify-between mb-2">
                  <Archive className="h-5 w-5 text-theme-success" />
                  <span className="text-xs text-theme-textSecondary">Size</span>
                </div>
                <div className="text-2xl font-bold text-theme-text">{storageStats.formattedTotalSize}</div>
                <div className="text-xs text-theme-textSecondary">Data Size</div>
              </div>
              <div className="card-theme p-4 md:p-6">
                <div className="flex items-center justify-between mb-2">
                  <HardDrive className="h-5 w-5 text-theme-warning" />
                  <span className="text-xs text-theme-textSecondary">Used</span>
                </div>
                <div className="text-2xl font-bold text-theme-text">{storageStats.formattedStorageUsed}</div>
                <div className="text-xs text-theme-textSecondary">Storage Used</div>
              </div>
              <div className="card-theme p-4 md:p-6">
                <div className="flex items-center justify-between mb-2">
                  <Download className="h-5 w-5 text-theme-accent" />
                  <span className="text-xs text-theme-textSecondary">Available</span>
                </div>
                <div className="text-2xl font-bold text-theme-text">{storageStats.formattedStorageQuota}</div>
                <div className="text-xs text-theme-textSecondary">Space Left</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6 lg:mb-8">
          <div className="bg-theme-secondary rounded-xl p-1">
            <nav className="flex space-x-1">
              <button
                onClick={() => setActiveTab("encrypt")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === "encrypt"
                    ? "bg-theme-primary text-white shadow-lg"
                    : "text-theme-textSecondary hover:text-theme-text hover:bg-theme-background/50"
                }`}
              >
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Encrypt Files</span>
                <span className="sm:hidden">Encrypt</span>
              </button>
              <button
                onClick={() => setActiveTab("vault")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === "vault"
                    ? "bg-theme-primary text-white shadow-lg"
                    : "text-theme-textSecondary hover:text-theme-text hover:bg-theme-background/50"
                }`}
              >
                <Archive className="h-4 w-4" />
                <span className="hidden sm:inline">My Vault</span>
                <span className="sm:hidden">Vault</span>
                <span className="ml-1 px-2 py-0.5 bg-theme-primary/20 text-xs rounded-full">
                  {encryptedFiles.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("tools")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === "tools"
                    ? "bg-theme-primary text-white shadow-lg"
                    : "text-theme-textSecondary hover:text-theme-text hover:bg-theme-background/50"
                }`}
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Tools</span>
                <span className="sm:hidden">Tools</span>
              </button>
            </nav>
          </div>
        </div>        {/* Encrypt Tab */}
        {activeTab === "encrypt" && (
          <div className="card-theme p-6 lg:p-8">
            <div className="flex items-center mb-6">
              <Lock className="h-6 w-6 text-theme-primary mr-3" />
              <h2 className="text-xl lg:text-2xl font-semibold text-theme-text">
                Encrypt New File
              </h2>
            </div>
              {/* File Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-theme-text mb-3">
                Select File to Encrypt
              </label>
              
              {/* Drag and Drop Area */}
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                  isDragOver
                    ? 'border-theme-primary bg-theme-primary/10 scale-105'
                    : selectedFile
                    ? 'border-theme-success bg-theme-success/5'
                    : 'border-theme-border/30 bg-theme-inputBackground hover:border-theme-primary/50 hover:bg-theme-primary/5'
                }`}
              >
                {isDragOver ? (
                  <div className="flex flex-col items-center">
                    <div className="p-4 bg-theme-primary/20 rounded-full mb-4">
                      <Upload className="h-8 w-8 text-theme-primary animate-bounce" />
                    </div>
                    <p className="text-lg font-semibold text-theme-primary mb-2">
                      Drop your file here
                    </p>
                    <p className="text-sm text-theme-textSecondary">
                      Release to select the file for encryption
                    </p>
                  </div>
                ) : selectedFile ? (
                  <div className="flex flex-col items-center">
                    <div className="p-4 bg-theme-success/20 rounded-full mb-4">
                      <FileText className="h-8 w-8 text-theme-success" />
                    </div>
                    <p className="text-lg font-semibold text-theme-text mb-2">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-theme-textSecondary mb-4">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || 'Unknown type'}
                    </p>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-theme-error hover:text-theme-error/80 text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="p-4 bg-theme-primary/10 rounded-full mb-4">
                      <Upload className="h-8 w-8 text-theme-primary" />
                    </div>
                    <p className="text-lg font-semibold text-theme-text mb-2">
                      Drag & drop your file here
                    </p>
                    <p className="text-sm text-theme-textSecondary mb-4">
                      or click to browse and select a file
                    </p>
                    <div className="flex items-center gap-4 text-xs text-theme-textSecondary">
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        <span>Client-side encryption</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        <span>AES-256-GCM</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Hidden file input */}
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileSelect}
                  onClick={handleFileInputClick}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              
              {/* File type support info */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-theme-textSecondary">
                <span>Supported:</span>
                <span className="px-2 py-1 bg-theme-primary/10 rounded">Documents</span>
                <span className="px-2 py-1 bg-theme-primary/10 rounded">Images</span>
                <span className="px-2 py-1 bg-theme-primary/10 rounded">Videos</span>
                <span className="px-2 py-1 bg-theme-primary/10 rounded">Archives</span>
                <span className="px-2 py-1 bg-theme-primary/10 rounded">Any file type</span>
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-theme-text mb-3">
                Encryption Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-theme w-full"
                placeholder="Enter a strong password"
              />
              <PasswordStrengthIndicator
                password={password}
                validation={passwordValidation}
              />
            </div>

            {/* Confirm Password */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-theme-text mb-3">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-theme w-full"
                placeholder="Confirm your password"
              />
              {confirmPassword && password !== confirmPassword && (
                <div className="mt-2 flex items-center text-sm text-theme-error">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Passwords do not match
                </div>
              )}
            </div>

            {/* Encrypt Button */}
            <button
              onClick={handleEncrypt}
              disabled={
                !selectedFile ||
                !password ||
                !passwordValidation?.isValid ||
                password !== confirmPassword ||
                isEncrypting
              }
              className="btn-primary w-full py-4 px-6 rounded-xl font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:shadow-lg"
            >
              {isEncrypting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Encrypting your file...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 mr-3" />
                  Encrypt File Securely
                </>
              )}
            </button>

            {/* Security Note */}
            <div className="mt-6 p-4 bg-theme-accent/10 rounded-lg border border-theme-accent/20">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-theme-accent mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-theme-textSecondary">
                  <p className="font-medium text-theme-text mb-1">Client-side Encryption</p>
                  <p>Your file is encrypted locally in your browser using AES-256-GCM. The original file and password never leave your device.</p>
                </div>
              </div>
            </div>
          </div>
        )}        {/* Vault Tab */}
        {activeTab === "vault" && (
          <div className="card-theme p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center">
                <Archive className="h-6 w-6 text-theme-primary mr-3" />
                <h2 className="text-xl lg:text-2xl font-semibold text-theme-text">
                  My Encrypted Files
                </h2>
              </div>
              <button
                onClick={() => loadEncryptedFiles()}
                className="btn-outline-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 self-start"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            {encryptedFiles.length === 0 ? (
              <div className="text-center py-12 lg:py-16">
                <div className="max-w-md mx-auto">
                  <div className="p-6 bg-theme-primary/10 rounded-full w-fit mx-auto mb-6">
                    <Archive className="h-12 w-12 text-theme-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-theme-text mb-2">
                    No encrypted files yet
                  </h3>
                  <p className="text-theme-textSecondary mb-6">
                    Encrypt your first file to get started with secure storage.
                  </p>
                  <button
                    onClick={() => setActiveTab("encrypt")}
                    className="btn-primary px-6 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto"
                  >
                    <Lock className="h-4 w-4" />
                    Encrypt File
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {encryptedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="bg-theme-inputBackground border border-theme-border/20 rounded-xl p-4 lg:p-6 hover:border-theme-primary/30 transition-all duration-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-2">
                          <FileText className="h-5 w-5 text-theme-primary mr-2 flex-shrink-0" />
                          <h3 className="font-semibold text-theme-text truncate">
                            {file.fileName}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-theme-textSecondary">
                          <span className="bg-theme-primary/10 px-2 py-1 rounded">
                            {file.fileType}
                          </span>
                          <span>•</span>
                          <span>{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                          <span>•</span>
                          <span>Added {new Date(file.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedEncryptedFile(file.id)}
                          className="bg-theme-success/10 hover:bg-theme-success/20 text-theme-success px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                          <Key className="h-4 w-4" />
                          <span className="hidden sm:inline">Decrypt</span>
                        </button>
                        <button
                          onClick={() => handleExportFile(file.id)}
                          className="bg-theme-accent/10 hover:bg-theme-accent/20 text-theme-accent px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                          <span className="hidden sm:inline">Export</span>
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.id, file.fileName)}
                          className="bg-theme-error/10 hover:bg-theme-error/20 text-theme-error px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Decrypt Form */}
                    {selectedEncryptedFile === file.id && (
                      <div className="mt-6 pt-6 border-t border-theme-border/20">
                        <div className="bg-theme-background/50 rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            <Key className="h-5 w-5 text-theme-primary mr-2" />
                            <span className="font-medium text-theme-text">Enter decryption password</span>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input
                              type="password"
                              value={decryptPassword}
                              onChange={(e) => setDecryptPassword(e.target.value)}
                              placeholder="Password for this file"
                              className="input-theme flex-1"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDecrypt(file.id)}
                                disabled={!decryptPassword || isDecrypting}
                                className="btn-primary px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                              >
                                {isDecrypting ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span className="hidden sm:inline">Decrypting...</span>
                                  </>
                                ) : (
                                  <>
                                    <Download className="h-4 w-4" />
                                    <span className="hidden sm:inline">Decrypt & Download</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedEncryptedFile(null);
                                  setDecryptPassword("");
                                }}
                                className="bg-theme-secondary text-theme-textSecondary hover:text-theme-text px-4 py-2 rounded-lg font-medium transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}        {/* Tools Tab */}
        {activeTab === "tools" && (
          <div className="card-theme p-6 lg:p-8">
            <div className="flex items-center mb-8">
              <Settings className="h-6 w-6 text-theme-primary mr-3" />
              <h2 className="text-xl lg:text-2xl font-semibold text-theme-text">
                Vault Management Tools
              </h2>
            </div>

            <div className="grid gap-6 lg:gap-8">              {/* Import Vault File */}
              <div className="bg-theme-inputBackground border border-theme-border/20 rounded-xl p-6 hover:border-theme-primary/30 transition-all duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-theme-accent/10 rounded-lg">
                    <Download className="h-5 w-5 text-theme-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-theme-text">Import Vault File</h3>
                    <p className="text-sm text-theme-textSecondary">
                      Restore a previously exported .vault file
                    </p>
                  </div>
                </div>
                
                {/* Drag and Drop Area for Vault Import */}
                <div
                  onDragEnter={handleVaultDragEnter}
                  onDragLeave={handleVaultDragLeave}
                  onDragOver={handleVaultDragOver}
                  onDrop={handleVaultDrop}
                  className="relative border-2 border-dashed border-theme-accent/30 rounded-lg p-6 text-center hover:border-theme-accent/50 hover:bg-theme-accent/5 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-theme-accent/10 rounded-lg mb-3">
                      <Download className="h-6 w-6 text-theme-accent" />
                    </div>
                    <p className="text-sm font-medium text-theme-text mb-1">
                      Drop .vault file here or click to browse
                    </p>
                    <p className="text-xs text-theme-textSecondary">
                      Only .vault files are supported
                    </p>
                  </div>
                  
                  <input
                    type="file"
                    accept=".vault"
                    onChange={handleImportFile}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                
                <div className="mt-3 flex items-start text-xs text-theme-textSecondary">
                  <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Only import .vault files from trusted sources. Imported files will be added to your local vault.</span>
                </div>
              </div>

              {/* Export All Files */}
              <div className="bg-theme-inputBackground border border-theme-border/20 rounded-xl p-6 hover:border-theme-primary/30 transition-all duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-theme-primary/10 rounded-lg">
                    <Upload className="h-5 w-5 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-theme-text">Backup Vault</h3>
                    <p className="text-sm text-theme-textSecondary">
                      Create a backup of your entire vault
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    encryptedFiles.forEach(file => handleExportFile(file.id));
                    showNotification('All files exported successfully', 'success');
                  }}
                  disabled={encryptedFiles.length === 0}
                  className="btn-primary px-6 py-3 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="h-4 w-4" />
                  Export All Files
                </button>
              </div>

              {/* Storage Management */}
              <div className="bg-theme-inputBackground border border-theme-warning/20 rounded-xl p-6 hover:border-theme-warning/30 transition-all duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-theme-warning/10 rounded-lg">
                    <HardDrive className="h-5 w-5 text-theme-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-theme-text">Storage Management</h3>
                    <p className="text-sm text-theme-textSecondary">
                      Manage your local storage and clear cache
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {storageStats && (
                    <div className="bg-theme-background/50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-theme-textSecondary">Storage Used:</span>
                          <span className="ml-2 font-medium text-theme-text">
                            {storageStats.formattedStorageUsed}
                          </span>
                        </div>
                        <div>
                          <span className="text-theme-textSecondary">Available:</span>
                          <span className="ml-2 font-medium text-theme-text">
                            {storageStats.formattedStorageQuota}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      if (window.caches) {
                        caches.keys().then(names => {
                          names.forEach(name => caches.delete(name));
                        });
                      }
                      showNotification('Cache cleared successfully', 'success');
                    }}
                    className="bg-theme-warning/10 hover:bg-theme-warning/20 text-theme-warning px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Clear Cache
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-theme-error/5 border border-theme-error/20 rounded-xl p-6 hover:border-theme-error/30 transition-all duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-theme-error/10 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-theme-error" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-theme-error">Danger Zone</h3>
                    <p className="text-sm text-theme-textSecondary">
                      Irreversible actions that will permanently delete your data
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-theme-background/50 rounded-lg p-4">
                    <div className="flex items-start text-sm text-theme-textSecondary mb-3">
                      <Shield className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-theme-error" />
                      <span>This will permanently delete all encrypted files from your local storage. This action cannot be undone and your files will be lost forever.</span>
                    </div>
                    <button
                      onClick={handleClearAllFiles}
                      disabled={encryptedFiles.length === 0}
                      className="bg-theme-error hover:bg-theme-error/90 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear All Files
                    </button>
                  </div>
                </div>
              </div>

              {/* Security Information */}
              <div className="bg-theme-primary/5 border border-theme-primary/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-theme-primary/10 rounded-lg">
                    <Shield className="h-5 w-5 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-theme-text">Security Features</h3>
                    <p className="text-sm text-theme-textSecondary">
                      Advanced encryption and security measures
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start text-sm">
                      <div className="w-2 h-2 bg-theme-success rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-theme-text">AES-256-GCM Encryption</span>
                        <p className="text-theme-textSecondary">Military-grade encryption standard</p>
                      </div>
                    </div>
                    <div className="flex items-start text-sm">
                      <div className="w-2 h-2 bg-theme-success rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-theme-text">PBKDF2 Key Derivation</span>
                        <p className="text-theme-textSecondary">100,000 iterations for password security</p>
                      </div>
                    </div>
                    <div className="flex items-start text-sm">
                      <div className="w-2 h-2 bg-theme-success rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-theme-text">Client-side Processing</span>
                        <p className="text-theme-textSecondary">All encryption happens in your browser</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start text-sm">
                      <div className="w-2 h-2 bg-theme-success rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-theme-text">Zero-Knowledge Architecture</span>
                        <p className="text-theme-textSecondary">We never see your files or passwords</p>
                      </div>
                    </div>
                    <div className="flex items-start text-sm">
                      <div className="w-2 h-2 bg-theme-success rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-theme-text">Local Storage Only</span>
                        <p className="text-theme-textSecondary">Files stored securely on your device</p>
                      </div>
                    </div>
                    <div className="flex items-start text-sm">
                      <div className="w-2 h-2 bg-theme-success rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-theme-text">Metadata Protection</span>
                        <p className="text-theme-textSecondary">Only basic file info stored remotely</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
