import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { categories } = await request.json()
    
    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json({ error: 'Categories array is required' }, { status: 400 })
    }
    
    const { faker } = await import('@faker-js/faker')
    
    const result = {}
    
    categories.forEach(category => {
      switch (category) {
        case 'personal':
          result.personal = {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            fullName: faker.person.fullName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            address: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            zipCode: faker.location.zipCode(),
            country: faker.location.country(),
            dateOfBirth: faker.date.birthdate().toISOString().split('T')[0],
            ssn: faker.string.numeric(9, { bannedChars: ['0'] }),
            gender: faker.person.sex(),
            jobTitle: faker.person.jobTitle()
          }
          break
        case 'company':
          result.company = {
            companyName: faker.company.name(),
            department: faker.commerce.department(),
            jobTitle: faker.person.jobTitle(),
            companyEmail: faker.internet.email(),
            companyPhone: faker.phone.number(),
            website: faker.internet.url(),
            industry: faker.company.buzzPhrase(),
            catchPhrase: faker.company.catchPhrase(),
            businessSuffix: faker.company.buzzVerb(),
            ein: faker.string.numeric(9, { bannedChars: ['0'] })
          }
          break
        case 'financial':
          result.financial = {
            creditCardNumber: faker.finance.creditCardNumber(),
            creditCardCvv: faker.finance.creditCardCVV(),
            creditCardIssuer: faker.finance.creditCardIssuer(),
            bankAccountNumber: faker.finance.accountNumber(),
            routingNumber: faker.finance.routingNumber(),
            iban: faker.finance.iban(),
            bic: faker.finance.bic(),
            transactionType: faker.finance.transactionType(),
            currency: faker.finance.currencyCode(),
            amount: faker.finance.amount()
          }
          break
        case 'internet':
          result.internet = {
            username: faker.internet.userName(),
            password: faker.internet.password(),
            url: faker.internet.url(),
            domain: faker.internet.domainName(),
            ipAddress: faker.internet.ip(),
            ipv6: faker.internet.ipv6(),
            macAddress: faker.internet.mac(),
            userAgent: faker.internet.userAgent(),
            emoji: faker.internet.emoji(),
            protocol: faker.internet.protocol()
          }
          break
      }
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Fake data generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate fake data' },
      { status: 500 }
    )
  }
}
