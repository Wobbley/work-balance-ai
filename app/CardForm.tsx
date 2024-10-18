'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CalendarRange } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from '@/lib/supabase/client'

type ResponseType = {
  workedHours: number;
  expectedHours: number;
  diffHours: number;
  overtimePay?: number;
};

export function CardForm() {
  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [formData, setFormData] = useState({
    workspaceId: '',
    apiKey: '',
    startDate: formatDate(firstDayOfMonth),
    endDate: formatDate(today),
    workdayLength: '7.5',
    overtimeHourlyRate: '0',
  })
  const [response, setResponse] = useState<ResponseType | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchProfileData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setIsAuthenticated(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('workspace_id, api_key, overtime_hourly_rate_post_tax')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
        } else if (data) {
          setFormData(prevData => ({
            ...prevData,
            workspaceId: data.workspace_id || '',
            apiKey: data.api_key || '',
            overtimeHourlyRate: data.overtime_hourly_rate_post_tax?.toString() || '0'
          }))
        }
      } else {
        setIsAuthenticated(false)
      }
    }

    fetchProfileData()
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value)
    })

    try {
      const res = await fetch('/api/clockify', {
        method: 'POST',
        body: form,
      })
      const data = await res.json()
      if (data.success) {
        setResponse(data.diffResponse)
      } else {
        console.error('Error:', data.error)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <Card className="w-[400px] bg-gray-800 text-white border-none shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
        <CardTitle className="text-2xl font-bold">Work Balance</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            {!isAuthenticated && (
              <>
                <div className="flex items-center space-x-3">
                  <Input 
                    id="workspaceId" 
                    placeholder="Workspace ID" 
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                    value={formData.workspaceId}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <Input 
                    id="apiKey" 
                    type="password" 
                    placeholder="API Key" 
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                    value={formData.apiKey}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}
            <div className="flex items-center space-x-3">
              <CalendarRange className="h-5 w-5 text-purple-400" />
              <Input 
                id="startDate" 
                type="date" 
                placeholder="Start Date" 
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                value={formData.startDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex items-center space-x-3">
              <CalendarRange className="h-5 w-5 text-purple-400" />
              <Input 
                id="endDate" 
                type="date" 
                placeholder="End Date" 
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </div>
            <Button type="submit" className="mt-4 bg-purple-600 hover:bg-purple-700 text-white">Calculate</Button>
          </div>
        </form>
        {response && (
          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Results:</h3>
            <p>Worked Hours: {response.workedHours.toFixed(2)}</p>
            <p>Expected Hours: {response.expectedHours.toFixed(2)}</p>
            <p>Difference: {response.diffHours.toFixed(2)}</p>
            {response.overtimePay !== undefined && (
              <p>Overtime Pay: {response.overtimePay.toFixed(2)} NOK</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}