"use client"

import React, { createContext, useContext } from "react"
import type { SelectedNode } from "./admin-dashboard-layout"

// Define types for hierarchical data
interface Department {
  id: string
  name: string
  code: string
  description?: string
  courses: Course[]
}

interface Course {
  id: string
  name: string
  code: string
  description?: string
  departmentId: string
  classes: Class[]
}

interface Class {
  id: string
  name: string
  code: string
  description?: string
  courseId: string
  sections: Section[]
}

interface Section {
  id: string
  name: string
  description?: string
  isPublic: boolean
  classId: string
}

interface AdminContextType {
  departments: Department[]
  selectedNode: SelectedNode
  onSelectNode: (node: SelectedNode) => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function useAdminContext() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdminContext must be used within an AdminContextProvider')
  }
  return context
}

interface AdminContextProviderProps {
  children: React.ReactNode
  departments: Department[]
  selectedNode: SelectedNode
  onSelectNode: (node: SelectedNode) => void
}

export function AdminContextProvider({ 
  children, 
  departments, 
  selectedNode, 
  onSelectNode 
}: AdminContextProviderProps) {
  return (
    <AdminContext.Provider value={{ departments, selectedNode, onSelectNode }}>
      {children}
    </AdminContext.Provider>
  )
}
