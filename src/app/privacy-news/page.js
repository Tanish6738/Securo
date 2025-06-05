'use client'

import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { 
  NewspaperIcon, 
  CalendarIcon,
  ArrowTopRightOnSquareIcon,
  ArrowPathIcon,
  TagIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { formatDate } from '@/lib/utils'

export default function PrivacyNewsPage() {
  const [articles, setArticles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const categories = [
    { id: 'all', name: 'All News', count: 0 },
    { id: 'privacy', name: 'Privacy & Data Protection', count: 0 },
    { id: 'security', name: 'Cybersecurity', count: 0 },
    { id: 'tech', name: 'Tech News', count: 0 },
    { id: 'business', name: 'Technology Business', count: 0 },
    { id: 'domains', name: 'Security Expert Sources', count: 0 }
  ]
  const fetchNews = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }
      
      // Add date range (last 7 days)
      const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const to = new Date().toISOString().split('T')[0]
      params.append('from', from)
      params.append('to', to)
      params.append('sortBy', 'publishedAt')
      params.append('pageSize', '20')

      const response = await fetch(`/api/privacy-news?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch news')
      }

      const data = await response.json()
      
      // Enhance articles with categories and other metadata
      const enhancedArticles = (data.articles || []).map(article => ({
        ...article,
        id: article.url || Math.random().toString(36),
        category: categorizeArticle(article),
        readTime: estimateReadTime(article.description || article.content),
        relevanceScore: calculateRelevance(article)
      })).sort((a, b) => b.relevanceScore - a.relevanceScore)

      setArticles(enhancedArticles)
    } catch (error) {
      console.error('Error fetching news:', error)
      setArticles([])
    } finally {
      setIsLoading(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])
  const categorizeArticle = (article) => {
    const title = (article.title || '').toLowerCase()
    const description = (article.description || '').toLowerCase()
    const content = title + ' ' + description

    if (content.includes('breach') || content.includes('hack') || content.includes('leak') || content.includes('attack')) {
      return 'security'
    }
    if (content.includes('gdpr') || content.includes('regulation') || content.includes('law') || content.includes('compliance')) {
      return 'privacy'
    }
    if (content.includes('privacy') || content.includes('personal data') || content.includes('tracking') || content.includes('data protection')) {
      return 'privacy'
    }
    if (content.includes('security') || content.includes('cyber') || content.includes('malware') || content.includes('cybersecurity')) {
      return 'security'
    }
    if (content.includes('tech') || content.includes('startup') || content.includes('innovation')) {
      return 'tech'
    }
    if (content.includes('business') || content.includes('market') || content.includes('investment')) {
      return 'business'
    }
    return 'privacy'
  }

  const estimateReadTime = (text) => {
    if (!text) return 1
    const words = text.split(' ').length
    return Math.max(1, Math.ceil(words / 200)) // 200 words per minute
  }

  const calculateRelevance = (article) => {
    const title = (article.title || '').toLowerCase()
    const description = (article.description || '').toLowerCase()
    const content = title + ' ' + description

    let score = 0
    
    // High relevance keywords
    const highRelevanceTerms = ['data breach', 'privacy', 'cybersecurity', 'hack', 'leak', 'gdpr', 'personal data']
    highRelevanceTerms.forEach(term => {
      if (content.includes(term)) score += 3
    })

    // Medium relevance keywords
    const mediumRelevanceTerms = ['security', 'cyber', 'regulation', 'compliance', 'surveillance', 'encryption']
    mediumRelevanceTerms.forEach(term => {
      if (content.includes(term)) score += 2
    })

    // Recent articles get bonus points
    const publishedDate = new Date(article.publishedAt)
    const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSincePublished < 1) score += 3
    else if (daysSincePublished < 7) score += 1

    return score
  }

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    const matchesSearch = !searchTerm || 
      article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  const getCategoryName = (categoryId) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Privacy'
  }

  const getCategoryColor = (category) => {
    const colors = {
      'data-breach': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'cybersecurity': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'privacy': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'regulation': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    }
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Privacy News
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Stay updated with the latest cybersecurity, privacy, and data protection news.
                </p>
              </div>
              <Button
                onClick={fetchNews}
                disabled={isLoading}
                variant="outline"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.map((category) => {
                      const count = category.id === 'all' 
                        ? articles.length 
                        : articles.filter(article => article.category === category.id).length
                      
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                            selectedCategory === category.id
                              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{category.name}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {count}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Articles */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="space-y-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredArticles.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center">
                      <NewspaperIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        No Articles Found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {searchTerm 
                          ? `No articles match your search "${searchTerm}"`
                          : 'No articles available in this category.'
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {filteredArticles.map((article) => (
                    <Card key={article.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(article.category)}`}>
                              {getCategoryName(article.category)}
                            </span>
                            {article.relevanceScore > 5 && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                                High Priority
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {article.readTime} min read
                          </div>
                        </div>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 leading-tight">
                          {article.title}
                        </h2>

                        {article.description && (
                          <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                            {article.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              {formatDate(article.publishedAt)}
                            </div>
                            {article.source?.name && (
                              <div className="flex items-center">
                                <TagIcon className="h-4 w-4 mr-1" />
                                {article.source.name}
                              </div>
                            )}
                          </div>                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
                          >
                            Read More
                            <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-2" />
                          </Button>
                        </div>

                        {article.urlToImage && (
                          <div className="mt-4">
                            <img
                              src={article.urlToImage}
                              alt={article.title}
                              className="w-full h-48 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          {!isLoading && articles.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>News Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {articles.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Articles
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {articles.filter(a => a.category === 'data-breach').length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Data Breaches
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {articles.filter(a => a.category === 'privacy').length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Privacy News
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {articles.filter(a => a.category === 'regulation').length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Regulations
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
