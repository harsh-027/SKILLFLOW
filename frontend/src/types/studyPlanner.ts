export type StudyPriority = "Low" | "Medium" | "High";
export type StudyStatus = "Pending" | "In Progress" | "Completed";
export type StudySource = "manual" | "ai";

export type StudyPlannerEntry = {
  _id: string;
  userId: string;
  title: string;
  subject: string;
  description?: string;
  notes?: string;
  priority: StudyPriority;
  status: StudyStatus;
  dueDate?: string | null;
  estimatedHours: number;
  actualHours: number;
  scheduledDate?: string | null;
  startTime?: string;
  durationHours: number;
  source: StudySource;
  createdAt: string;
  updatedAt: string;
};

export type StudyPlannerInput = {
  title: string;
  subject: string;
  description?: string;
  notes?: string;
  priority: StudyPriority;
  status: StudyStatus;
  dueDate?: string;
  estimatedHours: number;
  actualHours: number;
  scheduledDate?: string;
  startTime?: string;
  durationHours: number;
};

export type AiStudyScheduleInput = {
  examDate: string;
  subjects: string;
  currentSkillLevel: string;
  hoursAvailablePerDay: number;
  preferredStudyDays: string[];
  preferredSessionLength: number;
};
