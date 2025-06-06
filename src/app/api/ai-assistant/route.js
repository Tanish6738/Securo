import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const { message, breachData, conversationHistory = [] } = await request.json()
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Create comprehensive context from breach data
    const contextPrompt = `
You are an AI security analyst assistant specialized in data breach analysis. You have access to comprehensive breach data for a user's email address.

BREACH DATA CONTEXT:
${JSON.stringify(breachData, null, 2)}

KEY INFORMATION AVAILABLE:
- Total Breaches: ${breachData?.breachCount || breachData?.ExposedBreaches?.breaches_details?.length || 0}
- Risk Score: ${breachData?.BreachMetrics?.risk?.[0]?.risk_score || 'N/A'}/10 (${breachData?.BreachMetrics?.risk?.[0]?.risk_label || 'Unknown'})
- Paste Exposures: ${breachData?.PastesSummary?.cnt || breachData?.ExposedPastes?.pastes_details?.length || 0}
- Total Records Exposed: ${breachData?.ExposedBreaches?.breaches_details?.reduce((total, breach) => total + (breach.xposed_records || 0), 0)?.toLocaleString() || '0'}

CONVERSATION HISTORY:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

GUIDELINES:
1. Always maintain context about this specific user's breach data
2. Provide accurate, helpful security advice based on the data
3. If asked for charts/graphs, respond with a JSON structure indicating chart type and data
4. If asked for tables, provide structured data that can be rendered as tables
5. Be concise but comprehensive in your analysis
6. Focus on actionable security recommendations
7. If asked about specific breaches, reference the actual breach names and details from the data

RESPONSE FORMATS:
For charts, ALWAYS include a properly formatted JSON block when users ask for visual data. Examples:

For PIE CHARTS (industries, data types, etc.):
\`\`\`json
{
  "chartType": "pie",
  "chartData": {
    "title": "Breaches by Industry",
    "data": [
      {"name": "Technology", "value": 15},
      {"name": "Social Media", "value": 8},
      {"name": "Finance", "value": 5}
    ]
  }
}
\`\`\`

For BAR CHARTS (comparisons, counts):
\`\`\`json
{
  "chartType": "bar", 
  "chartData": {
    "title": "Records Exposed by Year",
    "data": [
      {"name": "2020", "value": 1500000},
      {"name": "2021", "value": 2300000},
      {"name": "2022", "value": 890000}
    ]
  }
}
\`\`\`

For LINE CHARTS (timelines, trends):
\`\`\`json
{
  "chartType": "line",
  "chartData": {
    "title": "Breach Timeline",
    "data": [
      {"name": "2019", "value": 3},
      {"name": "2020", "value": 8}, 
      {"name": "2021", "value": 12},
      {"name": "2022", "value": 15},
      {"name": "2023", "value": 7}
    ]
  }
}
\`\`\`

For tables:
\`\`\`json
{
  "tableData": {
    "title": "Table Title",
    "headers": ["Header1", "Header2"],
    "rows": [["Cell1", "Cell2"], ...]
  }
}
\`\`\`

IMPORTANT: When users ask for charts, timelines, or visual data, ALWAYS include the JSON block even if you also provide textual analysis.

Current user query: "${message}"

Please provide a helpful response based on the user's breach data and query. If they ask for visual data (charts, graphs, tables), include the appropriate JSON structure in your response.
`

    const result = await model.generateContent(contextPrompt)
    const response = await result.response
    let text = response.text()    // Try to extract structured data (charts/tables) from the response
    let structuredData = null
    try {
      // Look for JSON code blocks in the response
      const jsonMatches = text.match(/```json\s*([\s\S]*?)\s*```/g)
      if (jsonMatches && jsonMatches.length > 0) {
        // Get the last JSON match (most recent request)
        const lastMatch = jsonMatches[jsonMatches.length - 1]
        const jsonString = lastMatch.replace(/```json\s*/, '').replace(/\s*```/, '')
        structuredData = JSON.parse(jsonString)
        
        // Remove the JSON block from the text response
        text = text.replace(lastMatch, '').trim()
      }
    } catch (e) {
      console.error('Error parsing structured data:', e)
      // Continue with plain text response if JSON parsing fails
    }

    // Auto-generate charts/tables for common requests if not provided by AI
    if (!structuredData && breachData?.ExposedBreaches?.breaches_details) {
      const breaches = breachData.ExposedBreaches.breaches_details
      const lowerMessage = message.toLowerCase()
      
      // Auto-generate timeline chart for timeline requests
      if (lowerMessage.includes('timeline') || lowerMessage.includes('over time') || lowerMessage.includes('year')) {
        const timelineData = {}
        breaches.forEach(breach => {
          const year = breach.xposed_date || 'Unknown'
          timelineData[year] = (timelineData[year] || 0) + 1
        })
        
        const sortedData = Object.entries(timelineData)
          .map(([year, count]) => ({ name: year, value: count }))
          .sort((a, b) => a.name.localeCompare(b.name))
        
        structuredData = {
          chartType: 'line',
          chartData: {
            title: 'Breach Timeline by Year',
            data: sortedData
          }
        }
      }
      
      // Auto-generate industry pie chart for industry requests
      else if (lowerMessage.includes('industry') || lowerMessage.includes('sector') || lowerMessage.includes('pie')) {
        const industryData = {}
        breaches.forEach(breach => {
          const industry = breach.industry || 'Unknown'
          industryData[industry] = (industryData[industry] || 0) + 1
        })
        
        const pieData = Object.entries(industryData)
          .map(([industry, count]) => ({ name: industry, value: count }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 8) // Top 8 industries
        
        structuredData = {
          chartType: 'pie',
          chartData: {
            title: 'Breaches by Industry',
            data: pieData
          }
        }
      }
      
      // Auto-generate table for table requests
      else if (lowerMessage.includes('table') || lowerMessage.includes('list')) {
        const tableData = breaches.slice(0, 10).map(breach => [
          breach.breach_name || 'Unknown',
          breach.xposed_date || 'Unknown',
          (breach.xposed_records || 0).toLocaleString(),
          breach.industry || 'Unknown'
        ])
        
        structuredData = {
          tableData: {
            title: 'Recent Breaches',
            headers: ['Breach Name', 'Date', 'Records Exposed', 'Industry'],
            rows: tableData
          }
        }
      }
    }

    return NextResponse.json({
      response: text,
      structuredData: structuredData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI Assistant error:', error)
    return NextResponse.json(
      { error: 'Failed to process AI request. Please try again.' },
      { status: 500 }
    )
  }
}
