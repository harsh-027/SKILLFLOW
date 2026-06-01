import { startTransition, useEffect, useMemo, useState } from "react";
import AiSectionSkeleton from "@/components/ai/AiSectionSkeleton";
import LearningPathPanel from "@/components/ai/LearningPathPanel";
import SkillRecommendationsPanel from "@/components/ai/SkillRecommendationsPanel";
import { useApp } from "@/context/AppContext";
import { createAiLearningPath, fetchRecommendedSkills } from "@/services/aiService";
import type { AiLearningPath, AiSkillRecommendation } from "@/types/ai";

export default function AiPage() {
  const { currentUser, addToast, updateProfile, bootstrapping } = useApp();
  const [roadmapSkill, setRoadmapSkill] = useState("");
  const [recommendations, setRecommendations] = useState<AiSkillRecommendation[]>([]);
  const [learningPath, setLearningPath] = useState<AiLearningPath | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [loadingPath, setLoadingPath] = useState(false);
  const [pendingWishlistKeys, setPendingWishlistKeys] = useState<string[]>([]);

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

  useEffect(() => {
    if (!currentUser || !roadmapSkill) {
      return;
    }

    let active = true;
    setLoadingRecommendations(true);

    fetchRecommendedSkills(roadmapSkill)
      .then((recommendationData) => {
        if (!active) return;

        startTransition(() => {
          setRecommendations(recommendationData.recommendations || []);
        });
      })
      .catch(() => {
        if (active) {
          addToast("Unable to load AI skills.", "error");
        }
      })
      .finally(() => {
        if (active) {
          setLoadingRecommendations(false);
        }
      });

    return () => {
      active = false;
    };
  }, [addToast, currentUser, roadmapSkill]);

  const handleAddToWishlist = async (recommendation: AiSkillRecommendation) => {
    if (!currentUser) return;

    if (currentUser.skillsWanted.includes(recommendation.name)) {
      addToast(`${recommendation.name} is already saved.`, "info");
      return;
    }

    setPendingWishlistKeys((prev) => [...prev, recommendation.id]);
    try {
      await updateProfile({
        skillsWanted: [...currentUser.skillsWanted, recommendation.name],
      });
    } finally {
      setPendingWishlistKeys((prev) => prev.filter((key) => key !== recommendation.id));
    }
  };

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
          <div className="dashboard-kicker">AI workspace</div>
          <h1 className="section-title">AI Lab</h1>
          <p className="section-sub">Skills and learning paths.</p>
        </div>
      </header>

      <div className="dashboard-main-grid ai-page-grid">
        <LearningPathPanel
          learningPath={learningPath}
          loading={loadingPath}
          onGenerate={handleGenerateLearningPath}
          targetSkill={roadmapSkill}
          onTargetSkillChange={setRoadmapSkill}
          suggestions={skillSuggestions}
        />

        <aside className="dashboard-sidebar">
          {loadingRecommendations ? (
            <AiSectionSkeleton rows={3} compact />
          ) : (
            <SkillRecommendationsPanel
              recommendations={recommendations}
              wantedSkills={currentUser.skillsWanted || []}
              pendingKeys={pendingWishlistKeys}
              onAddToWishlist={handleAddToWishlist}
              selectedSkill={roadmapSkill}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
