"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  UsersIcon,
  LockClosedIcon,
  XMarkIcon,
  BellIcon,
  ClockIcon,
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// PIN Setup Modal for when user is added to a vault
export function PinSetupModal({ isOpen, onClose, vaultData, onPinSet }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (pin.length < 4) {
      setError("PIN must be at least 4 characters");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/shared-vault/pins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vaultId: vaultData.vaultId,
          pin: pin,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onPinSet(vaultData.vaultId);
        onClose();
        setPin("");
        setConfirmPin("");
      } else {
        setError(data.error || "Failed to set PIN");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPin("");
    setConfirmPin("");
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-theme-background"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-theme-secondary border border-theme-border rounded-xl shadow-2xl w-full max-w-md p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-theme-primary to-theme-primary rounded-full flex items-center justify-center">
                  <KeyIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Set Vault PIN</h3>
                  <p className="text-sm text-theme-textSecondary">Required for vault access</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-theme-textSecondary hover:text-white"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>

            {/* Vault Info */}
            <div className="mb-6 p-4 bg-theme-background border border-theme-border rounded-lg">
              <div className="flex items-center space-x-3">
                <UsersIcon className="h-5 w-5 text-theme-primary" />
                <div>
                  <p className="text-sm font-medium text-white">{vaultData.vaultName}</p>
                  <p className="text-xs text-theme-textSecondary">
                    You've been added to this shared vault
                  </p>
                </div>
              </div>
            </div>

            {/* PIN Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Create PIN
                </label>
                <div className="relative">
                  <Input
                    type={showPin ? "text" : "password"}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter 4+ digit PIN"
                    className="pr-10 bg-theme-background border-theme-border focus:border-theme-primary"
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-textSecondary hover:text-white"
                  >
                    {showPin ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Confirm PIN
                </label>
                <Input
                  type={showPin ? "text" : "password"}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Confirm your PIN"
                  className="bg-theme-background border-theme-border focus:border-theme-primary"
                  maxLength={20}
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-theme-accent text-sm">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  disabled={loading}
                >
                  Later
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-theme-primary to-theme-primary"
                  disabled={loading || pin.length < 4 || pin !== confirmPin}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Set PIN
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Info Note */}
            <div className="mt-4 p-3 bg-theme-primary border border-theme-primary rounded-lg">
              <p className="text-xs text-white">
                <BellIcon className="h-3 w-3 inline mr-1" />
                Your PIN is required along with all other members' PINs to unlock the vault
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Vault Access Modal for entering PIN to unlock vault
export function VaultAccessModal({ isOpen, onClose, vaultData, onPinSubmit }) {
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (pin.length < 4) {
      setError("PIN must be at least 4 characters");
      return;
    }

    setLoading(true);
    try {
      await onPinSubmit(pin);
      setPin("");
      onClose();
    } catch (error) {
      setError(error.message || "Invalid PIN");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPin("");
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-theme-background"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-theme-secondary border border-theme-border rounded-xl shadow-2xl w-full max-w-md p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-theme-accent to-theme-accent rounded-full flex items-center justify-center">
                  <LockClosedIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Enter PIN</h3>
                  <p className="text-sm text-theme-textSecondary">Unlock vault access</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-theme-textSecondary hover:text-white"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>

            {/* Vault Info */}
            <div className="mb-6 p-4 bg-theme-background border border-theme-border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UsersIcon className="h-5 w-5 text-theme-primary" />
                  <div>
                    <p className="text-sm font-medium text-white">{vaultData.vaultName}</p>
                    <p className="text-xs text-theme-textSecondary">
                      {vaultData.requesterName && `${vaultData.requesterName} is requesting access`}
                    </p>
                  </div>
                </div>
                {vaultData.unlockDurationMinutes && (
                  <div className="flex items-center text-xs text-theme-textSecondary">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    {vaultData.unlockDurationMinutes}m
                  </div>
                )}
              </div>
            </div>

            {/* PIN Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Your PIN
                </label>
                <div className="relative">
                  <Input
                    type={showPin ? "text" : "password"}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter your vault PIN"
                    className="pr-10 bg-theme-background border-theme-border focus:border-theme-primary"
                    maxLength={20}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-textSecondary hover:text-white"
                  >
                    {showPin ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-theme-accent text-sm">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-theme-primary to-theme-primary"
                  disabled={loading || pin.length < 4}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <KeyIcon className="h-4 w-4 mr-2" />
                      Unlock
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Info Note */}
            <div className="mt-4 p-3 bg-theme-primary border border-theme-primary rounded-lg">
              <p className="text-xs text-white">
                <BellIcon className="h-3 w-3 inline mr-1" />
                All members must enter their PINs to unlock the vault
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Notification Toast for various vault events
export function NotificationToast({ notification, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);
  const getIcon = () => {
    switch (notification.type) {
      case 'vault_invitation':
        return <UsersIcon className="h-5 w-5" />;
      case 'pin_setup_required':
        return <KeyIcon className="h-5 w-5" />;
      case 'vault_unlock_request':
        return <LockClosedIcon className="h-5 w-5" />;
      case 'vault_unlocked':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'vault_locked':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'file_upload_request':
        return <DocumentIcon className="h-5 w-5" />;
      case 'upload_approved':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'upload_denied':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'permission_requested':
        return <ShieldCheckIcon className="h-5 w-5" />;
      default:
        return <BellIcon className="h-5 w-5" />;
    }
  };
  const getTitle = () => {
    switch (notification.type) {
      case 'vault_invitation':
        return 'Vault Invitation';
      case 'pin_setup_required':
        return 'PIN Setup Required';
      case 'vault_unlock_request':
        return 'Vault Unlock Request';
      case 'vault_unlocked':
        return 'Vault Unlocked';
      case 'vault_locked':
        return 'Vault Locked';
      case 'file_upload_request':
        return 'Upload Request';
      case 'upload_approved':
        return 'Upload Approved';
      case 'upload_denied':
        return 'Upload Denied';
      case 'permission_requested':
        return 'Permission Requested';
      default:
        return 'Notification';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed top-4 right-4 z-50 max-w-sm w-full"
        >
          <div className="bg-theme-secondary border border-theme-border rounded-lg shadow-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-theme-primary to-theme-primary rounded-full flex items-center justify-center text-white">
                  {getIcon()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{getTitle()}</p>
                <p className="text-xs text-theme-textSecondary mt-1">
                  {notification.message}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsVisible(false);
                }}
                className="text-theme-textSecondary hover:text-white p-1"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Vault Details Modal for admin to view member PIN status
export function VaultDetailsModal({ isOpen, onClose, vaultData }) {
  const [memberDetails, setMemberDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && vaultData) {
      loadMemberDetails();
    }
  }, [isOpen, vaultData]);

  const loadMemberDetails = async () => {
    setLoading(true);
    try {
      // Get user details for each member
      const memberPromises = vaultData.memberIds?.map(async (memberId) => {
        try {
          const response = await fetch(`/api/users/${memberId}`);
          if (response.ok) {
            const userData = await response.json();
            return {
              ...userData,
              hasPinSet: vaultData.pinStatus?.[memberId]?.hasPinSet || false,
              pinSetAt: vaultData.pinStatus?.[memberId]?.pinSetAt,
            };
          }
          return {
            id: memberId,
            email: `User ${memberId}`,
            name: 'Unknown User',
            hasPinSet: vaultData.pinStatus?.[memberId]?.hasPinSet || false,
            pinSetAt: vaultData.pinStatus?.[memberId]?.pinSetAt,
          };
        } catch (error) {
          console.error(`Error fetching user ${memberId}:`, error);
          return {
            id: memberId,
            email: `User ${memberId}`,
            name: 'Unknown User',
            hasPinSet: vaultData.pinStatus?.[memberId]?.hasPinSet || false,
            pinSetAt: vaultData.pinStatus?.[memberId]?.pinSetAt,
          };
        }
      }) || [];

      const memberData = await Promise.all(memberPromises);
      setMemberDetails(memberData);
    } catch (error) {
      console.error("Error loading member details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMemberDetails([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-theme-background"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-theme-secondary border border-theme-border rounded-xl shadow-2xl w-full max-w-2xl p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-theme-primary to-theme-primary rounded-full flex items-center justify-center">
                  <UsersIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Vault Details
                  </h3>
                  <p className="text-theme-textSecondary">
                    {vaultData?.name || 'Vault'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-theme-textSecondary hover:text-white"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-theme-background rounded-lg">
                <div>
                  <h4 className="font-medium text-white">Vault Status</h4>
                  <p className="text-sm text-theme-textSecondary">
                    {vaultData?.membersWithoutPins?.length === 0 
                      ? "All members have set their PINs" 
                      : `${vaultData?.membersWithoutPins?.length || 0} members need to set PINs`}
                  </p>
                </div>
                {vaultData?.membersWithoutPins?.length === 0 ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                ) : (
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
                )}
              </div>

              <div>
                <h4 className="font-medium text-white mb-3">Member PIN Status</h4>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-theme-primary mx-auto"></div>
                    <p className="text-theme-textSecondary mt-2">Loading member details...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {memberDetails.map((member, index) => (
                      <div
                        key={member.id || index}
                        className="flex items-center justify-between p-3 bg-theme-background rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            member.hasPinSet 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {member.hasPinSet ? (
                              <CheckCircleIcon className="h-5 w-5" />
                            ) : (
                              <KeyIcon className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {member.name || member.email || 'Unknown User'}
                            </p>
                            <p className="text-xs text-theme-textSecondary">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            member.hasPinSet ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {member.hasPinSet ? 'PIN Set' : 'PIN Needed'}
                          </p>
                          {member.hasPinSet && member.pinSetAt && (
                            <p className="text-xs text-theme-textSecondary">
                              {new Date(member.pinSetAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end mt-6 pt-4 border-t border-theme-border">
              <Button
                variant="outline"
                onClick={handleClose}
                className="text-theme-textSecondary border-theme-border hover:bg-theme-background"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Vault PIN Waiting Modal - shows progress while waiting for all members to enter PINs
export function VaultPinWaitingModal({ isOpen, onClose, vaultData, memberProgress = [] }) {
  const [progress, setProgress] = useState(memberProgress);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    setProgress(memberProgress);
  }, [memberProgress]);

  useEffect(() => {
    if (isOpen) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setTimeElapsed(0);
    }
  }, [isOpen]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const completedCount = progress.filter(member => member.pinEntered).length;
  const totalCount = progress.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleClose = () => {
    setTimeElapsed(0);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-theme-background"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-theme-secondary border border-theme-border rounded-xl shadow-2xl w-full max-w-lg p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <ClockIcon className="h-6 w-6 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Waiting for Team
                  </h3>
                  <p className="text-theme-textSecondary">
                    {vaultData?.vaultName || 'Vault'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-theme-textSecondary">Time waiting</p>
                <p className="text-lg font-mono text-white">{formatTime(timeElapsed)}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-theme-textSecondary">
                  PIN Entry Progress
                </span>
                <span className="text-sm font-medium text-white">
                  {completedCount}/{totalCount}
                </span>
              </div>
              <div className="w-full bg-theme-background rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-theme-primary to-theme-primary h-2 rounded-full"
                />
              </div>
            </div>

            {/* Member Status */}
            <div className="space-y-3 mb-6">
              <h4 className="font-medium text-white">Member Status</h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {progress.map((member, index) => (
                  <div
                    key={member.userId || index}
                    className="flex items-center justify-between p-3 bg-theme-background rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        member.pinEntered 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {member.pinEntered ? (
                          <CheckCircleIcon className="h-5 w-5" />
                        ) : (
                          <ClockIcon className="h-5 w-5 animate-pulse" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {member.name || member.email || 'Team Member'}
                        </p>
                        {member.email && member.name && (
                          <p className="text-xs text-theme-textSecondary">
                            {member.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        member.pinEntered ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {member.pinEntered ? 'PIN Entered' : 'Waiting...'}
                      </p>
                      {member.pinEntered && member.enteredAt && (
                        <p className="text-xs text-theme-textSecondary">
                          {new Date(member.enteredAt).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Section */}
            <div className="bg-theme-background border border-theme-border rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <BellIcon className="h-5 w-5 text-theme-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">
                    Vault Unlock in Progress
                  </p>
                  <p className="text-xs text-theme-textSecondary mt-1">
                    The vault will automatically unlock once all team members have entered their PINs. 
                    You'll receive a notification when it's ready.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="text-theme-textSecondary border-theme-border hover:bg-theme-background"
              >
                Continue Waiting
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// File Upload Permission Modal
export function FileUploadPermissionModal({ isOpen, onClose, vaultData, onApprove, onDeny }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(vaultData, reason);
      onClose();
      setReason("");
    } catch (error) {
      console.error("Error approving upload:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async () => {
    setLoading(true);
    try {
      await onDeny(vaultData, reason);
      onClose();
      setReason("");
    } catch (error) {
      console.error("Error denying upload:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };
  const getFileIcon = () => {
    if (!vaultData?.fileName) return <DocumentIcon className="h-6 w-6" />;
    
    const ext = vaultData.fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <PhotoIcon className="h-6 w-6" />;
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
        return <VideoCameraIcon className="h-6 w-6" />;
      case 'mp3':
      case 'wav':
      case 'flac':
        return <MusicalNoteIcon className="h-6 w-6" />;
      default:
        return <DocumentIcon className="h-6 w-6" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-theme-background"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-theme-secondary border border-theme-border rounded-xl shadow-2xl w-full max-w-md p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-theme-primary to-theme-primary rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Upload Permission
                  </h3>
                  <p className="text-theme-textSecondary">
                    {vaultData?.name || 'Shared Vault'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-theme-textSecondary hover:text-white"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>

            {/* File Details */}
            <div className="bg-theme-background rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 text-theme-primary">
                  {getFileIcon()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">
                    {vaultData?.fileName || 'Unknown file'}
                  </p>
                  <p className="text-sm text-theme-textSecondary">
                    {vaultData?.fileSize ? formatFileSize(vaultData.fileSize) : 'Unknown size'}
                  </p>
                  {vaultData?.fileType && (
                    <p className="text-xs text-theme-textSecondary">
                      {vaultData.fileType}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Request Message */}
            <div className="mb-6">
              <div className="flex items-start space-x-3 mb-4">
                {vaultData?.isAdmin && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <ShieldCheckIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm text-white mb-2">
                    <span className="font-medium">{vaultData?.uploaderName || 'A team member'}</span> wants to upload this file to the shared vault.
                  </p>
                  {vaultData?.isAdmin && (
                    <p className="text-xs text-blue-400">
                      As vault administrator, your approval will allow this upload.
                    </p>
                  )}
                  {vaultData?.reason && vaultData.reason !== 'No reason provided' && (
                    <div className="mt-2 p-2 bg-theme-background rounded text-xs text-theme-textSecondary">
                      <strong>Reason:</strong> {vaultData.reason}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Add a note (optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Add any comments about this decision..."
                  className="w-full px-3 py-2 bg-theme-background border border-theme-border rounded-lg text-white placeholder-theme-textSecondary focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <Button
                onClick={handleDeny}
                disabled={loading}
                variant="outline"
                className="flex-1 text-red-400 border-red-400 hover:bg-red-400"
              >
                {loading ? 'Processing...' : 'Deny'}
              </Button>
              <Button
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? 'Processing...' : 'Approve'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
