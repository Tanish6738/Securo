"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
// import { Button } from "@/components/ui/Button";
// import { Input } from "@/components/ui/Input";
export default function SetPinPage() {
  const { user, isLoaded } = useUser();
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVault, setSelectedVault] = useState(null);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);  useEffect(() => {
    if (isLoaded && user) {
      loadVaultsWithoutPins();
    }
  }, [isLoaded, user, loadVaultsWithoutPins]);

  const loadVaultsWithoutPins = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/shared-vault");
      const data = await response.json();

      if (response.ok) {
        // Filter vaults where user hasn&apos;t set PIN yet
        const vaultsNeedingPins = data.vaults?.filter(vault => {
          const userPinStatus = vault.memberPinStatus?.find(
            status => status.userId === user.id
          );
          return userPinStatus && !userPinStatus.hasPinSet;
        }) || [];
        setVaults(vaultsNeedingPins);
      } else {
        console.error("Failed to load vaults:", data.error);
      }
    } catch (error) {      console.error("Error loading vaults:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleSetPin = async () => {
    if (pin !== confirmPin) {
      alert("PINs don&apos;t match");
      return;
    }

    if (pin.length < 4) {
      alert("PIN must be at least 4 characters");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/shared-vault/pins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vaultId: selectedVault._id,
          pin,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("PIN set successfully!");
        setPin("");
        setConfirmPin("");
        setSelectedVault(null);
        await loadVaultsWithoutPins();
      } else {
        alert("Failed to set PIN: " + data.error);
      }
    } catch (error) {
      alert("Error setting PIN: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const isPinValid = pin.length >= 4 && pin === confirmPin;

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <KeyIcon className="h-16 w-16 text-theme-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Set Your Vault PINs</h1>
            <p className="text-theme-textSecondary">
              Set secure PINs for shared vaults you&apos;ve been invited to
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-theme-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-theme-text">Loading vaults...</p>
          </div>
        ) : vaults.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircleIcon className="h-24 w-24 text-theme-success mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">All Set!</h3>            <p className="text-theme-textSecondary">
              You&apos;ve set PINs for all your shared vaults. You can change them anytime from the vault settings.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Instructions */}
            <Card className="bg-theme-card/80 backdrop-blur-lg border-theme-warning/30">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <ExclamationTriangleIcon className="h-6 w-6 text-theme-warning" />
                  <div>
                    <CardTitle className="text-lg text-white">PIN Setup Required</CardTitle>                    <CardDescription>
                      Set secure PINs for the vaults you&apos;ve been invited to. All members must enter their PINs to unlock a vault.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-theme-background/50 rounded-lg p-4">
                  <h4 className="font-semibold text-theme-text mb-2">PIN Requirements:</h4>
                  <ul className="text-sm text-theme-textSecondary space-y-1">
                    <li>• Minimum 4 characters</li>
                    <li>• Use a unique PIN for each vault</li>
                    <li>• Don&apos;t reuse passwords or easily guessable numbers</li>
                    <li>• Consider using a mix of numbers and letters</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Vault Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vaults.map((vault) => (
                <motion.div
                  key={vault._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group"
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedVault?._id === vault._id
                        ? "bg-theme-primary/10 border-theme-primary"
                        : "bg-theme-card/80 backdrop-blur-lg border-theme-border/40 hover:border-theme-primary/50"
                    }`}
                    onClick={() => setSelectedVault(vault)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg text-white">{vault.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {vault.description || "No description"}
                          </CardDescription>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedVault?._id === vault._id
                            ? "bg-theme-primary border-theme-primary"
                            : "border-theme-border"
                        }`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-theme-textSecondary">Members:</span>
                        <span className="text-white">{vault.members?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-theme-textSecondary">Admin:</span>
                        <span className="text-white">{vault.admin?.email || "Unknown"}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* PIN Setting Form */}
            <AnimatePresence>
              {selectedVault && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Card className="bg-theme-card/80 backdrop-blur-lg border-theme-primary/30">
                    <CardHeader>                      <CardTitle className="text-lg text-white">
                        Set PIN for &quot;{selectedVault.name}&quot;
                      </CardTitle>
                      <CardDescription>
                        Create a secure PIN for this vault. You&apos;ll need this to unlock the vault along with other members.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* PIN Input */}
                      <div>
                        <label className="block text-sm font-medium text-theme-text mb-2">
                          PIN *
                        </label>
                        <div className="relative">
                          <Input
                            type={showPin ? "text" : "password"}
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="Enter your PIN"
                            className="pr-10 bg-theme-background/50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPin(!showPin)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-textSecondary hover:text-theme-text"
                          >
                            {showPin ? (
                              <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Confirm PIN */}
                      <div>
                        <label className="block text-sm font-medium text-theme-text mb-2">
                          Confirm PIN *
                        </label>
                        <div className="relative">
                          <Input
                            type={showConfirmPin ? "text" : "password"}
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value)}
                            placeholder="Confirm your PIN"
                            className="pr-10 bg-theme-background/50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPin(!showConfirmPin)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-textSecondary hover:text-theme-text"
                          >
                            {showConfirmPin ? (
                              <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {confirmPin && pin !== confirmPin && (
                          <p className="text-sm text-theme-error mt-1">PINs don&apos;t match</p>
                        )}
                      </div>

                      {/* PIN Strength Indicator */}
                      {pin && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-full h-2 rounded-full bg-theme-background ${
                              pin.length >= 8 
                                ? "bg-theme-success" 
                                : pin.length >= 6 
                                ? "bg-theme-warning" 
                                : "bg-theme-error"
                            }`} />
                            <span className={`text-xs font-medium ${
                              pin.length >= 8 
                                ? "text-theme-success" 
                                : pin.length >= 6 
                                ? "text-theme-warning" 
                                : "text-theme-error"
                            }`}>
                              {pin.length >= 8 ? "Strong" : pin.length >= 6 ? "Good" : "Weak"}
                            </span>
                          </div>
                          <div className="text-xs text-theme-textSecondary">
                            {pin.length < 4 && "PIN must be at least 4 characters"}
                            {pin.length >= 4 && pin.length < 6 && "Consider using a longer PIN for better security"}
                            {pin.length >= 6 && "Good PIN length"}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-3 pt-4">
                        <Button
                          onClick={() => {
                            setSelectedVault(null);
                            setPin("");
                            setConfirmPin("");
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSetPin}
                          disabled={!isPinValid || loading}
                          className="flex-1 bg-gradient-to-r from-theme-primary to-theme-primary/80"
                        >
                          {loading ? "Setting PIN..." : "Set PIN"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
