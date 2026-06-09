import { useEffect, useMemo, useState } from "react";
import LearningPathPanel from "@/components/ai/LearningPathPanel";
import { useApp } from "@/context/AppContext";
import { createAiLearningPath } from "@/services/aiService";
import type { AiLearningPath } from "@/types/ai";

export default function AiPage() {
  const { currentUser, addToast, bootstrapping } = useApp();
  const [roadmapSkill, setRoadmapSkill] = useState("");
  const [learningPath, setLearningPath] = useState<AiLearningPath | null>(null);
  const [loadingPath, setLoadingPath] = useState(false);

  const skillSuggestions = useMemo(() => {
    if (!currentUser) return [];

    return Array.from(
      new Set(
        [
          ...(currentUser.skillsOffered || []),
          ...(currentUser.skillsWanted || []),
        ].filter(Boolean)
      )
    );
  }, [currentUser]);

  useEffect(() => {
    if (!roadmapSkill && skillSuggestions.length) {
      setRoadmapSkill(skillSuggestions[0]);
    }
  }, [roadmapSkill, skillSuggestions]);

  const handleGenerateLearningPath = async (targetSkill: string) => {
    setLoadingPath(true);
    try {
      const nextPath = await createAiLearningPath(targetSkill);
      setLearningPath(nextPath);
      setRoadmapSkill(nextPath.targetSkill);
      addToast(`Generated ${nextPath.targetSkill}.`, "success");
    } catch {
      addToast("Unable to generate path.", "error");
    } finally {
      setLoadingPath(false);
    }
  };

  if (bootstrapping) {
    return <div className="page"><div className="card">Loading AI tools...</div></div>;
  }

  if (!currentUser) return null;

  return (
    <div className="page min-w-0 ai-page">
      <header className="dashboard-section-head ai-page-header">
        <div>
          <h1 className="section-title">AI workspace</h1>
        </div>
      </header>

      <div className="dashboard-main-grid dashboard-main-grid-single ai-page-grid">
        <LearningPathPanel
          learningPath={learningPath}
          loading={loadingPath}
          onGenerate={handleGenerateLearningPath}
          targetSkill={roadmapSkill}
          onTargetSkillChange={setRoadmapSkill}
          suggestions={skillSuggestions}
        />
      </div>
    </div>
  );
}
