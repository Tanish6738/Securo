import { NextResponse } from 'next/server'

// Test analytics data based on test-api.json structure
const TEST_ANALYTICS_DATA = {
  "BreachMetrics": {
    "get_details": [],
    "industry": [
      [
        ["elec", 1],
        ["info", 1],
        ["ente", 1],
        ["misc", 0],
        ["reta", 0],
        ["fina", 0]
      ]
    ],
    "passwords_strength": [
      {
        "EasyToCrack": 0,
        "PlainText": 1,
        "StrongHash": 2,
        "Unknown": 0
      }
    ],
    "risk": [
      {
        "risk_label": "Medium",
        "risk_score": 5
      }
    ],
    "xposed_data": [
      {
        "children": [
          {
            "children": [
              {
                "colname": "level3",
                "group": "A",
                "name": "data_Usernames",
                "value": 3
              },
              {
                "colname": "level3",
                "group": "A",
                "name": "data_Email addresses",
                "value": 3
              }
            ],
            "colname": "level2",
            "name": "👤 Personal Identification"
          },
          {
            "children": [
              {
                "colname": "level3",
                "group": "D",
                "name": "data_Passwords",
                "value": 3
              }
            ],
            "colname": "level2",
            "name": "🔒 Security Practices"
          },
          {
            "children": [
              {
                "colname": "level3",
                "group": "F",
                "name": "data_IP addresses",
                "value": 2
              }
            ],
            "colname": "level2",
            "name": "📞 Communication and Social Interactions"
          }
        ]
      }
    ],
    "yearwise_details": [
      {
        "y2007": 0,
        "y2008": 0,
        "y2009": 0,
        "y2010": 0,
        "y2011": 0,
        "y2012": 0,
        "y2013": 0,
        "y2014": 0,
        "y2015": 1,
        "y2016": 0,
        "y2017": 0,
        "y2018": 1,
        "y2019": 0,
        "y2020": 0,
        "y2021": 1,
        "y2022": 0,
        "y2023": 0,
        "y2024": 0
      }
    ]
  },
  "BreachesSummary": {
    "site": "Multiple Sites",
    "total_breaches": 3,
    "most_recent": "2021"
  },
  "ExposedBreaches": {
    "breaches_details": [
      {
        "breach": "SweClockers",
        "details": "SweClockers experienced a data breach in early 2015, where 255k accounts were exposed. As a result, usernames, email addresses, and salted hashes of passwords—which were stored using a combination of MD5 and SHA512—were disclosed.",
        "domain": "sweclockers.com",
        "industry": "Electronics",
        "logo": "Sweclockers.png",
        "password_risk": "hardtocrack",
        "references": "",
        "searchable": "Yes",
        "verified": "Yes",
        "xposed_data": "Usernames;Email addresses;Passwords",
        "xposed_date": "2015",
        "xposed_records": 254967
      },
      {
        "breach": "TestBreach2018",
        "details": "A major technology company experienced a data breach in 2018, exposing user credentials and personal information.",
        "domain": "example-tech.com",
        "industry": "Information Technology",
        "logo": "TechCompany.png",
        "password_risk": "plaintext",
        "references": "",
        "searchable": "Yes",
        "verified": "Yes",
        "xposed_data": "Usernames;Email addresses;Passwords;IP addresses",
        "xposed_date": "2018",
        "xposed_records": 1500000
      },
      {
        "breach": "Entertainment2021",
        "details": "A popular entertainment platform suffered a security incident in 2021, resulting in the exposure of user account information.",
        "domain": "entertainment-site.com",
        "industry": "Entertainment",
        "logo": "Entertainment.png",
        "password_risk": "hardtocrack",
        "references": "",
        "searchable": "Yes",
        "verified": "Yes",
        "xposed_data": "Usernames;Email addresses;Passwords",
        "xposed_date": "2021",
        "xposed_records": 750000
      }
    ]
  },
  "ExposedPastes": {
    "pastes_details": [
      {
        "source": "PasteBin",
        "date": "2023-03-15",
        "id": "abc123xyz",
        "size": "2.5MB"
      },
      {
        "source": "GitHub Gist",
        "date": "2022-11-20",
        "id": "def456uvw",
        "size": "1.2MB"
      }
    ]
  },
  "PasteMetrics": {
    "pastes_count": 2,
    "total_size": "3.7MB",
    "latest_date": "2023-03-15"
  },
  "PastesSummary": {
    "cnt": 2,
    "domain": "multiple",
    "tmpstmp": "2023-03-15"
  }
}

export async function POST(request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Simulate analytics response
    return NextResponse.json({
      isBreached: true,
      breaches: TEST_ANALYTICS_DATA.ExposedBreaches.breaches_details,
      breachCount: TEST_ANALYTICS_DATA.ExposedBreaches.breaches_details.length,
      email: email,
      status: 'success',
      // Pass through the main analytics sections
      BreachMetrics: TEST_ANALYTICS_DATA.BreachMetrics,
      BreachesSummary: TEST_ANALYTICS_DATA.BreachesSummary,
      ExposedBreaches: TEST_ANALYTICS_DATA.ExposedBreaches,
      ExposedPastes: TEST_ANALYTICS_DATA.ExposedPastes,
      PasteMetrics: TEST_ANALYTICS_DATA.PasteMetrics,
      PastesSummary: TEST_ANALYTICS_DATA.PastesSummary
    })
  } catch (error) {
    console.error('Test analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to get test analytics data' },
      { status: 500 }
    )
  }
}
