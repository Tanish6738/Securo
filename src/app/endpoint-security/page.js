"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheckIcon, 
  GlobeAltIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  LinkIcon,
  LockClosedIcon,
  CogIcon,
  InformationCircleIcon,
  PlayIcon,
  ArrowPathIcon,
  ChartBarIcon,
  HomeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const EndpointSecurity = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [pingLoading, setPingLoading] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [pingResults, setPingResults] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('scanner');
  const [scanHistory, setScanHistory] = useState([]);

  useEffect(() => {
    // Load scan history from localStorage
    const history = localStorage.getItem('scanHistory');
    if (history) {
      setScanHistory(JSON.parse(history));
    }
  }, []);

  const saveToHistory = (result) => {
    const newHistory = [result, ...scanHistory.slice(0, 9)]; // Keep last 10 scans
    setScanHistory(newHistory);
    localStorage.setItem('scanHistory', JSON.stringify(newHistory));
  };

  const handlePing = async () => {
    setPingLoading(true);
    setError('');
    try {
      const response = await fetch('/api/mini-shield-api?endpoint=ping');
      const data = await response.json();
      setPingResults(data);
    } catch (err) {
      setError('Failed to ping the service');
    } finally {
      setPingLoading(false);
    }
  };

  const handleScan = async () => {
    if (!url.trim()) {
      setError('Please enter a URL to scan');
      return;
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid HTTP or HTTPS URL');
      return;
    }

    setLoading(true);
    setError('');
    setScanResults(null);

    try {
      const response = await fetch('/api/mini-shield-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Scan failed');
      }

      setScanResults(data);
      saveToHistory(data);
    } catch (err) {
      setError(err.message || 'Failed to scan URL');
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  const getSecurityGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'text-green-500 bg-green-100';
      case 'B': return 'text-blue-500 bg-blue-100';
      case 'C': return 'text-yellow-500 bg-yellow-100';
      case 'D': return 'text-orange-500 bg-orange-100';
      case 'F': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-blue-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const SecurityAnalysisCard = ({ title, data, icon: Icon, type }) => {
    const renderContent = () => {
      switch (type) {
        case 'tls':
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-theme-text">Secure Connection:</span>
                <span className={`flex items-center ${data.isSecure ? 'text-green-500' : 'text-red-500'}`}>
                  {data.isSecure ? <CheckCircleIcon className="h-4 w-4 mr-1" /> : <XCircleIcon className="h-4 w-4 mr-1" />}
                  {data.isSecure ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-theme-text">Protocol:</span>
                <span className="text-sm font-medium text-theme-primary">{data.protocol}</span>
              </div>
              {data.cipher && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-text">Cipher:</span>
                  <span className="text-sm font-medium text-theme-primary">{data.cipher}</span>
                </div>
              )}
            </div>
          );
        
        case 'headers':
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-theme-text">Headers Present:</span>
                <span className="text-sm font-medium text-theme-primary">{data.present || 0}</span>
              </div>
              {data.missing && data.missing.length > 0 && (
                <div>
                  <span className="text-sm text-theme-text">Missing Headers:</span>
                  <div className="mt-1 space-y-1">
                    {data.missing.slice(0, 3).map((header) => (
                      <div key={header} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                        {header}
                      </div>
                    ))}
                    {data.missing.length > 3 && (
                      <div className="text-xs text-theme-text">
                        +{data.missing.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        
        case 'redirects':
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-theme-text">Total Redirects:</span>
                <span className="text-sm font-medium text-theme-primary">{data.totalRedirects || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-theme-text">Has Redirects:</span>
                <span className={`flex items-center ${data.hasRedirects ? 'text-yellow-500' : 'text-green-500'}`}>
                  {data.hasRedirects ? <ExclamationTriangleIcon className="h-4 w-4 mr-1" /> : <CheckCircleIcon className="h-4 w-4 mr-1" />}
                  {data.hasRedirects ? 'Yes' : 'No'}
                </span>
              </div>
              {data.finalUrl && data.finalUrl !== data.chain?.[0]?.url && (
                <div className="text-xs text-theme-text">
                  Final URL: {data.finalUrl}
                </div>
              )}
            </div>
          );
        
        case 'cookies':
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-theme-text">Cookies Found:</span>
                <span className="text-sm font-medium text-theme-primary">{data.count || 0}</span>
              </div>
              {data.securityAnalysis && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-theme-text">Secure:</span>
                    <span className="text-xs font-medium">{data.securityAnalysis.secureCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-theme-text">HttpOnly:</span>
                    <span className="text-xs font-medium">{data.securityAnalysis.httpOnlyCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-theme-text">SameSite:</span>
                    <span className="text-xs font-medium">{data.securityAnalysis.sameSiteCount || 0}</span>
                  </div>
                </div>
              )}
            </div>
          );
        
        case 'cors':
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-theme-text">CORS Configured:</span>
                <span className={`flex items-center ${data.configured ? 'text-green-500' : 'text-yellow-500'}`}>
                  {data.configured ? <CheckCircleIcon className="h-4 w-4 mr-1" /> : <InformationCircleIcon className="h-4 w-4 mr-1" />}
                  {data.configured ? 'Yes' : 'No'}
                </span>
              </div>
              {data.allowsCredentials !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-text">Allows Credentials:</span>
                  <span className={`text-sm font-medium ${data.allowsCredentials ? 'text-red-500' : 'text-green-500'}`}>
                    {data.allowsCredentials ? 'Yes' : 'No'}
                  </span>
                </div>
              )}
              {data.allowsOrigin && (
                <div className="text-xs text-theme-text">
                  Origin: {data.allowsOrigin}
                </div>
              )}
            </div>
          );
        
        case 'robots':
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-theme-text">robots.txt:</span>
                <span className={`flex items-center ${data.robots?.exists ? 'text-green-500' : 'text-yellow-500'}`}>
                  {data.robots?.exists ? <CheckCircleIcon className="h-4 w-4 mr-1" /> : <XCircleIcon className="h-4 w-4 mr-1" />}
                  {data.robots?.exists ? 'Found' : 'Not Found'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-theme-text">sitemap.xml:</span>
                <span className={`flex items-center ${data.sitemap?.exists ? 'text-green-500' : 'text-yellow-500'}`}>
                  {data.sitemap?.exists ? <CheckCircleIcon className="h-4 w-4 mr-1" /> : <XCircleIcon className="h-4 w-4 mr-1" />}
                  {data.sitemap?.exists ? 'Found' : 'Not Found'}
                </span>
              </div>
            </div>
          );
        
        default:
          return <div className="text-sm text-theme-text">Analysis data not available</div>;
      }
    };

    return (
      <div className="bg-theme-background border border-theme-border rounded-xl p-4 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-theme-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-theme-primary" />
          </div>
          <h3 className="font-semibold text-theme-primary">{title}</h3>
        </div>
        {renderContent()}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-background via-theme-background to-theme-surface pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center space-x-2 text-theme-text hover:text-theme-primary transition-all duration-300 group"
          >
            <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-theme-primary/10 rounded-full mb-4">
            <ShieldCheckIcon className="h-8 w-8 text-theme-primary" />
          </div>
          <h1 className="text-4xl font-bold text-theme-primary mb-4">
            MiniShield Endpoint Security
          </h1>
          <p className="text-xl text-theme-text max-w-3xl mx-auto">
            Comprehensive security analysis for web endpoints. Test TLS/SSL certificates, 
            security headers, CORS configuration, and more.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-theme-surface rounded-xl p-1 shadow-lg border border-theme-border">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'scanner'
                  ? 'bg-theme-primary text-white shadow-lg'
                  : 'text-theme-text hover:text-theme-primary'
              }`}
            >
              <GlobeAltIcon className="h-5 w-5 inline mr-2" />
              URL Scanner
            </button>
            <button
              onClick={() => setActiveTab('ping')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'ping'
                  ? 'bg-theme-primary text-white shadow-lg'
                  : 'text-theme-text hover:text-theme-primary'
              }`}
            >
              <PlayIcon className="h-5 w-5 inline mr-2" />
              Service Health
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'history'
                  ? 'bg-theme-primary text-white shadow-lg'
                  : 'text-theme-text hover:text-theme-primary'
              }`}
            >
              <ClockIcon className="h-5 w-5 inline mr-2" />
              Scan History
            </button>
          </div>
        </div>

        {/* Scanner Tab */}
        {activeTab === 'scanner' && (
          <div className="space-y-8">
            {/* URL Input Section */}
            <div className="bg-theme-surface rounded-2xl p-8 shadow-xl border border-theme-border">
              <h2 className="text-2xl font-bold text-theme-primary mb-6">Security Scanner</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    Target URL
                  </label>
                  <div className="flex space-x-4">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="flex-1 px-4 py-3 bg-theme-background border border-theme-border rounded-xl focus:ring-2 focus:ring-theme-primary focus:border-transparent text-theme-text placeholder-gray-400 transition-all duration-300"
                      disabled={loading}
                    />
                    <button
                      onClick={handleScan}
                      disabled={loading || !url.trim()}
                      className="px-8 py-3 bg-gradient-to-r from-theme-primary to-purple-500 text-white rounded-xl hover:shadow-lg hover:shadow-theme-primary/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {loading ? (
                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                      ) : (
                        <ShieldCheckIcon className="h-5 w-5" />
                      )}
                      <span>{loading ? 'Scanning...' : 'Scan URL'}</span>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                    <span className="text-red-700">{error}</span>
                  </div>
                )}
              </div>

              {/* Features List */}
              <div className="mt-8 grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-primary">Analysis Features:</h3>
                  <ul className="space-y-2 text-sm text-theme-text">
                    <li className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      TLS/SSL Certificate Analysis
                    </li>
                    <li className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      HTTP Security Headers
                    </li>
                    <li className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      Redirect Chain Tracking
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-primary">Additional Checks:</h3>
                  <ul className="space-y-2 text-sm text-theme-text">
                    <li className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      CORS Configuration
                    </li>
                    <li className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      Cookie Security Analysis
                    </li>
                    <li className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      Robots.txt & Sitemap Discovery
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Scan Results */}
            {scanResults && (
              <div className="space-y-6">
                {/* Security Score Summary */}
                <div className="bg-theme-surface rounded-2xl p-8 shadow-xl border border-theme-border">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-theme-primary">Security Report</h2>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getScoreColor(scanResults.security.score)}`}>
                          {scanResults.security.score}
                        </div>
                        <div className="text-sm text-theme-text">Score</div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl font-bold text-lg ${getSecurityGradeColor(scanResults.security.grade)}`}>
                        Grade {scanResults.security.grade}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-theme-primary mb-3">Scan Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-theme-text">URL:</span>
                          <span className="text-theme-primary font-medium">{scanResults.scan.url}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-theme-text">Duration:</span>
                          <span className="text-theme-primary font-medium">{scanResults.scan.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-theme-text">Timestamp:</span>
                          <span className="text-theme-primary font-medium">
                            {new Date(scanResults.scan.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-theme-primary mb-3">Issues Found</h3>
                      {scanResults.security.issues.length > 0 ? (
                        <div className="space-y-2">
                          {scanResults.security.issues.slice(0, 3).map((issue, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-theme-text">{issue}</span>
                            </div>
                          ))}
                          {scanResults.security.issues.length > 3 && (
                            <div className="text-sm text-theme-text">
                              +{scanResults.security.issues.length - 3} more issues
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          <span className="text-sm text-theme-text">No major issues found</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Detailed Analysis */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <SecurityAnalysisCard
                    title="TLS/SSL Security"
                    data={scanResults.analysis.tls}
                    icon={LockClosedIcon}
                    type="tls"
                  />
                  <SecurityAnalysisCard
                    title="Security Headers"
                    data={scanResults.analysis.headers}
                    icon={DocumentTextIcon}
                    type="headers"
                  />
                  <SecurityAnalysisCard
                    title="Redirect Analysis"
                    data={scanResults.analysis.redirects}
                    icon={LinkIcon}
                    type="redirects"
                  />
                  <SecurityAnalysisCard
                    title="Cookie Security"
                    data={scanResults.analysis.cookies}
                    icon={CogIcon}
                    type="cookies"
                  />
                  <SecurityAnalysisCard
                    title="CORS Configuration"
                    data={scanResults.analysis.cors}
                    icon={GlobeAltIcon}
                    type="cors"
                  />
                  <SecurityAnalysisCard
                    title="File Discovery"
                    data={scanResults.analysis.robots_sitemap}
                    icon={DocumentTextIcon}
                    type="robots"
                  />
                </div>

                {/* Recommendations */}
                {scanResults.security.recommendations.length > 0 && (
                  <div className="bg-theme-surface rounded-2xl p-8 shadow-xl border border-theme-border">
                    <h2 className="text-2xl font-bold text-theme-primary mb-6">Recommendations</h2>
                    <div className="space-y-3">
                      {scanResults.security.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-blue-800">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Ping Tab */}
        {activeTab === 'ping' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-theme-surface rounded-2xl p-8 shadow-xl border border-theme-border">
              <h2 className="text-2xl font-bold text-theme-primary mb-6">Service Health Check</h2>
              
              <div className="text-center space-y-6">
                <button
                  onClick={handlePing}
                  disabled={pingLoading}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                >
                  {pingLoading ? (
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  ) : (
                    <PlayIcon className="h-5 w-5" />
                  )}
                  <span>{pingLoading ? 'Checking...' : 'Check Service Health'}</span>
                </button>

                {pingResults && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-left">
                    <div className="flex items-center space-x-3 mb-4">
                      <CheckCircleIcon className="h-6 w-6 text-green-500" />
                      <h3 className="font-semibold text-green-800">Service Status: {pingResults.status}</h3>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-700">Service:</span>
                        <span className="text-green-800 font-medium">{pingResults.service}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Version:</span>
                        <span className="text-green-800 font-medium">{pingResults.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Uptime:</span>
                        <span className="text-green-800 font-medium">{Math.floor(pingResults.uptime)}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Response Time:</span>
                        <span className="text-green-800 font-medium">
                          {new Date(pingResults.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {pingResults.message && (
                      <div className="mt-4 p-3 bg-green-100 rounded-lg">
                        <span className="text-green-800 text-sm">{pingResults.message}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-theme-surface rounded-2xl p-8 shadow-xl border border-theme-border">
              <h2 className="text-2xl font-bold text-theme-primary mb-6">Scan History</h2>
              
              {scanHistory.length > 0 ? (
                <div className="space-y-4">
                  {scanHistory.map((scan, index) => (
                    <div key={index} className="bg-theme-background border border-theme-border rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`px-3 py-1 rounded-lg font-medium ${getSecurityGradeColor(scan.security.grade)}`}>
                            {scan.security.grade}
                          </div>
                          <div>
                            <div className="font-medium text-theme-primary">{scan.scan.url}</div>
                            <div className="text-sm text-theme-text">
                              {new Date(scan.scan.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xl font-bold ${getScoreColor(scan.security.score)}`}>
                            {scan.security.score}
                          </div>
                          <div className="text-sm text-theme-text">Score</div>
                        </div>
                      </div>
                      
                      {scan.security.issues.length > 0 && (
                        <div className="mt-3 text-sm text-theme-text">
                          Issues: {scan.security.issues.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-theme-text">No scan history available</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Scan some URLs to see your history here
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EndpointSecurity;