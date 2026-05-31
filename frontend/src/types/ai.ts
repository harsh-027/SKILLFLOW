export type AiSkillRecommendation = {
  id: string;
  name: string;
  confidence: number;
  reason: string;
};

export type AiLearningPathStep = {
  title: string;
  description: string;
  duration: string;
  difficulty: string;
};

export type AiLearningPathLevel = {
  phase: "Beginner" | "Intermediate" | "Advanced";
  steps: AiLearningPathStep[];
};

export type AiLearningPath = {
  _id: string;
  targetSkill: string;
  title: string;
  summary: string;
  source: string;
  generatedAt: string;
  fallback: boolean;
  levels: AiLearningPathLevel[];
};
