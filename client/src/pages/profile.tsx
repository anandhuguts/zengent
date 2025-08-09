import React from "react";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  Shield, 
  Bot,
  Activity,
  Settings,
  Camera
} from "lucide-react";
import { format } from "date-fns";

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading user information...</p>
        </div>
      </Layout>
    );
  }

  const accessibleAgents = [
    {
      name: "Java Agent",
      description: "Spring Boot & enterprise patterns analysis",
      status: "active",
      lastUsed: "2025-01-08"
    },
    {
      name: "PySpark Agent", 
      description: "Big data processing pipeline analysis",
      status: "active",
      lastUsed: "2025-01-07"
    },
    {
      name: "Mainframe Agent",
      description: "COBOL programs & JCL job analysis", 
      status: "active",
      lastUsed: "2025-01-05"
    },
    {
      name: "Python Agent",
      description: "Django/Flask framework analysis",
      status: "active", 
      lastUsed: "2025-01-06"
    },
    {
      name: "Code Lens Agent",
      description: "Demographic field & integration analysis",
      status: "active",
      lastUsed: "2025-01-08"
    },
    {
      name: "Match Lens Agent", 
      description: "Field matching with C360 data",
      status: "active",
      lastUsed: "2025-01-07"
    },
    {
      name: "Validator Agent",
      description: "Security & privacy compliance validation",
      status: "active",
      lastUsed: "2025-01-08"
    },
    {
      name: "Responsible Agent",
      description: "AI/ML safety & governance framework",
      status: "active",
      lastUsed: "2025-01-06"
    }
  ];

  const sessionInfo = {
    loginTime: new Date(),
    ipAddress: "192.168.1.100",
    browser: "Chrome 120.0",
    location: "Mumbai, India",
    sessionDuration: "2h 15m"
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and view your activity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader className="text-center">
                <div className="relative mx-auto w-24 h-24 mb-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <CardTitle className="text-xl">{user.username}</CardTitle>
                <CardDescription>{user.email || "No email provided"}</CardDescription>
                <Badge variant="secondary" className="w-fit mx-auto mt-2">
                  <Shield className="w-3 h-3 mr-1" />
                  Active User
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Member since</p>
                    <p className="text-gray-600">{format(new Date(user.createdAt), "MMM dd, yyyy")}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Activity className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Last updated</p>
                    <p className="text-gray-600">{format(new Date(user.updatedAt), "MMM dd, yyyy")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Current Session</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Login time:</span>
                  <span className="font-medium">{format(sessionInfo.loginTime, "MMM dd, HH:mm")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{sessionInfo.sessionDuration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IP Address:</span>
                  <span className="font-medium">{sessionInfo.ipAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Browser:</span>
                  <span className="font-medium">{sessionInfo.browser}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{sessionInfo.location}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details & Agents */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Personal Details</span>
                </CardTitle>
                <CardDescription>Your account information and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-sm">{user.username}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-sm">{user.email || "Not provided"}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-sm">{user.firstName || "Not provided"}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-sm">{user.lastName || "Not provided"}</p>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Change Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Accessible Agents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5" />
                  <span>Accessible AI Agents</span>
                </CardTitle>
                <CardDescription>AI agents available for your analysis projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accessibleAgents.map((agent, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{agent.name}</h4>
                        <Badge 
                          variant={agent.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {agent.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">{agent.description}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Last used: {agent.lastUsed}</span>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}