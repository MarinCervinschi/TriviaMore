"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Settings, Save, RefreshCw, Database, Mail, Shield, Palette } from "lucide-react"

export function SettingsManager() {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: "TriviaMore",
    siteDescription: "Your ultimate study companion for university students",
    contactEmail: "admin@triviamore.com",
    supportEmail: "support@triviamore.com",

    // Quiz Settings
    defaultQuizTimeLimit: 30,
    maxQuestionsPerQuiz: 50,
    passingScore: 70,
    allowRetakes: true,
    showCorrectAnswers: true,
    randomizeQuestions: true,

    // User Settings
    allowSelfRegistration: true,
    requireEmailVerification: false,
    defaultUserRole: "STUDENT",
    sessionTimeout: 24,

    // Content Settings
    defaultSectionVisibility: "public",
    allowBookmarks: true,
    enableFlashcards: true,
    enableProgressTracking: true,

    // Notification Settings
    emailNotifications: true,
    quizCompletionNotifications: true,
    weeklyProgressReports: false,
    systemMaintenanceNotifications: true,

    // Security Settings
    passwordMinLength: 8,
    requireStrongPasswords: true,
    enableTwoFactor: false,
    maxLoginAttempts: 5,
    lockoutDuration: 15,

    // Appearance Settings
    primaryColor: "#d14124",
    enableDarkMode: false,
    customLogo: "",
    customFavicon: "",
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Settings saved:", settings)
      // Show success message
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all settings to default values?")) {
      // Reset to default values
      console.log("Settings reset to defaults")
    }
  }

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">System Settings</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-[#d14124] hover:bg-[#b8371f]">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#d14124]" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => updateSetting("siteName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => updateSetting("siteDescription", e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => updateSetting("contactEmail", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => updateSetting("supportEmail", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quiz Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#d14124]" />
              Quiz Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="defaultQuizTimeLimit">Default Time Limit (minutes)</Label>
              <Input
                id="defaultQuizTimeLimit"
                type="number"
                value={settings.defaultQuizTimeLimit}
                onChange={(e) => updateSetting("defaultQuizTimeLimit", Number.parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="maxQuestionsPerQuiz">Max Questions per Quiz</Label>
              <Input
                id="maxQuestionsPerQuiz"
                type="number"
                value={settings.maxQuestionsPerQuiz}
                onChange={(e) => updateSetting("maxQuestionsPerQuiz", Number.parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="passingScore">Passing Score (%)</Label>
              <Input
                id="passingScore"
                type="number"
                value={settings.passingScore}
                onChange={(e) => updateSetting("passingScore", Number.parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="allowRetakes">Allow Quiz Retakes</Label>
              <Switch
                id="allowRetakes"
                checked={settings.allowRetakes}
                onCheckedChange={(checked) => updateSetting("allowRetakes", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showCorrectAnswers">Show Correct Answers</Label>
              <Switch
                id="showCorrectAnswers"
                checked={settings.showCorrectAnswers}
                onCheckedChange={(checked) => updateSetting("showCorrectAnswers", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="randomizeQuestions">Randomize Questions</Label>
              <Switch
                id="randomizeQuestions"
                checked={settings.randomizeQuestions}
                onCheckedChange={(checked) => updateSetting("randomizeQuestions", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* User Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#d14124]" />
              User Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="allowSelfRegistration">Allow Self Registration</Label>
              <Switch
                id="allowSelfRegistration"
                checked={settings.allowSelfRegistration}
                onCheckedChange={(checked) => updateSetting("allowSelfRegistration", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
              <Switch
                id="requireEmailVerification"
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => updateSetting("requireEmailVerification", checked)}
              />
            </div>
            <div>
              <Label htmlFor="defaultUserRole">Default User Role</Label>
              <Select
                value={settings.defaultUserRole}
                onValueChange={(value) => updateSetting("defaultUserRole", value)}
              >
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
              <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => updateSetting("sessionTimeout", Number.parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#d14124]" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="quizCompletionNotifications">Quiz Completion Notifications</Label>
              <Switch
                id="quizCompletionNotifications"
                checked={settings.quizCompletionNotifications}
                onCheckedChange={(checked) => updateSetting("quizCompletionNotifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="weeklyProgressReports">Weekly Progress Reports</Label>
              <Switch
                id="weeklyProgressReports"
                checked={settings.weeklyProgressReports}
                onCheckedChange={(checked) => updateSetting("weeklyProgressReports", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="systemMaintenanceNotifications">System Maintenance Notifications</Label>
              <Switch
                id="systemMaintenanceNotifications"
                checked={settings.systemMaintenanceNotifications}
                onCheckedChange={(checked) => updateSetting("systemMaintenanceNotifications", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#d14124]" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
              <Input
                id="passwordMinLength"
                type="number"
                value={settings.passwordMinLength}
                onChange={(e) => updateSetting("passwordMinLength", Number.parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="requireStrongPasswords">Require Strong Passwords</Label>
              <Switch
                id="requireStrongPasswords"
                checked={settings.requireStrongPasswords}
                onCheckedChange={(checked) => updateSetting("requireStrongPasswords", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="enableTwoFactor">Enable Two-Factor Authentication</Label>
              <Switch
                id="enableTwoFactor"
                checked={settings.enableTwoFactor}
                onCheckedChange={(checked) => updateSetting("enableTwoFactor", checked)}
              />
            </div>
            <div>
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => updateSetting("maxLoginAttempts", Number.parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
              <Input
                id="lockoutDuration"
                type="number"
                value={settings.lockoutDuration}
                onChange={(e) => updateSetting("lockoutDuration", Number.parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#d14124]" />
              Appearance Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => updateSetting("primaryColor", e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => updateSetting("primaryColor", e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="enableDarkMode">Enable Dark Mode</Label>
              <Switch
                id="enableDarkMode"
                checked={settings.enableDarkMode}
                onCheckedChange={(checked) => updateSetting("enableDarkMode", checked)}
              />
            </div>
            <div>
              <Label htmlFor="customLogo">Custom Logo URL</Label>
              <Input
                id="customLogo"
                value={settings.customLogo}
                onChange={(e) => updateSetting("customLogo", e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <Label htmlFor="customFavicon">Custom Favicon URL</Label>
              <Input
                id="customFavicon"
                value={settings.customFavicon}
                onChange={(e) => updateSetting("customFavicon", e.target.value)}
                placeholder="https://example.com/favicon.ico"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="bg-[#d14124] hover:bg-[#b8371f]">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  )
}
