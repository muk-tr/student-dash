// Types for detailed module tracking

export type AttendanceScore = 0 | 1
export type ParticipationScore = 0 | 1 | 2 | 3 | 4
export type SubmissionScore = 0 | 1 | 2 | 3 | 4
export type QuizScore = 0 | 1
export type ModeType = "Z" | "P" | "SS" | "PGS"

export const MODE_LABELS: Record<ModeType, string> = {
  Z: "Zoom",
  P: "Physical",
  SS: "Self Study",
  PGS: "Parish Group Study",
}

export const PARTICIPATION_LABELS: Record<ParticipationScore, string> = {
  0: "None",
  1: "Minimal",
  2: "Few",
  3: "Moderate",
  4: "Great",
}

export const SUBMISSION_LABELS: Record<SubmissionScore, string> = {
  0: "None",
  1: "Late/incomplete/not well done",
  2: "Late/complete/well done",
  3: "Timely/incomplete/not well done",
  4: "Timely/complete/well done",
}

export interface ModuleCategory {
  id: string
  name: string
  order_index: number
}

export interface Module {
  id: string
  category_id: string
  name: string
  order_index: number
  has_quiz: boolean
  has_posts: boolean
}

export interface StudentModuleAssessment {
  id?: string
  student_id: string
  module_id: string
  term: string
  attendance: AttendanceScore
  mode: ModeType | null
  participation: ParticipationScore
  submission: SubmissionScore
  post1?: SubmissionScore
  post2?: SubmissionScore
  quiz_score?: QuizScore
  notes?: string
}

export interface StudentSpecialData {
  student_id: string
  top_five_talents?: string
  top_four_gifts?: string
}
