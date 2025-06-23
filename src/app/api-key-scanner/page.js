'use client';

import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  Search, 
  Github, 
  Key, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  Star,
  GitFork,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Building,
  Mail,
  Users,
  BookOpen,
  Activity,
  Eye,
  GitBranch,
  Code,
  RefreshCw,
  Filter,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';

export default function APIKeyScanner() {
  // Tab management
  const [activeTab, setActiveTab] = useState('profile');
    // User profile state
  const [username, setUsername] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [userRepos, setUserRepos] = useState([]);
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
    // Scanning state
  const [method, setMethod] = useState('POST');
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [error, setError] = useState('');
  
  // Results filtering state
  const [issueTypeFilter, setIssueTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Fetch GitHub user profile
  const fetchUserProfile = async () => {
    if (!username.trim()) {
      setError('Please enter a GitHub username');
      return;
    }

    setProfileLoading(true);
    setError('');
    setUserProfile(null);
    setUserRepos([]);

    try {
      // Fetch user profile
      const userResponse = await fetch(`https://api.github.com/users/${username}`);
      if (!userResponse.ok) {
        throw new Error('User not found');
      }
      const userData = await userResponse.json();
      setUserProfile(userData);

      // Fetch user repositories
      const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
      if (!reposResponse.ok) {
        throw new Error('Failed to fetch repositories');
      }      const reposData = await reposResponse.json();
      const publicRepos = reposData.filter(repo => !repo.private); // Only public repos
      setUserRepos(publicRepos);
      setFilteredRepos(publicRepos);
      
      setActiveTab('repositories');
    } catch (err) {
      setError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  // Filter repositories based on search query
  const handleRepoSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredRepos(userRepos);
    } else {
      const filtered = userRepos.filter(repo =>
        repo.name.toLowerCase().includes(query.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(query.toLowerCase())) ||
        (repo.language && repo.language.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredRepos(filtered);
    }
  };

  // Handle repository selection
  const handleRepoSelection = (repo) => {
    setSelectedRepos(prev => {
      const isSelected = prev.some(r => r.id === repo.id);
      if (isSelected) {
        return prev.filter(r => r.id !== repo.id);
      } else {
        return [...prev, repo];
      }
    });
  };

  // Select all repositories
  const handleSelectAll = () => {
    if (selectedRepos.length === filteredRepos.length) {
      setSelectedRepos([]);
    } else {
      setSelectedRepos([...filteredRepos]);
    }
  };

  // Scan multiple repositories
  const handleMultiScan = async () => {
    if (selectedRepos.length === 0) {
      setError('Please select at least one repository to scan');
      return;
    }

    setLoading(true);
    setError('');
    setScanResults(null);

    try {
      const allResults = [];
      
      for (const repo of selectedRepos) {
        const body = {
          repo: repo.clone_url,
          username: repo.owner.login,
          repoName: repo.name
        };

        const response = await fetch('/api/api-key-scanner', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();
        
        if (data.success) {
          allResults.push({
            ...data,
            repository: repo
          });
        } else {
          allResults.push({
            success: false,
            error: data.error,
            repository: repo
          });
        }
      }

      setScanResults({
        success: true,
        method: 'POST',
        results: allResults,
        total_repositories: selectedRepos.length,
        scanned_repositories: selectedRepos.map(r => r.full_name)
      });
      setActiveTab('results');
    } catch (err) {
      setError('Failed to scan repositories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  // Legacy single scan function (keeping for backward compatibility)
  const handleScan = async () => {
    if (selectedRepos.length === 0) {
      setError('Please select at least one repository to scan');
      return;
    }

    // Use the first selected repository for single scan
    const selectedRepo = selectedRepos[0];
    setLoading(true);
    setError('');
    setScanResults(null);

    try {
      const body = {
        repo: selectedRepo.clone_url,
        username: selectedRepo.owner.login,
        repoName: selectedRepo.name
      };

      const response = await fetch('/api/api-key-scanner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (data.success) {
        setScanResults(data);
        setActiveTab('results');
      } else {
        setError(data.error || 'An error occurred while scanning');
      }
    } catch (err) {
      setError('Failed to scan repository: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  const getSeverityColor = (type) => {
    const highRisk = ['AWS', 'Stripe', 'RSA Private Key', 'JWT'];
    const mediumRisk = ['Slack', 'Twilio', 'Mailgun', 'DigitalOcean'];
    
    if (highRisk.some(risk => type.includes(risk))) {
      return 'text-theme-error bg-theme-error/10 border-theme-error border-opacity-20';
    } else if (mediumRisk.some(risk => type.includes(risk))) {
      return 'text-theme-warning bg-theme-warning/10 border-theme-warning/20';
    }
    return 'text-theme-primary bg-theme-primary/10 border-theme-primary border-opacity-20';
  };

  const getSeverityLevel = (type) => {
    const highRisk = ['AWS', 'Stripe', 'RSA Private Key', 'JWT'];
    const mediumRisk = ['Slack', 'Twilio', 'Mailgun', 'DigitalOcean'];
    
    if (highRisk.some(risk => type.includes(risk))) {
      return 'high';
    } else if (mediumRisk.some(risk => type.includes(risk))) {
      return 'medium';
    }
    return 'low';
  };

  // Get all unique issue types from scan results
  const getAllIssueTypes = () => {
    if (!scanResults) return [];
    
    const types = new Set();
    
    if (scanResults.results && Array.isArray(scanResults.results)) {
      // Multi-repository results
      scanResults.results.forEach(result => {
        if (result.results && Array.isArray(result.results)) {
          result.results.forEach(issue => {
            types.add(issue.type);
          });
        }
      });
    } else if (scanResults.results && Array.isArray(scanResults.results)) {
      // Single repository results
      scanResults.results.forEach(issue => {
        types.add(issue.type);
      });
    }
    
    return Array.from(types).sort();
  };

  // Filter issues based on selected filters
  const filterIssues = (issues) => {
    if (!issues) return [];
    
    return issues.filter(issue => {
      // Filter by issue type
      if (issueTypeFilter !== 'all' && issue.type !== issueTypeFilter) {
        return false;
      }
      
      // Filter by severity
      if (severityFilter !== 'all') {
        const severity = getSeverityLevel(issue.type);
        if (severity !== severityFilter) {
          return false;
        }
      }
      
      return true;
    });
  };

  const formatMatch = (match) => {
    if (match.length > 50) {
      return match.substring(0, 50) + '...';
    }
    return match;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-background to-theme-secondary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Link href="/" className="p-4 bg-gradient-to-r text-theme-primary-hover rounded-2xl shadow-lg mr-4 text-2xl btn-primary text-white ">
              Back to Home
            </Link>
            <div className="p-4 bg-gradient-to-r text-theme-primary-hover rounded-2xl shadow-lg">
              <Shield className="h-12 w-12 theme-primary " />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-clip-text text-theme-accent mb-4">
            GitHub Security Scanner
          </h1>
          <p className="text-xl max-w-2xl mx-auto">
            Analyze GitHub profiles and scan repositories for exposed API keys and sensitive information
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-theme-surface rounded-2xl p-2 shadow-lg border border-theme-border-opaque">
            <div className="flex space-x-2">
              {[
                { id: 'profile', label: 'Profile Analysis', icon: User },
                { id: 'repositories', label: 'Repository Selection', icon: BookOpen },
                { id: 'results', label: 'Scan Results', icon: Activity }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'btn-primary bg-theme-primary text-white shadow-md'
                        : 'bg-theme-secondary hover:bg-theme-secondary-hover text-theme-text border border-theme-border-opaque'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 max-w-4xl mx-auto">
            <div className="bg-theme-error/10 border border-theme-error border-opacity-20 rounded-2xl p-6">
              <div className="flex items-center">
                <XCircle className="h-6 w-6 text-theme-error mr-3" />
                <div>
                  <h3 className="text-theme-error font-semibold">Error</h3>
                  <p className="text-theme-error mt-1 opacity-80">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="max-w-6xl mx-auto">
          {/* Profile Analysis Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              {/* Username Input */}
              <div className="bg-theme-surface rounded-3xl p-8 shadow-xl border border-theme-border-opaque">
                <h2 className="text-3xl font-bold text-theme-text mb-6 flex items-center">
                  <Github className="h-8 w-8 mr-3 text-theme-primary" />
                  GitHub Profile Analyzer
                </h2>
                
                <div className="max-w-2xl">
                  <label className="block text-theme-text font-semibold mb-3 text-lg">
                    Enter GitHub Username
                  </label>
                  <div className="flex space-x-4">
                    <div className="flex-1 relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-theme-text-secondary" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="octocat"
                        className="w-full pl-12 pr-4 py-4 border-2 border-theme-border-opaque rounded-2xl focus:border-theme-primary focus:ring-4 ring-theme-primary/20 outline-none transition-all bg-theme-inputBackground text-theme-text text-lg"
                        onKeyPress={(e) => e.key === 'Enter' && fetchUserProfile()}
                      />
                    </div>
                    <button
                      onClick={fetchUserProfile}
                      disabled={profileLoading}
                      className="px-8 py-4 bg-theme-primary hover:bg-theme-primary/10 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer flex items-center"
                    >
                      {profileLoading ? (
                        <>
                          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Search className="h-5 w-5 mr-2" />
                          Analyze Profile
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* User Profile Display */}
              {userProfile && (
                <div className="bg-theme-surface rounded-3xl p-8 shadow-xl border border-theme-border-opaque">
                  <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8">
                    {/* Avatar and Basic Info */}
                    <div className="flex-shrink-0">
                      <img
                        src={userProfile.avatar_url}
                        alt={userProfile.login}
                        className="w-32 h-32 rounded-2xl shadow-lg"
                      />
                    </div>
                    
                    {/* Profile Details */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-3xl font-bold text-theme-text">
                          {userProfile.name || userProfile.login}
                        </h3>
                        <p className="text-xl text-theme-text-secondary">@{userProfile.login}</p>
                      </div>
                      
                      {userProfile.bio && (
                        <p className="text-theme-text text-lg">{userProfile.bio}</p>
                      )}
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2 text-theme-text-secondary">
                          <BookOpen className="h-5 w-5" />
                          <span className="font-semibold">{userProfile.public_repos}</span>
                          <span>Repos</span>
                        </div>
                        <div className="flex items-center space-x-2 text-theme-text-secondary">
                          <Users className="h-5 w-5" />
                          <span className="font-semibold">{userProfile.followers}</span>
                          <span>Followers</span>
                        </div>
                        <div className="flex items-center space-x-2 text-theme-text-secondary">
                          <Users className="h-5 w-5" />
                          <span className="font-semibold">{userProfile.following}</span>
                          <span>Following</span>
                        </div>
                        <div className="flex items-center space-x-2 text-theme-text-secondary">
                          <Calendar className="h-5 w-5" />
                          <span>Joined {formatDate(userProfile.created_at)}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-theme-text-secondary">
                        {userProfile.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{userProfile.location}</span>
                          </div>
                        )}
                        {userProfile.company && (
                          <div className="flex items-center space-x-1">
                            <Building className="h-4 w-4" />
                            <span>{userProfile.company}</span>
                          </div>
                        )}
                        {userProfile.blog && (
                          <div className="flex items-center space-x-1">
                            <LinkIcon className="h-4 w-4" />
                            <a 
                              href={userProfile.blog.startsWith('http') ? userProfile.blog : `https://${userProfile.blog}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-theme-primary hover:underline"
                            >
                              {userProfile.blog}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}          {/* Repository Selection Tab */}
          {activeTab === 'repositories' && (
            <div className="space-y-6">
              {userRepos.length > 0 && (
                <div className="bg-theme-surface rounded-3xl p-8 shadow-xl border border-theme-border-opaque">
                  {/* Header with Scan Button */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
                    <div>
                      <h2 className="text-3xl font-bold text-theme-text flex items-center">
                        <BookOpen className="h-8 w-8 mr-3 text-theme-success" />
                        Repository Scanner
                      </h2>
                      <p className="text-theme-text-secondary mt-2">
                        Select repositories to scan for API keys and sensitive data
                      </p>
                    </div>
                    
                    {/* Scan Button - Moved to top */}
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-theme-text-secondary">
                        {selectedRepos.length} of {filteredRepos.length} selected
                      </div>
                      <button
                        onClick={handleMultiScan}
                        disabled={loading || selectedRepos.length === 0}
                        className="px-8 py-3 bg-theme-primary text-white rounded-2xl font-semibold hover:bg-theme-primary-hover transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                            Scanning {selectedRepos.length} repo{selectedRepos.length !== 1 ? 's' : ''}...
                          </>
                        ) : (
                          <>
                            <Shield className="h-5 w-5 mr-2" />
                            Scan {selectedRepos.length > 0 ? selectedRepos.length : ''} Repositor{selectedRepos.length !== 1 ? 'ies' : 'y'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Search and Selection Controls */}
                  <div className="mb-6 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-theme-text-secondary" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleRepoSearch(e.target.value)}
                        placeholder="Search repositories by name, description, or language..."
                        className="w-full pl-12 pr-4 py-3 border-2 border-theme-border-opaque rounded-2xl focus:border-theme-primary focus:ring-4 ring-theme-primary/20 outline-none transition-all bg-theme-inputBackground text-theme-text"
                      />
                    </div>
                    
                    {/* Selection Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={handleSelectAll}
                          className="px-4 py-2 bg-theme-primary text-white rounded-lg font-medium hover:bg-theme-primary-hover transition-colors flex items-center"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {selectedRepos.length === filteredRepos.length ? 'Deselect All' : 'Select All'}
                        </button>
                        <div className="text-theme-text-secondary">
                          Showing {filteredRepos.length} of {userRepos.length} repositories
                        </div>
                      </div>
                      
                      {selectedRepos.length > 0 && (
                        <div className="flex items-center space-x-2 text-theme-primary">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-semibold">{selectedRepos.length} selected</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Repository List */}
                  <div className="grid gap-4 max-h-96 overflow-y-auto pr-2">
                    {filteredRepos.map((repo) => {
                      const isSelected = selectedRepos.some(r => r.id === repo.id);
                      return (
                        <div
                          key={repo.id}
                          className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'border-theme-primary bg-theme-primary/5 shadow-md'
                              : 'border-theme-border-opaque hover:border-theme-border-hover bg-theme-secondary-lighter hover:shadow-sm'
                          }`}
                          onClick={() => handleRepoSelection(repo)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                {/* Selection Indicator */}
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  isSelected 
                                    ? 'bg-theme-primary border-theme-primary' 
                                    : 'border-theme-text-secondary'
                                }`}>
                                  {isSelected && (
                                    <CheckCircle className="h-3 w-3 text-white" />
                                  )}
                                </div>
                                
                                <h3 className="text-xl font-semibold text-theme-text">
                                  {repo.name}
                                </h3>
                                
                                {repo.private && (
                                  <span className="px-2 py-1 text-xs font-medium bg-theme-warning/10 text-theme-warning rounded-lg">
                                    Private
                                  </span>
                                )}
                                {repo.fork && (
                                  <span className="px-2 py-1 text-xs font-medium bg-theme-secondary text-theme-text-secondary rounded-lg">
                                    Fork
                                  </span>
                                )}
                              </div>
                              
                              {repo.description && (
                                <p className="text-theme-text-secondary mb-3 ml-8">{repo.description}</p>
                              )}
                              
                              <div className="flex items-center space-x-6 text-sm text-theme-text-secondary ml-8">
                                {repo.language && (
                                  <div className="flex items-center space-x-1">
                                    <Code className="h-4 w-4" />
                                    <span>{repo.language}</span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4" />
                                  <span>{repo.stargazers_count}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <GitFork className="h-4 w-4" />
                                  <span>{repo.forks_count}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>Updated {formatDate(repo.updated_at)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredRepos.length === 0 && searchQuery && (
                    <div className="text-center py-12">
                      <Search className="h-16 w-16 text-theme-text-secondary mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-theme-text mb-2">
                        No repositories found
                      </h3>
                      <p className="text-theme-text-secondary">
                        Try adjusting your search query to find repositories.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {userRepos.length === 0 && userProfile && (
                <div className="bg-theme-surface rounded-3xl p-12 shadow-xl border border-theme-border-opaque text-center">
                  <BookOpen className="h-16 w-16 text-theme-text-secondary mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-theme-text mb-2">
                    No Public Repositories Found
                  </h3>
                  <p className="text-theme-text-secondary">
                    This user doesn't have any public repositories to scan.
                  </p>
                </div>
              )}
            </div>
          )}          {/* Scan Results Tab */}
          {activeTab === 'results' && (
            <div className="space-y-8">
              {scanResults ? (
                <>
                  {/* Filters Section */}
                  {((scanResults.results && Array.isArray(scanResults.results) && scanResults.results.some(r => r.results && r.results.length > 0)) || 
                    (scanResults.results && !Array.isArray(scanResults.results[0]?.results) && scanResults.results.length > 0)) && (
                    <div className="bg-theme-surface rounded-3xl p-6 shadow-xl border border-theme-border-opaque">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-theme-text flex items-center">
                          <Filter className="h-5 w-5 mr-2 text-theme-primary" />
                          Filter Results
                        </h3>
                        <button
                          onClick={() => {
                            setIssueTypeFilter('all');
                            setSeverityFilter('all');
                          }}
                          className="text-theme-primary hover:text-theme-primary-hover text-sm font-medium"
                        >
                          Clear Filters
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Issue Type Filter */}
                        <div>
                          <label className="block text-theme-text font-medium mb-2">
                            Filter by Issue Type
                          </label>
                          <div className="relative">
                            <select
                              value={issueTypeFilter}
                              onChange={(e) => setIssueTypeFilter(e.target.value)}
                              className="w-full pl-4 pr-10 py-3 border-2 border-theme-border-opaque rounded-xl focus:border-theme-primary focus:ring-4 ring-theme-primary/20 outline-none transition-all bg-theme-inputBackground text-theme-text appearance-none"
                            >
                              <option value="all">All Issue Types</option>
                              {getAllIssueTypes().map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-theme-text-secondary pointer-events-none" />
                          </div>
                        </div>

                        {/* Severity Filter */}
                        <div>
                          <label className="block text-theme-text font-medium mb-2">
                            Filter by Severity Level
                          </label>
                          <div className="relative">
                            <select
                              value={severityFilter}
                              onChange={(e) => setSeverityFilter(e.target.value)}
                              className="w-full pl-4 pr-10 py-3 border-2 border-theme-border-opaque rounded-xl focus:border-theme-primary focus:ring-4 ring-theme-primary/20 outline-none transition-all bg-theme-inputBackground text-theme-text appearance-none"
                            >
                              <option value="all">All Severity Levels</option>
                              <option value="high">🔴 High Risk</option>
                              <option value="medium">🟡 Medium Risk</option>
                              <option value="low">🟢 Low Risk</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-theme-text-secondary pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Filter Summary */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {issueTypeFilter !== 'all' && (
                          <span className="px-3 py-1 bg-theme-primary/10 text-theme-primary rounded-lg text-sm font-medium">
                            Type: {issueTypeFilter}
                          </span>
                        )}
                        {severityFilter !== 'all' && (
                          <span className="px-3 py-1 bg-theme-accent/10 text-theme-accent rounded-lg text-sm font-medium">
                            Severity: {severityFilter === 'high' ? '🔴 High' : severityFilter === 'medium' ? '🟡 Medium' : '🟢 Low'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Multi-Repository Scan Results */}
                  {scanResults.results && Array.isArray(scanResults.results) ? (
                    <>
                      {/* Overall Summary */}
                      <div className="bg-theme-surface rounded-3xl p-8 shadow-xl border border-theme-border-opaque">
                        <h2 className="text-3xl font-bold text-theme-text mb-6 flex items-center">
                          <Activity className="h-8 w-8 mr-3 text-theme-success" />
                          Multi-Repository Scan Summary
                        </h2>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                          <div className="bg-gradient-to-r from-theme-primary to-theme-accent p-6 rounded-2xl text-white">
                            <div className="text-3xl font-bold">{scanResults.total_repositories || 0}</div>
                            <div className="text-white opacity-80">Repositories Scanned</div>
                          </div>
                          <div className="bg-gradient-to-r from-theme-error to-theme-warning p-6 rounded-2xl text-white">
                            <div className="text-3xl font-bold">
                              {(() => {
                                const totalIssues = scanResults.results.reduce((total, result) => 
                                  total + (result.issues_found || (result.results ? result.results.length : 0)), 0
                                );
                                const filteredTotal = scanResults.results.reduce((total, result) => 
                                  total + (result.results ? filterIssues(result.results).length : 0), 0
                                );
                                return issueTypeFilter === 'all' && severityFilter === 'all' ? totalIssues : `${filteredTotal}/${totalIssues}`;
                              })()}
                            </div>
                            <div className="text-white opacity-80">
                              {issueTypeFilter === 'all' && severityFilter === 'all' ? 'Total Issues Found' : 'Filtered/Total Issues'}
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-theme-success to-theme-accent p-6 rounded-2xl text-white">
                            <div className="text-3xl font-bold">
                              {scanResults.results.filter(result => result.success).length}
                            </div>
                            <div className="text-white opacity-80">Successful Scans</div>
                          </div>
                          <div className="bg-gradient-to-r from-theme-accent to-theme-primary p-6 rounded-2xl text-white">
                            <div className="text-3xl font-bold">
                              {scanResults.results.filter(result => !result.success).length}
                            </div>
                            <div className="text-white opacity-80">Failed Scans</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-theme-text">Scanned Repositories:</h4>
                          <div className="flex flex-wrap gap-2">
                            {scanResults.scanned_repositories?.map((repoName, index) => (
                              <span key={index} className="px-3 py-1 bg-theme-secondary-lighter text-theme-text-secondary rounded-lg text-sm font-mono">
                                {repoName}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Individual Repository Results */}
                      <div className="space-y-6">
                        {scanResults.results.map((result, index) => (
                          <div key={index} className="bg-theme-surface rounded-3xl p-8 shadow-xl border border-theme-border-opaque">
                            <div className="flex items-center justify-between mb-6">
                              <h3 className="text-2xl font-bold text-theme-text flex items-center">
                                <Github className="h-6 w-6 mr-3" />
                                {result.repository?.name || `Repository ${index + 1}`}
                              </h3>
                              {result.success ? (
                                <CheckCircle className="h-6 w-6 text-theme-success" />
                              ) : (
                                <XCircle className="h-6 w-6 text-theme-error" />
                              )}
                            </div>

                            {result.success ? (
                              <>
                                {/* Repository Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                  <div className="bg-theme-secondary-lighter p-4 rounded-xl">
                                    <div className="text-2xl font-bold text-theme-text">{result.files_scanned || 0}</div>
                                    <div className="text-theme-text-secondary">Files Scanned</div>
                                  </div>
                                  <div className="bg-theme-secondary-lighter p-4 rounded-xl">
                                    <div className="text-2xl font-bold text-theme-text">
                                      {result.issues_found || (result.results ? result.results.length : 0)}
                                    </div>
                                    <div className="text-theme-text-secondary">Issues Found</div>
                                  </div>
                                  <div className="bg-theme-secondary-lighter p-4 rounded-xl">
                                    <div className="text-2xl font-bold text-theme-text">{result.scan_duration_seconds || 0}s</div>
                                    <div className="text-theme-text-secondary">Scan Duration</div>
                                  </div>
                                </div>                                {/* Security Issues for this repository */}
                                {result.results && result.results.length > 0 ? (
                                  <div>
                                    {(() => {
                                      const filteredIssues = filterIssues(result.results);
                                      return (
                                        <>
                                          <h4 className="text-xl font-bold text-theme-text mb-4 flex items-center justify-between">
                                            <div className="flex items-center">
                                              <AlertTriangle className="h-5 w-5 mr-2 text-theme-error" />
                                              Security Issues ({filteredIssues.length}{result.results.length !== filteredIssues.length ? ` of ${result.results.length}` : ''})
                                            </div>
                                            {result.results.length !== filteredIssues.length && (
                                              <span className="text-sm text-theme-text-secondary">
                                                {result.results.length - filteredIssues.length} hidden by filters
                                              </span>
                                            )}
                                          </h4>
                                          {filteredIssues.length > 0 ? (
                                            <div className="space-y-3">
                                              {filteredIssues.map((issue, issueIndex) => (
                                                <div
                                                  key={issueIndex}
                                                  className={`p-4 rounded-xl border-2 ${getSeverityColor(issue.type)}`}
                                                >
                                                  <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                      <div className="flex items-center mb-2">
                                                        <Key className="h-4 w-4 mr-2" />
                                                        <span className="font-bold">{issue.type}</span>
                                                        <span className="ml-2 px-2 py-1 rounded-lg text-xs font-medium">
                                                          {getSeverityLevel(issue.type) === 'high' ? '🔴 High' : 
                                                           getSeverityLevel(issue.type) === 'medium' ? '🟡 Medium' : '🟢 Low'}
                                                        </span>
                                                      </div>
                                                      <div className="flex items-center text-sm mb-2">
                                                        <FileText className="h-3 w-3 mr-2" />
                                                        <span className="font-mono bg-theme-background px-2 py-1 rounded text-xs">
                                                          {issue.file}
                                                        </span>
                                                      </div>
                                                      <div className="bg-theme-background p-3 rounded-lg">
                                                        <code className="text-theme-success font-mono text-xs break-all">
                                                          {formatMatch(issue.match)}
                                                        </code>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <div className="text-center py-8">
                                              <Filter className="h-12 w-12 text-theme-text-secondary mx-auto mb-3" />
                                              <h4 className="text-lg font-semibold text-theme-text mb-2">
                                                No Issues Match Current Filters
                                              </h4>
                                              <p className="text-theme-text-secondary">
                                                Try adjusting your filters to see more results.
                                              </p>
                                            </div>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </div>
                                ) : (
                                  <div className="text-center py-8">
                                    <CheckCircle className="h-12 w-12 text-theme-success mx-auto mb-3" />
                                    <h4 className="text-lg font-semibold text-theme-text mb-2">
                                      No Security Issues Found
                                    </h4>
                                    <p className="text-theme-text-secondary">
                                      This repository appears to be secure.
                                    </p>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-center py-8">
                                <XCircle className="h-12 w-12 text-theme-error mx-auto mb-3" />
                                <h4 className="text-lg font-semibold text-theme-text mb-2">
                                  Scan Failed
                                </h4>
                                <p className="text-theme-error">
                                  {result.error || 'An unknown error occurred during scanning.'}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    /* Single Repository Scan Results (Legacy) */
                    <>
                      {/* Scan Summary */}
                      <div className="bg-theme-surface rounded-3xl p-8 shadow-xl border border-theme-border-opaque">
                        <h2 className="text-3xl font-bold text-theme-text mb-6 flex items-center">
                          <Activity className="h-8 w-8 mr-3 text-theme-success" />
                          Scan Summary
                        </h2>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                          <div className="bg-gradient-to-r from-theme-primary to-theme-accent p-6 rounded-2xl text-white">
                            <div className="text-3xl font-bold">{scanResults.files_scanned || 0}</div>
                            <div className="text-white opacity-80">Files Scanned</div>
                          </div>
                          <div className="bg-gradient-to-r from-theme-error to-theme-warning p-6 rounded-2xl text-white">
                            <div className="text-3xl font-bold">
                              {(() => {
                                const totalIssues = scanResults.issues_found || 0;
                                const filteredCount = scanResults.results ? filterIssues(scanResults.results).length : 0;
                                return issueTypeFilter === 'all' && severityFilter === 'all' ? totalIssues : `${filteredCount}/${totalIssues}`;
                              })()}
                            </div>
                            <div className="text-white opacity-80">
                              {issueTypeFilter === 'all' && severityFilter === 'all' ? 'Issues Found' : 'Filtered/Total Issues'}
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-theme-success to-theme-accent p-6 rounded-2xl text-white">
                            <div className="text-3xl font-bold">{scanResults.scan_duration_seconds || 0}s</div>
                            <div className="text-white opacity-80">Scan Duration</div>
                          </div>
                          <div className="bg-gradient-to-r from-theme-accent to-theme-primary p-6 rounded-2xl text-white">
                            <div className="text-3xl font-bold">{scanResults.method || 'POST'}</div>
                            <div className="text-white opacity-80">HTTP Method</div>
                          </div>
                        </div>

                        <div className="flex items-center text-theme-text-secondary bg-theme-secondary-lighter p-4 rounded-2xl">
                          <Github className="h-5 w-5 mr-3" />
                          <span className="font-mono text-sm break-all">{scanResults.scanned_repository}</span>
                        </div>
                      </div>                      {/* Security Issues */}
                      {scanResults.results && scanResults.results.length > 0 ? (
                        <div className="bg-theme-surface rounded-3xl p-8 shadow-xl border border-theme-border-opaque">
                          {(() => {
                            const filteredIssues = filterIssues(scanResults.results);
                            return (
                              <>
                                <div className="flex items-center justify-between mb-6">
                                  <h3 className="text-3xl font-bold text-theme-text flex items-center">
                                    <AlertTriangle className="h-8 w-8 mr-3 text-theme-error" />
                                    Security Issues ({filteredIssues.length}{scanResults.results.length !== filteredIssues.length ? ` of ${scanResults.results.length}` : ''})
                                  </h3>
                                  {scanResults.results.length !== filteredIssues.length && (
                                    <span className="text-theme-text-secondary">
                                      {scanResults.results.length - filteredIssues.length} hidden by filters
                                    </span>
                                  )}
                                </div>

                                {filteredIssues.length > 0 ? (
                                  <div className="space-y-4">
                                    {filteredIssues.map((issue, index) => (
                                      <div
                                        key={index}
                                        className={`p-6 rounded-2xl border-2 ${getSeverityColor(issue.type)}`}
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-center mb-3">
                                              <Key className="h-5 w-5 mr-2" />
                                              <span className="font-bold text-lg">{issue.type}</span>
                                              <span className="ml-3 px-3 py-1 rounded-lg text-sm font-medium">
                                                {getSeverityLevel(issue.type) === 'high' ? '🔴 High Risk' : 
                                                 getSeverityLevel(issue.type) === 'medium' ? '🟡 Medium Risk' : '🟢 Low Risk'}
                                              </span>
                                            </div>
                                            <div className="flex items-center text-sm mb-3">
                                              <FileText className="h-4 w-4 mr-2" />
                                              <span className="font-mono bg-theme-secondary-lighter px-2 py-1 rounded">
                                                {issue.file}
                                              </span>
                                            </div>
                                            <div className="bg-theme-background p-4 rounded-xl">
                                              <code className="text-theme-success font-mono text-sm break-all">
                                                {formatMatch(issue.match)}
                                              </code>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-12">
                                    <Filter className="h-16 w-16 text-theme-text-secondary mx-auto mb-4" />
                                    <h4 className="text-2xl font-semibold text-theme-text mb-2">
                                      No Issues Match Current Filters
                                    </h4>
                                    <p className="text-theme-text-secondary">
                                      {scanResults.results.length} issues found, but none match your current filter settings. Try adjusting your filters.
                                    </p>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="bg-theme-surface rounded-3xl p-12 shadow-xl border border-theme-border-opaque text-center">
                          <CheckCircle className="h-20 w-20 text-theme-success mx-auto mb-6" />
                          <h3 className="text-3xl font-bold text-theme-text mb-4">
                            No Security Issues Found
                          </h3>
                          <p className="text-xl text-theme-text-secondary">
                            Excellent! No exposed API keys or sensitive information was detected in this repository.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <div className="bg-theme-surface rounded-3xl p-12 shadow-xl border border-theme-border-opaque text-center">
                  <Search className="h-20 w-20 text-theme-text-secondary mx-auto mb-6" />
                  <h3 className="text-3xl font-bold text-theme-text mb-4">
                    No Scan Results Yet
                  </h3>
                  <p className="text-xl text-theme-text-secondary">
                    Select repositories from the previous tab and run a security scan to see results here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
