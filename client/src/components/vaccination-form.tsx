import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVaccinationSchema } from "@shared/schema";
import { z } from "zod";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Vaccine, Patient } from "@shared/schema";

const vaccinationFormSchema = insertVaccinationSchema.extend({
  scheduledDate: z.string().optional(),
  administeredDate: z.string().optional(),
});

type VaccinationFormData = z.infer<typeof vaccinationFormSchema>;

interface VaccinationFormProps {
  onSubmit: (data: VaccinationFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<VaccinationFormData>;
  submitText?: string;
  patientId?: number;
}

export function VaccinationForm({ 
  onSubmit, 
  isLoading = false, 
  initialData,
  submitText = "Schedule Vaccination",
  patientId 
}: VaccinationFormProps) {
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    initialData?.scheduledDate ? new Date(initialData.scheduledDate) : undefined
  );
  const [administeredDate, setAdministeredDate] = useState<Date | undefined>(
    initialData?.administeredDate ? new Date(initialData.administeredDate) : undefined
  );

  const { data: vaccines } = useQuery<Vaccine[]>({
    queryKey: ["/api/vaccines"],
  });

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    enabled: !patientId,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VaccinationFormData>({
    resolver: zodResolver(vaccinationFormSchema),
    defaultValues: {
      ...initialData,
      patientId: patientId || initialData?.patientId,
    },
  });

  const watchedStatus = watch("status");

  const onFormSubmit = (data: VaccinationFormData) => {
    const formattedData = {
      ...data,
      scheduledDate: scheduledDate ? scheduledDate.toISOString().split('T')[0] : undefined,
      administeredDate: administeredDate ? administeredDate.toISOString().split('T')[0] : undefined,
    };
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vaccination Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!patientId && (
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient *</Label>
              <Select onValueChange={(value) => setValue("patientId", parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients?.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.name} ({patient.patientId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.patientId && (
                <p className="text-sm text-error-red">{errors.patientId.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="vaccineId">Vaccine *</Label>
            <Select onValueChange={(value) => setValue("vaccineId", parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select vaccine" />
              </SelectTrigger>
              <SelectContent>
                {vaccines?.map((vaccine) => (
                  <SelectItem key={vaccine.id} value={vaccine.id.toString()}>
                    {vaccine.name} - {vaccine.ageGroup}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.vaccineId && (
              <p className="text-sm text-error-red">{errors.vaccineId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="doseNumber">Dose Number *</Label>
            <Input
              id="doseNumber"
              type="number"
              min="1"
              {...register("doseNumber", { valueAsNumber: true })}
              placeholder="Enter dose number"
            />
            {errors.doseNumber && (
              <p className="text-sm text-error-red">{errors.doseNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select onValueChange={(value) => setValue("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="missed">Missed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-error-red">{errors.status.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Scheduled Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !scheduledDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {(watchedStatus === "completed") && (
            <div className="space-y-2">
              <Label>Administered Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !administeredDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {administeredDate ? format(administeredDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={administeredDate}
                    onSelect={setAdministeredDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Enter any additional notes"
              rows={3}
            />
            {errors.notes && (
              <p className="text-sm text-error-red">{errors.notes.message}</p>
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
          className="bg-health-green hover:bg-green-700"
        >
          {isLoading ? "Saving..." : submitText}
        </Button>
      </div>
    </form>
  );
}
