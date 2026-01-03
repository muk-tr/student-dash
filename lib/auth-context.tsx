"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "./api"
import { AUTH_TOKEN_KEY } from "./constants"
// import { IPicticipant } from "@/dash-api/models/Participant" // Removed invalid import

// Defining a local interface matching the dash-api response structure we verified
export interface IParticipant {
    _id: string
    fullName: string
    email: string
    regNo?: string
    division?: string;
    parish?: string;
    deanery?: string;
    status: string;
    modules: {
        _id: string
        module: {
            _id: string
            title: string
        }
        enrolledAt: string
        grades: {
            name: string
            score: number
            maxScore?: number
            date?: string
        }[]
        finalScore?: number
        gradePoint?: number
        gradeLetter?: string
        status: string
    }[]
    enrolledPrograms: {
        _id: string
        title: string
    }[]
}

interface AuthContextType {
    user: IParticipant | null
    login: (regNo: string, password: string) => Promise<void>
    logout: () => void
    isLoading: boolean
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<IParticipant | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const router = useRouter()

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem(AUTH_TOKEN_KEY)
            if (!token) {
                setIsLoading(false)
                return
            }

            // Verify token and get latest user data
            const data = await api.get("/participants/me")
            // The API returns { participant: ... } based on our research of participantController.ts
            if (data && data.participant) {
                setUser(data.participant)
                setIsAuthenticated(true)
            } else {
                logout()
            }
        } catch (error) {
            console.error("Auth check failed:", error)
            logout()
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (regNo: string, password: string) => {
        const { token } = await api.post("/auth/login/student", {
            regNo,
            password,
        })
        localStorage.setItem(AUTH_TOKEN_KEY, token)
        await checkAuth()
        setIsAuthenticated(true)
        router.push("/")
    }

    const logout = () => {
        localStorage.removeItem(AUTH_TOKEN_KEY)
        setUser(null)
        setIsAuthenticated(false)
        router.push("/login")
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
