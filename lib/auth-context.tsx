"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "./api"
import { AUTH_TOKEN_KEY } from "./constants"

// Matches dash-api/models/Participant.ts
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

            // Mock user data matching backend schema
            const mockUser: IParticipant = {
                _id: "mock-user-id",
                fullName: "Test Student",
                email: "test@student.com",
                regNo: "TEST/2026/001",
                division: "Test Division",
                parish: "Test Parish",
                deanery: "Test Deanery",
                status: "active",
                modules: [
                    {
                        _id: "m1",
                        module: { _id: "mod1", title: "Introduction to Computer Science" },
                        enrolledAt: new Date().toISOString(),
                        grades: [{ name: "Midterm", score: 85, maxScore: 100 }],
                        status: "Completed",
                        finalScore: 85,
                        gradeLetter: "A",
                        gradePoint: 4.0
                    },
                    {
                        _id: "m2",
                        module: { _id: "mod2", title: "Data Structures" },
                        enrolledAt: new Date().toISOString(),
                        grades: [],
                        status: "In Progress"
                    }
                ],
                enrolledPrograms: [{ _id: "prog1", title: "Computer Science" }]
            }

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            setUser(mockUser)
            setIsAuthenticated(true)
        } catch (error) {
            console.error("Auth check failed:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (regNo: string, password: string) => {
        // Mock login - accept any credentials
        // const { token } = await api.post("/auth/login/student", {
        //     regNo,
        //     password,
        // })

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockToken = "mock-jwt-token";
        localStorage.setItem(AUTH_TOKEN_KEY, mockToken)
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
