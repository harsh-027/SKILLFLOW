import API from "@/api/axios";
import type { AiLearningPath } from "@/types/ai";

export async function createAiLearningPath(targetSkill: string) {
  const { data } = await API.post<AiLearningPath>("/ai/learning-path", { targetSkill });
  return data;
}
