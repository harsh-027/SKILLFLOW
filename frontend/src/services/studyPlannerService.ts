import API from "@/api/axios";
import type { AiStudyScheduleInput, StudyPlannerEntry, StudyPlannerInput } from "@/types/studyPlanner";

export async function getStudyPlannerEntries() {
  const { data } = await API.get<StudyPlannerEntry[]>("/study-planner");
  return data;
}

export async function createStudyPlannerEntry(payload: StudyPlannerInput) {
  const { data } = await API.post<StudyPlannerEntry>("/study-planner", payload);
  return data;
}

export async function updateStudyPlannerEntry(id: string, payload: StudyPlannerInput) {
  const { data } = await API.put<StudyPlannerEntry>(`/study-planner/${id}`, payload);
  return data;
}

export async function deleteStudyPlannerEntry(id: string) {
  await API.delete(`/study-planner/${id}`);
}

export async function generateAiStudySchedule(payload: AiStudyScheduleInput) {
  const { data } = await API.post<StudyPlannerEntry[]>("/study-planner/generate-ai", payload);
  return data;
}
