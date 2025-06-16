"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  LockClosedIcon,
  LockOpenIcon,
  UsersIcon,
  ClockIcon,
  FolderIcon,
  PlusIcon,
  KeyIcon,
  EyeIcon,
  ArrowDownIcon,
  TrashIcon,
  Cog6ToothIcon,
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  ArchiveBoxIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  BellIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import UserSearchSelector from "@/components/UserSearchSelector";
import {
  PinSetupModal,
  VaultAccessModal,
  NotificationToast,
  VaultDetailsModal,
  VaultPinWaitingModal,
  FileUploadPermissionModal,
} from "@/components/NotificationModals";
import {
  notificationService,
  fallbackNotifications,
} from "@/lib/NotificationService";

export default function SharedVaultPage() {
  const { user, isLoaded } = useUser();
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedVault, setSelectedVault] = useState(null);
  const [userPins, setUserPins] = useState({});
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [vaultFiles, setVaultFiles] = useState([]);
  const [vaultPassword, setVaultPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  // Enhanced state for new features
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showPinSetupModal, setShowPinSetupModal] = useState(false);
  const [showVaultAccessModal, setShowVaultAccessModal] = useState(false);
  const [showVaultDetailsModal, setShowVaultDetailsModal] = useState(false);
  const [pinSetupData, setPinSetupData] = useState(null);
  const [vaultAccessData, setVaultAccessData] = useState(null);
  const [vaultDetailsData, setVaultDetailsData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  // New modals state
  const [showPinWaitingModal, setShowPinWaitingModal] = useState(false);
  const [pinWaitingData, setPinWaitingData] = useState(null);
  const [showFileUploadPermissionModal, setShowFileUploadPermissionModal] =
    useState(false);
  const [fileUploadPermissionData, setFileUploadPermissionData] =
    useState(null);
  // File upload state
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadTags, setUploadTags] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Create vault form state
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    memberEmails: [],
    unlockDurationMinutes: 60,
    memberPins: {},  });
  // Request browser notification permission - regular function
  const requestNotificationPermission = async () => {
    await fallbackNotifications.requestPermission();
  };

  // Show notification - regular function to avoid useCallback issues
  const showNotification = (type, message) => {
    const notification = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date(),
    };

    setNotifications((prev) => [...prev, notification]);
    fallbackNotifications.showBrowserNotification("Shared Vault", message);
  };

  // Load vaults function - regular function to avoid useCallback issues
  const loadVaults = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/shared-vault?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setVaults(data.vaults || []);
      } else {
        console.error("Failed to load vaults");
      }
    } catch (error) {
      console.error("Error loading vaults:", error);
    } finally {
      setLoading(false);
    }  };

  // Notification event handlers - regular functions to avoid circular dependencies
  const handleVaultInvitation = (data) => {
    showNotification(
      "vault_invitation",
      `You've been invited to "${data.vaultName}" by ${data.adminName}`
    );
    loadVaults();
  };

  const handlePinSetupRequired = (data) => {
    setPinSetupData(data);
    setShowPinSetupModal(true);
    showNotification(
      "pin_setup_required",
      `PIN setup required for "${data.vaultName}"`
    );
  };

  const handleVaultUnlockRequest = (data) => {
    setVaultAccessData(data);
    setShowVaultAccessModal(true);
    showNotification(
      "vault_unlock_request",
      `${data.requesterName} is requesting access to "${data.vaultName}"`
    );
  };  const handleVaultUnlocked = (data) => {
    showNotification(
      "vault_unlocked",
      `"${data.vaultName}" has been unlocked for ${data.unlockDurationMinutes} minutes`
    );
    loadVaults();
  };

  const handleVaultLocked = (data) => {
    showNotification("vault_locked", `"${data.vaultName}" has been locked`);
    loadVaults();
  };  const handlePinProgressUpdate = (data) => {
    // Update PIN waiting modal with new progress
    if (showPinWaitingModal && pinWaitingData?.vaultId === data.vaultId) {
      setPinWaitingData((prev) => ({
        ...prev,
        memberProgress: data.memberProgress || [],
      }));

      // Check if all members have entered PINs
      const allEntered = data.memberProgress?.every(
        (member) => member.pinEntered
      );
      if (allEntered) {
        setShowPinWaitingModal(false);
        showNotification(
          "vault_unlocked",
          `"${data.vaultName}" is now unlocked!`
        );
        loadVaults();
      }
    }
  };

  const handleFileUploadRequest = (data) => {
    setFileUploadPermissionData(data);
    setShowFileUploadPermissionModal(true);
    showNotification(
      "file_upload_request",
      `${data.uploaderName} wants to upload "${data.fileName}"`
    );
  };
  const proceedWithApprovedUpload = async (data) => {
    // This would be called when the upload is approved
    console.log("Upload approved, should proceed with upload:", data);
  };

  // Handle upload approval/denial notifications
  const handleUploadApproved = (data) => {
    showNotification("upload_approved", "Your file upload has been approved!");
    // Automatically proceed with upload if this user requested it
    proceedWithApprovedUpload(data);
  };

  const handleUploadDenied = (data) => {
    showNotification(
      "upload_denied",
      `Upload denied: ${data.reason || "No reason provided"}`
    );  };

  // Initialize notification service - regular function
  const initializeNotificationService = () => {
    if (user?.id) {
      notificationService.connect(user.id);

      // Set up event listeners
      notificationService.on('vaultInvitation', handleVaultInvitation);
      notificationService.on("pinSetupRequired", handlePinSetupRequired);
      notificationService.on("vaultUnlockRequest", handleVaultUnlockRequest);
      notificationService.on("vaultUnlocked", handleVaultUnlocked);
      notificationService.on("vaultLocked", handleVaultLocked);
      notificationService.on("pinProgressUpdate", handlePinProgressUpdate);
      notificationService.on("fileUploadRequest", handleFileUploadRequest);
      notificationService.on("uploadApproved", handleUploadApproved);
      notificationService.on("uploadDenied", handleUploadDenied);

      // Cleanup on unmount
      return () => {
        notificationService.off("vaultInvitation", handleVaultInvitation);
        notificationService.off("pinSetupRequired", handlePinSetupRequired);
        notificationService.off("vaultUnlockRequest", handleVaultUnlockRequest);
        notificationService.off("vaultUnlocked", handleVaultUnlocked);
        notificationService.off("vaultLocked", handleVaultLocked);
        notificationService.off("pinProgressUpdate", handlePinProgressUpdate);
        notificationService.off("fileUploadRequest", handleFileUploadRequest);
        notificationService.off("uploadApproved", handleUploadApproved);
        notificationService.off("uploadDenied", handleUploadDenied);
        notificationService.disconnect();
      };
    }
  };
  // Remove notification
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };// Handle file upload approval/denial
  const handleFileUploadApproval = async (fileData, reason) => {
    try {
      const response = await fetch("/api/shared-vault/file-upload-permission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vaultId: fileData.vaultId,
          type: "response",
          uploadRequestId: fileData.requestId,
          approved: true,
          reason,
          reviewerId: user.id,
        }),
      });
      if (response.ok) {
        showNotification(
          "upload_approved",
          "File upload approved successfully"
        );
        setShowFileUploadPermissionModal(false);

        // If this is the current user's vault and files are loaded, refresh them
        if (selectedVault?._id === fileData.vaultId) {
          setTimeout(() => loadVaultFiles(), 1000); // Refresh after a short delay
        }
      } else {
        throw new Error("Failed to approve upload");
      }
    } catch (error) {
      console.error("Error approving upload:", error);
      showNotification("error", "Failed to approve upload");
    }
  };

  const handleFileUploadDenial = async (fileData, reason) => {
    try {
      const response = await fetch("/api/shared-vault/file-upload-permission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vaultId: fileData.vaultId,
          type: "response",
          uploadRequestId: fileData.requestId,
          approved: false,
          reason,
          reviewerId: user.id,
        }),
      });
      if (response.ok) {
        showNotification("upload_denied", "File upload denied");
        setShowFileUploadPermissionModal(false);
      } else {
        throw new Error("Failed to deny upload");
      }
    } catch (error) {
      console.error("Error denying upload:", error);
      showNotification("error", "Failed to process upload decision");
    }
  };

  // Handle file upload to vault
  const handleFileUpload = async () => {
    if (!selectedFile || !selectedVault || !vaultPassword) {
      showNotification("error", "Missing file, vault, or password");
      return;
    }

    setIsUploading(true);
    try {
      // Check if this vault requires upload permissions
      const isAdmin = selectedVault.adminId === user?.id;
      const requiresPermission = selectedVault.memberIds.length > 1 && !isAdmin; // Multi-member vaults require permission unless user is admin

      if (requiresPermission) {
        // Request permission first
        const permissionResponse = await fetch(
          "/api/shared-vault/file-upload-permission",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              vaultId: selectedVault._id,
              type: "request",
              fileName: selectedFile.name,
              fileSize: selectedFile.size,
              fileType: selectedFile.type,
              reason: uploadDescription || "File upload to shared vault",
            }),
          }
        );
        if (permissionResponse.ok) {
          const permissionData = await permissionResponse.json();
          showNotification(
            "permission_requested",
            "Upload permission requested from team members"
          );
          setShowFileUploadModal(false);
          resetFileUploadForm();
          return;
        } else {
          const errorData = await permissionResponse.json();
          throw new Error(
            errorData.error || "Failed to request upload permission"
          );
        }
      } else {
        // Single member vault or admin, upload directly
        await uploadFileDirectly();
      }
    } catch (error) {
      console.error("File upload error:", error);
      showNotification("error", "Failed to upload file: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFileDirectly = async () => {
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("vaultId", selectedVault._id);
    formData.append("vaultPassword", vaultPassword);
    formData.append("description", uploadDescription);
    formData.append("tags", uploadTags);

    const response = await fetch("/api/shared-vault/files", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      showNotification("success", "File uploaded successfully");
      await loadVaultFiles(); // Refresh file list
      setShowFileUploadModal(false);
      resetFileUploadForm();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || "Upload failed");
    }
  };

  const resetFileUploadForm = () => {
    setSelectedFile(null);
    setUploadDescription("");
    setUploadTags("");
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (limit to 10MB for demo)
      if (file.size > 10 * 1024 * 1024) {
        showNotification("error", "File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Handle file preview
  const handleFilePreview = async (file) => {
    try {
      const response = await fetch(
        `/api/shared-vault/files/${file._id}/preview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vaultPassword: vaultPassword,
          }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        // Open preview in new window/tab
        window.open(url, "_blank");

        // Clean up the object URL after some time
        setTimeout(() => URL.revokeObjectURL(url), 10000);

        showNotification("success", "File preview opened");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to preview file");
      }
    } catch (error) {
      console.error("File preview error:", error);
      showNotification("error", "Failed to preview file: " + error.message);
    }
  };

  // Handle file download
  const handleFileDownload = async (file) => {
    try {
      const response = await fetch(
        `/api/shared-vault/files/${file._id}/download`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vaultPassword: vaultPassword,
          }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        // Create download link
        const a = document.createElement("a");
        a.href = url;
        a.download = file.originalName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Clean up the object URL
        URL.revokeObjectURL(url);

        showNotification("success", "File downloaded successfully");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to download file");
      }
    } catch (error) {
      console.error("File download error:", error);
      showNotification("error", "Failed to download file: " + error.message);
    }
  };
  const handleCreateVault = async () => {
    try {
      setLoading(true);

      // Prepare member emails from selected users
      const memberEmails = selectedUsers.map((user) => user.email);

      const vaultData = {
        ...createForm,
        memberEmails,
      };

      const response = await fetch("/api/shared-vault", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vaultData),
      });

      const data = await response.json();

      if (response.ok) {
        setShowCreateModal(false);
        setCreateForm({
          name: "",
          description: "",
          memberEmails: [],
          unlockDurationMinutes: 60,
          memberPins: {},
        });
        setSelectedUsers([]);

        // Send notifications to invited members
        selectedUsers.forEach((user) => {
          notificationService.sendVaultInvitation(user.id, {
            vaultId: data.vault._id,
            vaultName: data.vault.name,
            adminName: user?.fullName || user?.firstName || "Admin",
            adminEmail: user?.primaryEmailAddress?.emailAddress || user?.email,
          });
        });

        await loadVaults();
        showNotification(
          "vault_created",
          `Vault "${data.vault.name}" created successfully`
        );
      } else {
        alert("Failed to create vault: " + data.error);
      }
    } catch (error) {
      alert("Error creating vault: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleUnlockVault = async (vault) => {
    // Check if vault is already unlocked
    if (vault.isUnlocked && vault.remainingUnlockTime > 0) {
      // Vault is already unlocked, open it directly
      openVault(vault);
      return;
    }

    // Check if ALL users have PINs set for this vault
    try {
      const response = await fetch(
        `/api/shared-vault/pins?vaultId=${vault._id}`
      );
      const data = await response.json();

      if (response.ok) {
        // Check if current user has PIN
        if (!data.hasPin) {
          // Current user needs to set PIN first
          setPinSetupData({
            vaultId: vault._id,
            vaultName: vault.name,
          });
          setShowPinSetupModal(true);
          return;
        }

        // Check if all members have PINs set
        if (data.allMembersHavePins) {
          // All users have PINs, show vault access modal
          setVaultAccessData({
            vaultId: vault._id,
            vaultName: vault.name,
            unlockDurationMinutes: vault.unlockDurationMinutes,
            memberIds: vault.memberIds,
          });
          setShowVaultAccessModal(true);
        } else {
          // Some members still need to set PINs
          const membersWithoutPins = data.membersWithoutPins || [];

          // If user is admin, show vault details to see which members need PINs
          if (vault.adminId === user?.id) {
            setVaultDetailsData({
              ...vault,
              membersWithoutPins,
              pinStatus: data.pinStatuses || {},
            });
            setShowVaultDetailsModal(true);
          } else {
            alert(
              `Some members haven't set their PINs yet. Please contact the vault admin.`
            );
          }
        }
      } else {
        throw new Error(data.error || "Failed to check PIN status");
      }
    } catch (error) {
      console.error("Error checking PIN status:", error);
      alert("Failed to check PIN status: " + error.message);
    }
  };

  // Handle vault details/admin view
  const handleViewVaultDetails = async (vault) => {
    try {
      const response = await fetch(
        `/api/shared-vault/pins?vaultId=${vault._id}`
      );
      const data = await response.json();

      setVaultDetailsData({
        ...vault,
        pinStatus: data.pinStatus || {},
        membersWithoutPins: data.membersWithoutPins || [],
      });
      setShowVaultDetailsModal(true);
    } catch (error) {
      console.error("Error loading vault details:", error);
      alert("Failed to load vault details");
    }
  };
  // Handle PIN submission for vault access
  const handleVaultAccessPinSubmit = async (pin) => {
    try {
      const response = await fetch("/api/shared-vault/progressive-unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vaultId: vaultAccessData.vaultId,
          pin: pin,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await loadVaults(); // Refresh to show unlocked status

        if (data.unlocked) {
          openVault(data.vault);
          showNotification(
            "vault_unlocked",
            `Vault "${vaultAccessData.vaultName}" unlocked successfully`
          );
          setShowVaultAccessModal(false);
        } else {
          // Show PIN waiting modal instead of just a notification
          setShowVaultAccessModal(false);
          setPinWaitingData({
            vaultId: vaultAccessData.vaultId,
            vaultName: vaultAccessData.vaultName,
            memberProgress: data.memberProgress || [],
          });
          setShowPinWaitingModal(true);

          // Also show notification
          showNotification(
            "waiting_for_pins",
            "Waiting for other members to enter their PINs"
          );
        }
      } else {
        throw new Error(data.error || "Failed to verify PIN");
      }
    } catch (error) {
      throw error; // Let modal handle the error
    }
  };

  // Handle PIN setup completion
  const handlePinSetupComplete = (vaultId) => {
    showNotification("pin_setup_complete", "PIN set successfully!");
    loadVaults(); // Refresh vault data
  };

  const handlePinSubmit = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/shared-vault/verify-pins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vaultId: selectedVault._id,
          userPins,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowPinModal(false);
        await loadVaults(); // Refresh to show unlocked status
        openVault(selectedVault);
      } else {
        alert("Failed to unlock vault: " + data.error);
      }
    } catch (error) {
      alert("Error unlocking vault: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openVault = async (vault) => {
    setSelectedVault(vault);
    setShowVaultModal(true);
    setVaultPassword("");
    setShowPasswordModal(true);
  };
  const loadVaultFiles = async () => {
    if (!selectedVault || !vaultPassword) return;

    try {
      setLoading(true);
      console.log(`DEBUG: Loading files for vault ${selectedVault._id} (${selectedVault.name})`);
      const response = await fetch(
        `/api/shared-vault/files?vaultId=${selectedVault._id}`
      );
      const data = await response.json();

      if (response.ok) {
        console.log(`DEBUG: API returned ${data.files?.length || 0} files:`, data.files);
        setVaultFiles(data.files || []);
        setShowPasswordModal(false);
      } else {
        console.error("DEBUG: Failed to load vault files:", data.error);
        alert("Failed to load vault files: " + data.error);
      }
    } catch (error) {
      console.error("DEBUG: Error loading vault files:", error);
      alert("Error loading vault files: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith("image/")) return PhotoIcon;
    if (mimeType?.startsWith("video/")) return VideoCameraIcon;
    if (mimeType?.startsWith("audio/")) return MusicalNoteIcon;
    if (mimeType?.includes("pdf")) return DocumentIcon;
    if (mimeType?.includes("zip") || mimeType?.includes("rar"))
      return ArchiveBoxIcon;
    return DocumentIcon;
  };
  const formatTimeRemaining = (minutes) => {
    if (minutes <= 0) return "Expired";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;    return `${hours}h ${mins}m`;
  };

  // Separate useEffects to avoid circular dependencies
  useEffect(() => {
    if (isLoaded && user) {
      requestNotificationPermission();
    }
  }, [isLoaded, user]);

  useEffect(() => {
    if (isLoaded && user) {
      loadVaults();
    }
  }, [isLoaded, user]);

  useEffect(() => {
    if (isLoaded && user) {
      const cleanup = initializeNotificationService();
      return cleanup;
    }
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-theme-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-theme-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-theme-text">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-theme-secondary via-theme-background to-theme-secondary border-b border-theme-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-theme-primary">
                Shared Vaults
              </h1>
              <p className="text-theme-textSecondary">
                Collaborative encrypted vaults with PIN-based access control
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-theme-primary to-theme-primary/80"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Vault
            </Button>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-theme-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-theme-text">Loading vaults...</p>
          </div>
        ) : vaults.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="h-24 w-24 text-theme-textSecondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-theme-primary mb-2">
              No Shared Vaults
            </h3>
            <p className="text-theme-textSecondary mb-6">
              Create your first shared vault to collaborate securely with others
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-theme-primary to-theme-primary/80"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Your First Vault
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaults.map((vault) => (
              <motion.div
                key={vault._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group"
              >
                <Card className="bg-theme-card backdrop-blur-lg border-theme-border hover:border-theme-primary transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {vault.isUnlocked ? (
                          <LockOpenIcon className="h-6 w-6 text-theme-success" />
                        ) : (
                          <LockClosedIcon className="h-6 w-6 text-theme-accent" />
                        )}
                        <div>
                          <CardTitle className="text-lg text-theme-primary ">
                            {vault.name}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {vault.description || "No description"}
                          </CardDescription>
                        </div>{" "}
                      </div>
                      {vault.adminId === user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewVaultDetails(vault)}
                          className="text-theme-textSecondary hover:text-theme-primary p-1"
                          title="View vault details"
                        >
                          <Cog6ToothIcon className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-theme-textSecondary">
                          Status:
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            vault.isUnlocked
                              ? "text-theme-success"
                              : "text-theme-accent"
                          }`}
                        >
                          {vault.isUnlocked ? "Unlocked" : "Locked"}
                        </span>
                      </div>

                      {/* Remaining Time */}
                      {vault.isUnlocked && vault.remainingUnlockTime > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-theme-textSecondary">
                            Time left:
                          </span>
                          <span className="text-sm font-medium text-theme-warning">
                            {formatTimeRemaining(vault.remainingUnlockTime)}
                          </span>
                        </div>
                      )}

                      {/* Members */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-theme-textSecondary">
                          Members:
                        </span>
                        <div className="flex items-center space-x-1">
                          <UsersIcon className="h-4 w-4 text-theme-primary" />
                          <span className="text-sm font-medium text-theme-primary">
                            {vault.members?.length || 0}
                          </span>
                        </div>
                      </div>

                      {/* PIN Status */}
                      <div className="space-y-1">
                        <span className="text-sm text-theme-textSecondary">
                          PIN Status:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {vault.memberPinStatus?.map((status) => (
                            <div
                              key={status.userId}
                              className={`w-3 h-3 rounded-full ${
                                status.hasPinSet
                                  ? "bg-theme-success"
                                  : "bg-theme-accent"
                              }`}
                              title={
                                status.hasPinSet ? "PIN set" : "PIN not set"
                              }
                            />
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-2">
                        {vault.isUnlocked ? (
                          <Button
                            onClick={() => openVault(vault)}
                            className="flex-1 bg-theme-success text-theme-primary hover:bg-theme-success"
                          >
                            <FolderIcon className="h-4 w-4 mr-2" />
                            Open
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleUnlockVault(vault)}
                            className="flex-1 bg-theme-secondary text-theme-primary"
                          >
                            <KeyIcon className="h-4 w-4 mr-2" />
                            Unlock
                          </Button>
                        )}
                        {vault.adminId === user?.id && (
                          <Button
                            onClick={() => handleViewVaultDetails(vault)}
                            variant="outline"
                            size="sm"
                            className="bg-theme-background text-theme-textSecondary hover:text-theme-primary border-theme-border"
                            title="View vault details as admin"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      {/* Create Vault Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-theme-secondary rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-theme-primary mb-4">
                  Create Shared Vault
                </h3>

                <div className="space-y-4">
                  {/* Vault Name */}
                  <div>
                    <label className="block text-sm font-medium text-theme-text mb-2">
                      Vault Name *
                    </label>
                    <Input
                      value={createForm.name}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter vault name"
                      className="bg-theme-background/50"
                    />
                  </div>
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-theme-text mb-2">
                      Description
                    </label>
                    <Input
                      value={createForm.description}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Enter vault description"
                      className="bg-theme-background/50"
                    />
                  </div>
                  {/* Unlock Duration */}
                  <div>
                    <label className="block text-sm font-medium text-theme-text mb-2">
                      Unlock Duration (minutes) *
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={createForm.unlockDurationMinutes}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          unlockDurationMinutes: parseInt(e.target.value) || 60,
                        }))
                      }
                      className="bg-theme-background/50"
                    />
                  </div>{" "}
                  {/* Member Selection with Search */}
                  <div>
                    <label className="block text-sm font-medium text-theme-text mb-2">
                      Add Members *
                    </label>
                    <UserSearchSelector
                      selectedUsers={selectedUsers}
                      onUsersChange={setSelectedUsers}
                      maxUsers={10}
                      excludeUsers={[user?.id]}
                      placeholder="Search users by email or username..."
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button
                    onClick={() => setShowCreateModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>{" "}
                  <Button
                    onClick={handleCreateVault}
                    disabled={
                      !createForm.name || selectedUsers.length === 0 || loading
                    }
                    className="flex-1 bg-gradient-to-r from-theme-primary to-theme-primary/80"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    ) : (
                      <UsersIcon className="h-4 w-4 mr-2" />
                    )}
                    Create Vault
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* PIN Entry Modal */}
      <AnimatePresence>
        {showPinModal && selectedVault && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-theme-secondary rounded-2xl shadow-2xl w-full max-w-md"
            >
              <div className="p-6">
                <div className="text-center mb-6">
                  <KeyIcon className="h-12 w-12 text-theme-primary mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-theme-primary mb-2">
                    Enter PINs
                  </h3>
                  <p className="text-theme-textSecondary">                    All members must enter their PINs to unlock &quot;
                    {selectedVault.name}&quot;
                  </p>
                </div>

                <div className="space-y-4">
                  {selectedVault.memberIds?.map((memberId) => (
                    <div key={memberId}>
                      <label className="block text-sm font-medium text-theme-text mb-2">
                        PIN for {memberId === user?.id ? "You" : memberId}
                      </label>
                      <Input
                        type="password"
                        value={userPins[memberId] || ""}
                        onChange={(e) =>
                          setUserPins((prev) => ({
                            ...prev,
                            [memberId]: e.target.value,
                          }))
                        }
                        placeholder="Enter PIN"
                        className="bg-theme-background/50"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button
                    onClick={() => setShowPinModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePinSubmit}
                    disabled={selectedVault.memberIds?.some(
                      (id) => !userPins[id]
                    )}
                    className="flex-1 bg-gradient-to-r from-theme-primary to-theme-primary/80"
                  >
                    Unlock Vault
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Vault Password Modal */}
      <AnimatePresence>
        {showPasswordModal && selectedVault && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-theme-secondary rounded-2xl shadow-2xl w-full max-w-md"
            >
              <div className="p-6">
                <div className="text-center mb-6">
                  <LockClosedIcon className="h-12 w-12 text-theme-primary mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-theme-primary mb-2">
                    Vault Password
                  </h3>                  <p className="text-theme-textSecondary">
                    Enter the vault password to access files in &quot;
                    {selectedVault.name}&quot;
                  </p>
                </div>

                <div className="space-y-4">
                  <Input
                    type="password"
                    value={vaultPassword}
                    onChange={(e) => setVaultPassword(e.target.value)}
                    placeholder="Enter vault password"
                    className="bg-theme-background/50"
                    onKeyPress={(e) => e.key === "Enter" && loadVaultFiles()}
                  />
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setShowVaultModal(false);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={loadVaultFiles}
                    disabled={!vaultPassword}
                    className="flex-1 bg-gradient-to-r from-theme-primary to-theme-primary/80"
                  >
                    Access Vault
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Vault Files Modal */}
      <AnimatePresence>
        {showVaultModal && selectedVault && !showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-theme-secondary rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-theme-border/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-theme-primary">
                      {selectedVault.name}
                    </h3>
                    <p className="text-theme-textSecondary">
                      {vaultFiles.length} files •
                      {selectedVault.remainingUnlockTime > 0 && (
                        <span className="text-theme-warning ml-1">
                          {formatTimeRemaining(
                            selectedVault.remainingUnlockTime
                          )}{" "}
                          remaining
                        </span>
                      )}
                    </p>{" "}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setShowFileUploadModal(true)}
                      className="bg-gradient-to-r from-theme-primary to-theme-primary/80"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                    <Button
                      onClick={() => {
                        setShowVaultModal(false);
                        setSelectedVault(null);
                        setVaultFiles([]);
                        setVaultPassword("");
                      }}
                      variant="outline"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {vaultFiles.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderIcon className="h-16 w-16 text-theme-textSecondary mx-auto mb-4" />
                    <p className="text-theme-textSecondary">
                      No files in this vault
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vaultFiles.map((file) => {
                      const FileIcon = getFileIcon(file.mimeType);
                      return (
                        <div
                          key={file._id}
                          className="bg-theme-background/50 rounded-lg p-4 border border-theme-border/20 hover:border-theme-primary/50 transition-all"
                        >
                          <div className="flex items-center space-x-3">
                            <FileIcon className="h-10 w-10 text-theme-primary" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-theme-primary truncate">
                                {file.originalName}
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-theme-textSecondary">
                                <span>
                                  {(file.fileSize / 1024).toFixed(1)} KB
                                </span>
                                <span>•</span>
                                <span>
                                  {new Date(
                                    file.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>{" "}
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFilePreview(file)}
                                title="Preview file"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFileDownload(file)}
                                title="Download file"
                              >
                                <ArrowDownIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* PIN Setup Modal */}
      <PinSetupModal
        isOpen={showPinSetupModal}
        onClose={() => setShowPinSetupModal(false)}
        vaultData={pinSetupData}
        onPinSet={handlePinSetupComplete}
      />
      {/* Vault Access Modal */}
      <VaultAccessModal
        isOpen={showVaultAccessModal}
        onClose={() => setShowVaultAccessModal(false)}
        vaultData={vaultAccessData}
        onPinSubmit={handleVaultAccessPinSubmit}
      />{" "}
      {/* Vault Details Modal */}
      <VaultDetailsModal
        isOpen={showVaultDetailsModal}
        onClose={() => setShowVaultDetailsModal(false)}
        vaultData={vaultDetailsData}
      />
      {/* PIN Waiting Modal */}
      <VaultPinWaitingModal
        isOpen={showPinWaitingModal}
        onClose={() => setShowPinWaitingModal(false)}
        vaultData={pinWaitingData}
        memberProgress={pinWaitingData?.memberProgress || []}
      />{" "}
      {/* File Upload Permission Modal */}
      <FileUploadPermissionModal
        isOpen={showFileUploadPermissionModal}
        onClose={() => setShowFileUploadPermissionModal(false)}
        vaultData={fileUploadPermissionData}
        onApprove={handleFileUploadApproval}
        onDeny={handleFileUploadDenial}
      />
      {/* File Upload Modal */}
      <AnimatePresence>
        {showFileUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowFileUploadModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-theme-secondary border border-theme-border/40 rounded-xl shadow-2xl w-full max-w-md p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-theme-primary to-theme-primary/70 rounded-full flex items-center justify-center">
                    <PlusIcon className="h-6 w-6 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-theme-primary">
                      Upload File
                    </h3>
                    <p className="text-theme-textSecondary">
                      {selectedVault?.name || "Vault"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFileUploadModal(false)}
                  className="text-theme-textSecondary hover:text-theme-primary"
                >
                  <XMarkIcon className="h-5 w-5" />
                </Button>
              </div>

              {/* File Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    Select File
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                      accept="*/*"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-theme-border/40 rounded-lg cursor-pointer bg-theme-background/30 hover:bg-theme-background/50 transition-colors"
                    >
                      {selectedFile ? (
                        <div className="text-center">
                          <DocumentIcon className="h-8 w-8 text-theme-primary mx-auto mb-2" />
                          <p className="text-sm font-medium text-theme-primary truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-theme-textSecondary">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <PlusIcon className="h-8 w-8 text-theme-textSecondary mx-auto mb-2" />
                          <p className="text-sm text-theme-textSecondary">
                            Click to select a file
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Describe this file..."
                    className="w-full px-3 py-2 bg-theme-background/50 border border-theme-border/40 rounded-lg text-theme-primary placeholder-theme-textSecondary focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    Tags (optional)
                  </label>
                  <Input
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    placeholder="tag1, tag2, tag3"
                    className="bg-theme-background/50 border-theme-border/40"
                  />
                  <p className="text-xs text-theme-textSecondary mt-1">
                    Separate tags with commas
                  </p>
                </div>{" "}
                {/* Multi-member vault warning */}
                {selectedVault?.memberIds?.length > 1 &&
                  selectedVault?.adminId !== user?.id && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-yellow-300 font-medium">
                            Permission Required
                          </p>
                          <p className="text-xs text-yellow-400">
                            This vault has multiple members. Your upload will
                            require approval from team members.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                {/* Admin privilege notification */}
                {selectedVault?.memberIds?.length > 1 &&
                  selectedVault?.adminId === user?.id && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <ShieldCheckIcon className="h-5 w-5 text-blue-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-blue-300 font-medium">
                            Admin Privileges
                          </p>
                          <p className="text-xs text-blue-400">
                            As vault administrator, you can upload files
                            directly without approval.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              {/* Actions */}
              <div className="flex space-x-3 mt-6">
                <Button
                  onClick={() => setShowFileUploadModal(false)}
                  variant="outline"
                  className="flex-1 text-theme-textSecondary border-theme-border/40"
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isUploading}
                  className="flex-1 bg-gradient-to-r from-theme-primary to-theme-primary/80"
                >
                  {" "}
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : selectedVault?.adminId === user?.id ? (
                    "Upload File"
                  ) : selectedVault?.memberIds?.length > 1 ? (
                    "Request Upload"
                  ) : (
                    "Upload File"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Notification Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </div>
  );
}
