"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AlertCircle } from "lucide-react"

export function DetailedGradesView() {
  const { participant, isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!participant) {
    return <div>Please log in to view grades.</div>
  }

  if (participant.modules.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/20">
        <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Enrolled Modules</h3>
        <p className="text-muted-foreground">You are not enrolled in any modules yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Detailed Grades</h2>
          <p className="text-muted-foreground">View your comprehensive assessment breakdown</p>
        </div>
      </div>

      <div className="grid gap-6">
        {participant.modules.map((mod) => (
          <Card key={mod._id}>
            <CardHeader>
              <CardTitle>{mod.module.title}</CardTitle>
              <CardDescription>
                Status: <span className="font-medium">{mod.status}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment Name</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Max Score</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mod.grades && mod.grades.length > 0 ? (
                    mod.grades.map((grade, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{grade.name}</TableCell>
                        <TableCell>{grade.score}</TableCell>
                        <TableCell>{grade.maxScore || "-"}</TableCell>
                        <TableCell className="text-right">{grade.date ? new Date(grade.date).toLocaleDateString() : "-"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                        No individual grades recorded yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {mod.finalScore !== undefined && (
                    <TableRow className="font-bold bg-muted/50">
                      <TableCell>Final Score</TableCell>
                      <TableCell>{mod.finalScore}</TableCell>
                      <TableCell>100</TableCell>
                      <TableCell className="text-right">-</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
