import API from "@/api/axios";
import type { AiLearningPath, AiSkillRecommendation } from "@/types/ai";

export async function fetchRecommendedSkills(skill?: string) {
  const { data } = await API.get<{ recommendations: AiSkillRecommendation[]; generatedAt: string }>(
    "/ai/recommended-skills",
    {
      params: skill?.trim() ? { skill } : undefined,
    }
  );
  return data;
}

export async function createAiLearningPath(targetSkill: string) {
  const { data } = await API.post<AiLearningPath>("/ai/learning-path", { targetSkill });
  return data;
}
