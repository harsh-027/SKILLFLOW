import { motion } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import type { AiSkillRecommendation } from "@/types/ai";

export default function SkillRecommendationsPanel({
  recommendations,
  wantedSkills,
  pendingKeys,
  onAddToWishlist,
  selectedSkill,
}: {
  recommendations: AiSkillRecommendation[];
  wantedSkills: string[];
  pendingKeys: string[];
  onAddToWishlist: (recommendation: AiSkillRecommendation) => void;
  selectedSkill: string;
}) {
  return (
    <article className="card dashboard-rail-card ai-panel-card">
      <div className="dashboard-section-head">
        <div>
          <div className="dashboard-kicker">Recommended next</div>
          <h3 className="section-title">AI Recommended Skills</h3>
          <p className="section-sub">Fast local suggestions based on your skills and current roadmap target.</p>
        </div>
      </div>

      {selectedSkill ? <div className="dashboard-chip">Focused on {selectedSkill}</div> : null}

      <div className="ai-skill-grid">
        {recommendations.map((recommendation, index) => {
          const alreadySaved = wantedSkills.includes(recommendation.name);
          const pending = pendingKeys.includes(recommendation.id);

          return (
            <motion.div
              key={recommendation.id}
              className="ai-skill-card"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: index * 0.04 }}
            >
              <div className="ai-skill-card-head">
                <div>
                  <p className="ai-skill-title">{recommendation.name}</p>
                  <p className="ai-skill-reason">{recommendation.reason}</p>
                </div>
                <div className="ai-score-pill">{recommendation.confidence}%</div>
              </div>

              <div className="ai-skill-meta">
                <span className="dashboard-chip">Rule-based confidence</span>
                <button
                  type="button"
                  className={alreadySaved ? "btn-ghost" : "btn-outline-red"}
                  disabled={alreadySaved || pending}
                  onClick={() => onAddToWishlist(recommendation)}
                >
                  {alreadySaved ? (
                    <>Saved <ArrowUpRight size={14} /></>
                  ) : pending ? (
                    "Saving..."
                  ) : (
                    <>Add to Wishlist <Plus size={14} /></>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </article>
  );
}
