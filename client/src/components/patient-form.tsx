import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPatientSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const patientFormSchema = insertPatientSchema.extend({
  dateOfBirth: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientFormSchema>;

interface PatientFormProps {
  onSubmit: (data: PatientFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<PatientFormData>;
  submitText?: string;
}

export function PatientForm({ 
  onSubmit, 
  isLoading = false, 
  initialData,
  submitText = "Create Patient" 
}: PatientFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialData?.dateOfBirth ? new Date(initialData.dateOfBirth) : undefined
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: initialData,
  });

  const watchedAgeGroup = watch("ageGroup");

  const onFormSubmit = (data: PatientFormData) => {
    const formattedData = {
      ...data,
      dateOfBirth: selectedDate ? selectedDate.toISOString().split('T')[0] : undefined,
    };
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter patient's full name"
            />
            {errors.name && (
              <p className="text-sm text-error-red">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="+91 98765 43210"
            />
            {errors.phone && (
              <p className="text-sm text-error-red">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select onValueChange={(value) => setValue("gender", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-sm text-error-red">{errors.gender.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ageGroup">Age Group *</Label>
            <Select onValueChange={(value) => setValue("ageGroup", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select age group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="infant">Infant (0-2 years)</SelectItem>
                <SelectItem value="child">Child (2-18 years)</SelectItem>
                <SelectItem value="adult">Adult (18-60 years)</SelectItem>
                <SelectItem value="pregnant">Pregnant Woman</SelectItem>
                <SelectItem value="elderly">Elderly (60+ years)</SelectItem>
              </SelectContent>
            </Select>
            {errors.ageGroup && (
              <p className="text-sm text-error-red">{errors.ageGroup.message}</p>
            )}
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...register("address")}
              placeholder="Enter patient's address"
              rows={2}
            />
            {errors.address && (
              <p className="text-sm text-error-red">{errors.address.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {(watchedAgeGroup === "infant" || watchedAgeGroup === "child") && (
        <Card>
          <CardHeader>
            <CardTitle>Guardian Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guardianName">Guardian Name</Label>
              <Input
                id="guardianName"
                {...register("guardianName")}
                placeholder="Enter guardian's name"
              />
              {errors.guardianName && (
                <p className="text-sm text-error-red">{errors.guardianName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianPhone">Guardian Phone</Label>
              <Input
                id="guardianPhone"
                {...register("guardianPhone")}
                placeholder="+91 98765 43210"
              />
              {errors.guardianPhone && (
                <p className="text-sm text-error-red">{errors.guardianPhone.message}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Medical Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medicalHistory">Medical History</Label>
            <Textarea
              id="medicalHistory"
              {...register("medicalHistory")}
              placeholder="Enter any relevant medical history"
              rows={3}
            />
            {errors.medicalHistory && (
              <p className="text-sm text-error-red">{errors.medicalHistory.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea
              id="allergies"
              {...register("allergies")}
              placeholder="Enter any known allergies"
              rows={2}
            />
            {errors.allergies && (
              <p className="text-sm text-error-red">{errors.allergies.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-medical-blue hover:bg-blue-700"
        >
          {isLoading ? "Saving..." : submitText}
        </Button>
      </div>
    </form>
  );
}
