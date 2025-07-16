"use client"

import type React from "react"

import type { ReactNode } from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  BookOpen,
  Users,
  GraduationCap,
  BookMarked,
  FileQuestion,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Home,
} from "lucide-react"
import { MockAPI } from "@/lib/mock-api"
import { AdminContextProvider } from "./admin-context" // Import AdminContextProvider

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

export type NodeType = "department" | "course" | "class" | "section" | "question" | "root"

export interface SelectedNode {
  type: NodeType
  id?: string
  name?: string
  parentId?: string // For navigating back up or filtering children
}

interface AdminDashboardLayoutProps {
  children: ReactNode
  user: any
}

// Recursive Tree Node Component
interface HierarchyTreeNodeProps {
  node: Department | Course | Class | Section
  nodeType: Exclude<NodeType, "root" | "question">
  selectedNode: SelectedNode
  onSelectNode: (node: SelectedNode) => void
  depth: number
}

const HierarchyTreeNode: React.FC<HierarchyTreeNodeProps> = ({ node, nodeType, selectedNode, onSelectNode, depth }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const isSelected = selectedNode.id === node.id && selectedNode.type === nodeType

  const getChildren = (parentNode: any, parentType: Exclude<NodeType, "root" | "question">) => {
    switch (parentType) {
      case "department":
        return (parentNode as Department).courses
      case "course":
        return (parentNode as Course).classes
      case "class":
        return (parentNode as Class).sections
      case "section":
        return [] // Sections don't have children in the tree, questions are in main content
      default:
        return []
    }
  }

  const children = getChildren(node, nodeType)
  const hasChildren = children && children.length > 0

  const Icon =
    nodeType === "department"
      ? BookOpen
      : nodeType === "course"
        ? GraduationCap
        : nodeType === "class"
          ? BookMarked
          : nodeType === "section"
            ? FileQuestion
            : null

  return (
    <div className="space-y-1">
      <div
        className={`flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
          isSelected ? "bg-[#d14124] text-white shadow-sm" : "text-gray-700 hover:bg-gray-50"
        }`}
        style={{ paddingLeft: `${depth * 1.25 + 0.75}rem` }}
        onClick={() => {
          onSelectNode({ type: nodeType, id: node.id, name: node.name })
          if (hasChildren) {
            setIsExpanded(!isExpanded)
          }
        }}
      >
        {hasChildren && (isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
        {!hasChildren && <span className="w-4 h-4 inline-block" />} {/* Spacer for alignment */}
        {Icon && <Icon className="w-4 h-4" />}
        <span className="truncate">{node.name}</span>
      </div>
      {isExpanded && hasChildren && (
        <div className="ml-2">
          {children.map((child: any) => (
            <HierarchyTreeNode
              key={child.id}
              node={child}
              nodeType={
                nodeType === "department"
                  ? "course"
                  : nodeType === "course"
                    ? "class"
                    : nodeType === "class"
                      ? "section"
                      : "department" // Fallback, should not happen
              }
              selectedNode={selectedNode}
              onSelectNode={onSelectNode}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function AdminDashboardLayout({ children, user }: AdminDashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true)
  const [selectedNode, setSelectedNode] = useState<SelectedNode>({ type: "root" })

  useEffect(() => {
    const loadDepartments = async () => {
      setIsLoadingDepartments(true)
      try {
        const data = await MockAPI.getDepartments()
        // Augment data with full hierarchy for easier filtering/display
        const augmentedDepartments = data.map((dept) => ({
          ...dept,
          courses: dept.courses.map((course) => ({
            ...course,
            departmentId: dept.id,
            classes: course.classes.map((cls) => ({
              ...cls,
              courseId: course.id,
              departmentId: dept.id,
              sections: cls.sections.map((section) => ({
                ...section,
                classId: cls.id,
                courseId: course.id,
                departmentId: dept.id,
              })),
            })),
          })),
        }))
        setDepartments(augmentedDepartments)
      } catch (error) {
        console.error("Error loading departments for admin layout:", error)
      } finally {
        setIsLoadingDepartments(false)
      }
    }
    loadDepartments()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: Home, current: pathname === "/admin" },
    { name: "Data Management", href: "/admin/data", icon: BookOpen, current: pathname === "/admin/data" },
    { name: "Users", href: "/admin/users", icon: Users, current: pathname === "/admin/users" },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3, current: pathname === "/admin/analytics" },
    { name: "Settings", href: "/admin/settings", icon: Settings, current: pathname === "/admin/settings" },
  ]

  // Wrap children with AdminContextProvider only for data management pages
  const childrenWithContext = (pathname === "/admin" || pathname === "/admin/data") ? (
    <AdminContextProvider departments={departments} selectedNode={selectedNode} onSelectNode={setSelectedNode}>
      {children}
    </AdminContextProvider>
  ) : (
    children
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Integrated Sidebar - Fixed height */}
      <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
        {/* Sidebar Header - Fixed */}
        <div className="h-20 px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#d14124] rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">TriviaMore</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Content - Scrollable */}
        <div className="flex-1 px-4 py-6 overflow-y-auto min-h-0">
          <div className="space-y-8">
            {/* Admin Navigation */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Navigation</h3>
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        item.current
                          ? "bg-[#d14124] text-white shadow-sm"
                          : "text-gray-700 hover:text-[#d14124] hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Content Hierarchy - Show only for Data Management page */}
            {pathname === "/admin/data" && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Content Structure</h3>
                {isLoadingDepartments ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-[#d14124] rounded-full animate-spin"></div>
                    Loading hierarchy...
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div
                      className={`flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        selectedNode.type === "root" 
                          ? "bg-[#d14124] text-white shadow-sm" 
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedNode({ type: "root" })}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>All Departments</span>
                    </div>
                    {departments.map((dept) => (
                      <HierarchyTreeNode
                        key={dept.id}
                        node={dept}
                        nodeType="department"
                        selectedNode={selectedNode}
                        onSelectNode={setSelectedNode}
                        depth={0}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer - Fixed */}
        <div className="px-4 py-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {user.username?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.username}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="w-full justify-start text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content Area - Independent height */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar - Fixed */}
        <header className="bg-white border-b border-gray-200 h-20 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {navigation.find(item => item.current)?.name || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {pathname === "/admin" && "Overview and quick access to admin tools"}
                {pathname === "/admin/data" && "Manage departments, courses, classes, and questions"}
                {pathname === "/admin/users" && "User accounts and permissions management"}
                {pathname === "/admin/analytics" && "Performance metrics and insights"}
                {pathname === "/admin/settings" && "System configuration and preferences"}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </header>

        {/* Page Content - Scrollable independently */}
        <main className="flex-1 p-6 overflow-auto bg-gray-50 min-h-0">
          {childrenWithContext}
        </main>
      </div>
    </div>
  )
}
