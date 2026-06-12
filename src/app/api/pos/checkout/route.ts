import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { order_id, gross_amount, item_details, customer_details } = await request.json()
    
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey) {
      // For development/PoC, if no key is provided, we simulate a successful token response
      // This allows the UI to build even if the user hasn't set the keys yet.
      return NextResponse.json({ 
        token: 'sandbox-dummy-token-' + order_id,
        redirect_url: 'https://simulator.sandbox.midtrans.com'
      })
    }

    const authString = Buffer.from(`${serverKey}:`).toString('base64')

    const payload = {
      transaction_details: {
        order_id,
        gross_amount: Math.round(gross_amount) // Midtrans requires integer amounts
      },
      item_details,
      customer_details
    }

    const res = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: JSON.stringify(payload)
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error_messages ? data.error_messages.join(', ') : 'Failed to create Midtrans transaction')
    }

    return NextResponse.json({ token: data.token, redirect_url: data.redirect_url })
  } catch (error: any) {
    console.error('Midtrans Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
