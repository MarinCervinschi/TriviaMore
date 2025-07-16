"use client"

import type React from "react"
import { Users } from "lucide-react" // Declare the Users variable here

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Edit, Trash2, Search, UserCheck, UserX, Mail, Calendar } from "lucide-react"

const mockUsers = [
  {
    id: "user-1",
    username: "student1",
    email: "student1@example.com",
    role: "STUDENT",
    createdAt: "2024-01-15",
    lastLogin: "2024-01-20",
    status: "active",
    quizzesTaken: 15,
    averageScore: 85.2,
  },
  {
    id: "user-2",
    username: "student2",
    email: "student2@example.com",
    role: "STUDENT",
    createdAt: "2024-01-10",
    lastLogin: "2024-01-19",
    status: "active",
    quizzesTaken: 8,
    averageScore: 78.5,
  },
  {
    id: "admin-1",
    username: "admin",
    email: "admin@example.com",
    role: "ADMIN",
    createdAt: "2024-01-01",
    lastLogin: "2024-01-20",
    status: "active",
    quizzesTaken: 0,
    averageScore: 0,
  },
  {
    id: "user-3",
    username: "student3",
    email: "student3@example.com",
    role: "STUDENT",
    createdAt: "2024-01-12",
    lastLogin: "2024-01-18",
    status: "inactive",
    quizzesTaken: 3,
    averageScore: 65.0,
  },
]

export function UserManager() {
  const [users, setUsers] = useState(mockUsers)
  const [filteredUsers, setFilteredUsers] = useState(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "STUDENT",
    status: "active",
  })

  useEffect(() => {
    filterUsers()
  }, [searchTerm, roleFilter, statusFilter, users])

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (roleFilter !== "ALL") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((user) => user.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (editingUser) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === editingUser.id
              ? {
                  ...user,
                  ...formData,
                }
              : user,
          ),
        )
      } else {
        const newUser = {
          id: `user-${Date.now()}`,
          ...formData,
          createdAt: new Date().toISOString().split("T")[0],
          lastLogin: "Never",
          quizzesTaken: 0,
          averageScore: 0,
        }
        setUsers((prev) => [...prev, newUser])
      }

      setShowForm(false)
      setEditingUser(null)
      setFormData({ username: "", email: "", role: "STUDENT", status: "active" })
    } catch (error) {
      console.error("Error saving user:", error)
    }
  }

  const handleEdit = (user: any) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user: ${username}?`)) return

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setUsers((prev) => prev.filter((user) => user.id !== id))
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  const toggleUserStatus = async (id: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      setUsers((prev) =>
        prev.map((user) =>
          user.id === id
            ? {
                ...user,
                status: user.status === "active" ? "inactive" : "active",
              }
            : user,
        ),
      )
    } catch (error) {
      console.error("Error toggling user status:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button onClick={() => setShowForm(true)} className="bg-[#d14124] hover:bg-[#b8371f]">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="roleFilter">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="statusFilter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingUser ? "Edit User" : "Add New User"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-[#d14124] hover:bg-[#b8371f]">
                  {editingUser ? "Update" : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingUser(null)
                    setFormData({ username: "", email: "", role: "STUDENT", status: "active" })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-[#d14124] text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{user.username}</h3>
                      <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="badge-primary">
                        {user.role}
                      </Badge>
                      <Badge variant={user.status === "active" ? "default" : "secondary"}>
                        {user.status === "active" ? (
                          <UserCheck className="w-3 h-3 mr-1" />
                        ) : (
                          <UserX className="w-3 h-3 mr-1" />
                        )}
                        {user.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Joined: {user.createdAt}
                      </div>
                    </div>
                    {user.role === "STUDENT" && (
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span>Quizzes: {user.quizzesTaken}</span>
                        <span>Avg Score: {user.averageScore.toFixed(1)}%</span>
                        <span>Last Login: {user.lastLogin}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleUserStatus(user.id)}
                    className={user.status === "active" ? "text-red-600" : "text-green-600"}
                  >
                    {user.status === "active" ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(user.id, user.username)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No users found</h3>
              <p>Try adjusting your search criteria or add a new user.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
