"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Award, CheckCircle2 } from "lucide-react"

export function ParticipantGradesView() {
  const { participant, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!participant) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md">
        Unable to load user profile. Please try logging in again.
      </div>
    )
  }

  const gpa = participant.modules.length > 0
    ? (participant.modules.reduce((sum, m) => sum + (m.gradePoint || 0), 0) / participant.modules.length).toFixed(2)
    : "0.00"

  const totalCredits = participant.modules.length * 3 // Assuming 3 credits per module for now as fallback

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gpa}</div>
            <p className="text-xs text-muted-foreground">Cumulative Grade Point Average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modules Enrolled</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participant.modules.length}</div>
            <p className="text-xs text-muted-foreground">Active and completed modules</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Academic Progress</CardTitle>
          <CardDescription>Your performance across all enrolled modules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {participant.modules.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No modules enrolled yet.</p>
            ) : (
              participant.modules.map((enrolledModule) => (
                <div key={enrolledModule._id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="font-medium">{enrolledModule.module.title}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${enrolledModule.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        enrolledModule.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                        {enrolledModule.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {enrolledModule.gradePoint ? `${enrolledModule.gradePoint} GP` : ''}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold font-mono">
                      {enrolledModule.gradeLetter || "-"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {enrolledModule.finalScore ? `${enrolledModule.finalScore}%` : "No Grade"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
