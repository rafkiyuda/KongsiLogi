import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: Request) {
  try {
    const { action, data } = await req.json()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    let prompt = ''

    if (action === 'smart_pricing') {
      prompt = `
You are an expert AI supply chain analyst for a cooperative. 
Given the following list of inventory batches that are nearing expiry, analyze the shelf life remaining and suggest an optimal discount percentage to clear the stock before it spoils.
Return ONLY a valid JSON array of objects with the exact keys: "batchId" (string), "suggestedDiscountPercent" (number), and "reasoning" (string, in Indonesian).

Data:
${JSON.stringify(data, null, 2)}
`
    } else if (action === 'supplier_scoring') {
      prompt = `
You are an expert AI procurement manager.
Given the following list of suppliers, assign a performance score (0-100) and provide a recommendation reasoning on why we should choose them (or why not). 
Assume some realistic variations in consistency and price based on their profile.
Return ONLY a valid JSON array of objects with the exact keys: "supplierId" (string), "score" (number), and "recommendationReason" (string, in Indonesian).

Data:
${JSON.stringify(data, null, 2)}
`
    } else if (action === 'demand_forecasting') {
      prompt = `
You are an expert AI inventory analyst.
Given the following list of products and their current stock levels vs minimum required stock, determine the restock urgency level ('Rendah', 'Sedang', 'Tinggi', 'Kritis') and a brief recommendation action.
Return ONLY a valid JSON array of objects with the exact keys: "productId" (string), "urgencyLevel" (string), and "recommendation" (string, in Indonesian).

Data:
${JSON.stringify(data, null, 2)}
`
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Attempt to parse JSON from the response text
    // Sometimes Gemini wraps JSON in markdown block like ```json ... ```
    let cleanJson = text
    if (text.includes('```json')) {
      cleanJson = text.split('```json')[1].split('```')[0].trim()
    } else if (text.includes('```')) {
      cleanJson = text.split('```')[1].split('```')[0].trim()
    }
    
    const parsedData = JSON.parse(cleanJson)

    return NextResponse.json({ success: true, result: parsedData })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error processing AI request'
    console.error('AI API Error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
