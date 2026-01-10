"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "./api"
import { AUTH_TOKEN_KEY } from "./constants"

export interface IParticipant {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    regNo?: string;
    division?: string;
    parish?: string;
    deanery?: string;
    modules: {
        _id: string;
        module: {
            _id: string;
            title: string;
        };
        enrolledAt: string;
        grades: {
            name: string;
            score: number;
            maxScore?: number;
            date?: string;
        }[];
        finalScore?: number;
        gradePoint?: number;
        gradeLetter?: string;
        status: 'Registered' | 'In Progress' | 'Completed' | 'dropped' | 'enrolled';
    }[];
    enrolledPrograms: {
        _id: string;
        title: string;
    }[];
    status: 'active' | 'inactive' | 'graduated';
    createdAt?: string;
}

interface AuthContextType {
    participant: IParticipant | null
    login: (participantId: string, password: string) => Promise<void>
    logout: () => void
    isLoading: boolean
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [participant, setParticipant] = useState<IParticipant | null>(null)
    const [isLoading, setIsLoading] = useState(true) // Set to true initially while checking auth
    const [isAuthenticated, setIsAuthenticated] = useState(false) // Set to false initially
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

            const { participant } = await api.get("/participants/me")

            setParticipant(participant)
            setIsAuthenticated(true)

        } catch (error) {
            console.error("Auth check failed:", error)
            logout()
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (participantId: string, password: string) => {
        setIsLoading(true)
        try {
            const { token } = await api.post("/auth/login", {
                participantId,
                password,
            })

            localStorage.setItem(AUTH_TOKEN_KEY, token)

            await checkAuth()
            router.push("/")
        } catch (error) {
            console.error("Login failed:", error)
            setIsLoading(false)
            setIsAuthenticated(false)
            throw error
        }
    }

    const logout = () => {
        localStorage.removeItem(AUTH_TOKEN_KEY)
        setParticipant(null)
        setIsAuthenticated(false)
        router.push("/login")
    }

    return (
        <AuthContext.Provider value={{ participant, login, logout, isLoading, isAuthenticated }}>
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
