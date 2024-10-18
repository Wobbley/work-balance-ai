import { NextResponse } from 'next/server'
import { workDays } from '@/lib/time-utils'  // You'll need to create this utility function

export async function POST(request: Request) {
  const data = await request.formData()
  const clockifyRequest = {
    apiKey: data.get('apiKey') as string,
    workspaceId: data.get('workspaceId') as string,
    startDate: data.get('startDate') as string,
    endDate: data.get('endDate') as string,
    workdayLength: parseFloat(data.get('workdayLength') as string),
    overtimeHourlyRate: parseFloat(data.get('overtimeHourlyRate') as string)
  }

  const baseUrl = 'https://reports.api.clockify.me/v1'
  const startDate = new Date(clockifyRequest.startDate)
  const endDate = new Date(clockifyRequest.endDate)
  endDate.setHours(23, 59, 59)

  const postBody = JSON.stringify({
    dateRangeStart: startDate.toISOString(),
    dateRangeEnd: endDate.toISOString(),
    summaryFilter: { groups: ["USER"] },
    exportType: "JSON"
  })

  const headers = new Headers({
    'X-Api-Key': clockifyRequest.apiKey,
    'Content-Type': 'application/json'
  })

  try {
    const summaryResponse = await fetch(
      `${baseUrl}/workspaces/${clockifyRequest.workspaceId}/reports/summary`,
      {
        method: 'POST',
        body: postBody,
        headers: headers
      }
    )

    if (!summaryResponse.ok) {
      throw new Error('Failed to fetch data from Clockify API')
    }

    const report = await summaryResponse.json()
    const workedHours = report.totals[0].totalTime / 60 / 60
    const expectedHours = workDays(startDate, endDate) * clockifyRequest.workdayLength
    const diffHours = workedHours - expectedHours
    const overtimePay = diffHours > 0 ? diffHours * clockifyRequest.overtimeHourlyRate : 0

    const response = {
      workedHours,
      expectedHours,
      diffHours,
      overtimePay
    }

    return NextResponse.json({ success: true, diffResponse: response })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, error: 'An error occurred while processing your request' }, { status: 500 })
  }
}
