import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'privacy'
    const from = searchParams.get('from') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days ago
    const to = searchParams.get('to') || new Date().toISOString().split('T')[0] // today
    const sortBy = searchParams.get('sortBy') || 'publishedAt'
    const pageSize = searchParams.get('pageSize') || '20'

    let apiUrl = ''
    const apiKey = process.env.NEXT_PUBLIC_NEWSAPI_KEY

    // Define different endpoints based on category
    switch (category) {
      case 'privacy':
        apiUrl = `https://newsapi.org/v2/everything?q=privacy+data+protection+GDPR&from=${from}&to=${to}&sortBy=${sortBy}&language=en&pageSize=${pageSize}&apiKey=${apiKey}`
        break
      case 'security':
        apiUrl = `https://newsapi.org/v2/everything?q=cybersecurity+data+breach+hacking&from=${from}&to=${to}&sortBy=${sortBy}&language=en&pageSize=${pageSize}&apiKey=${apiKey}`
        break
      case 'tech':
        apiUrl = `https://newsapi.org/v2/top-headlines?sources=techcrunch,the-verge,ars-technica&apiKey=${apiKey}`
        break
      case 'business':
        apiUrl = `https://newsapi.org/v2/top-headlines?country=us&category=technology&apiKey=${apiKey}`
        break
      case 'domains':
        apiUrl = `https://newsapi.org/v2/everything?domains=krebs-on-security.com,threatpost.com,darkreading.com&from=${from}&to=${to}&sortBy=${sortBy}&apiKey=${apiKey}`
        break
      default:
        // Default: comprehensive privacy and security news
        apiUrl = `https://newsapi.org/v2/everything?q=privacy+security+cybersecurity+data+breach+GDPR&from=${from}&to=${to}&sortBy=${sortBy}&language=en&pageSize=${pageSize}&apiKey=${apiKey}`
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('NewsAPI Error:', response.status, errorText)
      throw new Error(`Failed to fetch news: ${response.status}`)
    }

    const data = await response.json()
    
    // Filter out articles with missing or invalid data
    const filteredArticles = (data.articles || []).filter(article => 
      article.title && 
      article.description && 
      article.url &&
      article.title !== '[Removed]' &&
      article.description !== '[Removed]'
    )
    
    return NextResponse.json({
      articles: filteredArticles,
      totalResults: data.totalResults || 0,
      category,
      from,
      to,
      sortBy
    })
  } catch (error) {
    console.error('News fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch privacy news', details: error.message },
      { status: 500 }
    )
  }
}
