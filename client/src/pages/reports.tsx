import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  Syringe,
  TrendingUp,
  FileText,
  Filter,
} from "lucide-react";

export default function Reports() {
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: vaccinationStats } = useQuery({
    queryKey: ["/api/vaccinations/stats"],
  });

  const mockReports = [
    {
      id: 1,
      title: "Monthly Vaccination Report",
      description: "Summary of vaccinations completed this month",
      type: "monthly",
      generated: "2024-12-10",
      status: "ready",
    },
    {
      id: 2,
      title: "Patient Demographics Report",
      description: "Breakdown of patients by age group and location",
      type: "demographics",
      generated: "2024-12-09",
      status: "ready",
    },
    {
      id: 3,
      title: "Overdue Vaccinations Report",
      description: "List of patients with overdue vaccinations",
      type: "overdue",
      generated: "2024-12-08",
      status: "ready",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-success-green text-white";
      case "generating":
        return "bg-warning-orange text-white";
      case "error":
        return "bg-error-red text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">
            Generate and view health statistics and reports
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button className="bg-medical-blue hover:bg-blue-700">
            <FileText className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.totalPatients || 0}
                </p>
                <p className="text-xs text-success-green">+5.2% this month</p>
              </div>
              <div className="bg-medical-blue bg-opacity-10 p-3 rounded-full">
                <Users className="text-medical-blue h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vaccinations This Month</p>
                <p className="text-2xl font-semibold text-success-green">
                  {vaccinationStats?.completed || 0}
                </p>
                <p className="text-xs text-success-green">+12.3% vs last month</p>
              </div>
              <div className="bg-success-green bg-opacity-10 p-3 rounded-full">
                <Syringe className="text-success-green h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-semibold text-medical-blue">94.2%</p>
                <p className="text-xs text-success-green">+2.1% improvement</p>
              </div>
              <div className="bg-medical-blue bg-opacity-10 p-3 rounded-full">
                <TrendingUp className="text-medical-blue h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue Cases</p>
                <p className="text-2xl font-semibold text-error-red">
                  {vaccinationStats?.overdue || 0}
                </p>
                <p className="text-xs text-error-red">-8.1% vs last month</p>
              </div>
              <div className="bg-error-red bg-opacity-10 p-3 rounded-full">
                <Calendar className="text-error-red h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Generation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vaccination">Vaccination Summary</SelectItem>
                    <SelectItem value="demographics">Patient Demographics</SelectItem>
                    <SelectItem value="overdue">Overdue Vaccinations</SelectItem>
                    <SelectItem value="monthly">Monthly Report</SelectItem>
                    <SelectItem value="annual">Annual Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Time Period</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current-month">Current Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Format</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    <SelectItem value="csv">CSV Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full bg-health-green hover:bg-green-700">
                <BarChart3 className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{report.title}</h3>
                      <Badge className={`text-xs ${getStatusColor(report.status)}`}>
                        {report.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Generated: {report.generated}
                      </span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Download className="mr-1 h-3 w-3" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>More reports will appear here</p>
                <p className="text-sm mt-2">Generate your first report to get started</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Vaccination Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-500">
              <BarChart3 className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Chart visualization will be implemented here</p>
              <p className="text-sm mt-2">Showing vaccination trends over time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
