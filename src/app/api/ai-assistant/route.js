import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyBHVhK69JfkelhLAXp2bepUFwv3ohw4VoY")

export async function POST(request) {
  try {
    const { message, breachData, conversationHistory = [] } = await request.json()
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

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

CRITICAL: NEVER use Chart.js format with "labels" and "datasets" arrays. ALWAYS use the format above with a "data" array containing objects with "name" and "value" properties.

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

NEVER USE Chart.js FORMAT! Always use the Recharts format shown above.

FORBIDDEN FORMATS (DO NOT USE):
- {"labels": [...], "datasets": [...]} ❌
- {"chartData": {"labels": [...], "datasets": [...]}} ❌

REQUIRED FORMAT:
- {"chartType": "...", "chartData": {"title": "...", "data": [{"name": "...", "value": ...}]}} ✅

Current user query: "${message}"

Please provide a helpful response based on the user's breach data and query. If they ask for visual data (charts, graphs, tables), include the appropriate JSON structure in your response.
`

    const result = await model.generateContent(contextPrompt)
    const response = await result.response
    let text = response.text()    // Try to extract structured data (charts/tables) from the response
    let structuredData = null
    let jsonString = ''
    try {
      // Look for JSON code blocks in the response
      const jsonMatches = text.match(/```json\s*([\s\S]*?)\s*```/g)
      if (jsonMatches && jsonMatches.length > 0) {
        // Get the last JSON match (most recent request)
        const lastMatch = jsonMatches[jsonMatches.length - 1]
        jsonString = lastMatch.replace(/```json\s*/, '').replace(/\s*```/, '').trim()
        
        // Clean up any potential formatting issues
        jsonString = jsonString.replace(/\n\s*/g, ' ').replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')
        
        console.log('Attempting to parse JSON:', jsonString)
        
        const parsed = JSON.parse(jsonString)
        
        // Validate the structure and convert Chart.js format to Recharts format if needed
        if (parsed.chartData && parsed.chartData.labels && parsed.chartData.datasets) {
          console.log('Converting Chart.js format to Recharts format')
          // Convert Chart.js format to Recharts format
          const { labels, datasets } = parsed.chartData
          const data = labels.map((label, index) => ({
            name: label,
            value: datasets[0]?.data?.[index] || 0
          }))
          
          structuredData = {
            chartType: parsed.chartType,
            chartData: {
              title: parsed.chartData.title || 'Chart',
              description: parsed.chartData.description,
              data: data
            }
          }
        } else if (parsed.chartData && Array.isArray(parsed.chartData.data)) {
          // Already in correct format
          structuredData = parsed
        } else {
          console.log('Unknown chart data format:', parsed)
        }
        
        // Remove the JSON block from the text response
        text = text.replace(lastMatch, '').trim()
      }    } catch (e) {
      console.error('Error parsing structured data:', e)
      console.error('Raw JSON string:', jsonString)
      
      // Try to provide a fallback response with example data structure
      if (jsonString.includes('chartType') || jsonString.includes('chart')) {
        console.log('Attempting to provide fallback chart structure')
        try {
          // Try to extract chart type at least
          const chartTypeMatch = jsonString.match(/"chartType":\s*"(\w+)"/);
          const titleMatch = jsonString.match(/"title":\s*"([^"]+)"/);
          
          if (chartTypeMatch) {
            structuredData = {
              chartType: chartTypeMatch[1],
              chartData: {
                title: titleMatch ? titleMatch[1] : 'Data Analysis',
                data: [
                  { name: 'Error', value: 1 }
                ],
                description: 'Error parsing chart data. Please try again with a different request.'
              }
            };
          }
        } catch (fallbackError) {
          console.error('Fallback parsing also failed:', fallbackError);
        }
      }
      
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
        // Auto-generate radar chart for radar/security metrics requests
      else if (lowerMessage.includes('radar') || lowerMessage.includes('security metrics') || lowerMessage.includes('metrics')) {
        // Calculate security metrics from breach data
        const totalBreaches = breaches.length
        const riskScore = breachData?.BreachMetrics?.risk?.[0]?.risk_score || 0
        const totalRecords = breaches.reduce((sum, breach) => sum + (breach.xposed_records || 0), 0)
        
        // Get unique data types exposed
        const dataTypesSet = new Set()
        breaches.forEach(breach => {
          if (breach.xposed_data) {
            breach.xposed_data.split(',').forEach(type => {
              dataTypesSet.add(type.trim())
            })
          }
        })
        
        // Calculate password risk based on password_risk field
        let passwordRiskScore = 0
        let passwordRiskCount = 0
        breaches.forEach(breach => {
          if (breach.password_risk) {
            const risk = breach.password_risk.toLowerCase()
            if (risk.includes('plaintext')) passwordRiskScore += 100
            else if (risk.includes('easy')) passwordRiskScore += 75
            else if (risk.includes('hard')) passwordRiskScore += 25
            else passwordRiskScore += 50 // unknown/other
            passwordRiskCount++
          }
        })
        const avgPasswordRisk = passwordRiskCount > 0 ? passwordRiskScore / passwordRiskCount : 50
        
        const radarData = [
          { name: 'Breach Count', value: Math.min(totalBreaches * 2, 100) }, // Scale to 100
          { name: 'Password Risk', value: Math.min(avgPasswordRisk, 100) },
          { name: 'Data Types Exposed', value: Math.min(dataTypesSet.size * 15, 100) }, // Scale to 100
          { name: 'Records Exposed', value: Math.min(Math.log10(totalRecords + 1) * 10, 100) }, // Log scale
          { name: 'Overall Risk Score', value: Math.min(riskScore * 10, 100) }
        ]
        
        structuredData = {
          chartType: 'radar',
          chartData: {
            title: 'Security Risk Analysis',
            description: 'Multi-dimensional view of your security exposure metrics',
            data: radarData
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
