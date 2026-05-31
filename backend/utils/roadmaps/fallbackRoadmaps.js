const { formatSkillLabel, normalizeSkill } = require("../../services/ai/skillHelpers");

const FALLBACK_ROADMAPS = {
  react: {
    title: "React Development",
    levels: [
      {
        phase: "Beginner",
        steps: [
          {
            title: "HTML, CSS, and Modern JavaScript",
            description: "Build the UI and language basics React depends on every day.",
            duration: "2 Weeks",
            difficulty: "Beginner",
          },
          {
            title: "React Foundations",
            description: "Learn components, props, state, and one-way data flow.",
            duration: "2 Weeks",
            difficulty: "Beginner",
          },
          {
            title: "Small UI Projects",
            description: "Practice by rebuilding cards, forms, and interactive lists.",
            duration: "2 Weeks",
            difficulty: "Beginner",
          },
        ],
      },
      {
        phase: "Intermediate",
        steps: [
          {
            title: "Routing and Data Fetching",
            description: "Connect multiple screens and load data from APIs cleanly.",
            duration: "2 Weeks",
            difficulty: "Intermediate",
          },
          {
            title: "State Management Patterns",
            description: "Use context or a store to manage shared application state.",
            duration: "2 Weeks",
            difficulty: "Intermediate",
          },
          {
            title: "Portfolio Project",
            description: "Ship a complete product-style app with polished UX.",
            duration: "3 Weeks",
            difficulty: "Intermediate",
          },
        ],
      },
      {
        phase: "Advanced",
        steps: [
          {
            title: "Performance Optimization",
            description: "Reduce re-renders, improve loading, and handle larger interfaces.",
            duration: "2 Weeks",
            difficulty: "Advanced",
          },
          {
            title: "Testing and Reliability",
            description: "Add unit, integration, and interaction tests for confidence.",
            duration: "2 Weeks",
            difficulty: "Advanced",
          },
          {
            title: "Production Architecture",
            description: "Design scalable frontend structure, deployment, and monitoring habits.",
            duration: "2 Weeks",
            difficulty: "Advanced",
          },
        ],
      },
    ],
  },
  python: {
    title: "Python Development",
    levels: [
      {
        phase: "Beginner",
        steps: [
          {
            title: "Syntax and Core Data Types",
            description: "Learn variables, loops, functions, and core built-in structures.",
            duration: "2 Weeks",
            difficulty: "Beginner",
          },
          {
            title: "Problem Solving Practice",
            description: "Use scripts and exercises to build fluency with logic.",
            duration: "2 Weeks",
            difficulty: "Beginner",
          },
          {
            title: "File Handling and Modules",
            description: "Organize code and work with files, imports, and packages.",
            duration: "2 Weeks",
            difficulty: "Beginner",
          },
        ],
      },
      {
        phase: "Intermediate",
        steps: [
          {
            title: "APIs or Data Workflows",
            description: "Choose a direction like backend APIs, automation, or data analysis.",
            duration: "3 Weeks",
            difficulty: "Intermediate",
          },
          {
            title: "Debugging and Testing",
            description: "Write more reliable code with tests and structured debugging.",
            duration: "2 Weeks",
            difficulty: "Intermediate",
          },
          {
            title: "Real Project Build",
            description: "Create a useful app, service, or analysis pipeline end to end.",
            duration: "3 Weeks",
            difficulty: "Intermediate",
          },
        ],
      },
      {
        phase: "Advanced",
        steps: [
          {
            title: "Architecture and Performance",
            description: "Profile bottlenecks and improve maintainability for larger codebases.",
            duration: "2 Weeks",
            difficulty: "Advanced",
          },
          {
            title: "Deployment Workflow",
            description: "Package, ship, and monitor production-ready Python services.",
            duration: "2 Weeks",
            difficulty: "Advanced",
          },
          {
            title: "Specialization Layer",
            description: "Deepen into FastAPI, data engineering, or machine learning paths.",
            duration: "3 Weeks",
            difficulty: "Advanced",
          },
        ],
      },
    ],
  },
};

function buildGenericRoadmap(skill) {
  const title = formatSkillLabel(skill);

  return {
    title,
    levels: [
      {
        phase: "Beginner",
        steps: [
          {
            title: `${title} Fundamentals`,
            description: `Build a solid mental model of ${title} and its common terminology.`,
            duration: "2 Weeks",
            difficulty: "Beginner",
          },
          {
            title: "Guided Practice",
            description: "Follow structured tutorials and repeat key exercises until they feel natural.",
            duration: "2 Weeks",
            difficulty: "Beginner",
          },
          {
            title: "First Small Project",
            description: `Apply ${title} in a compact project with a clear end result.`,
            duration: "2 Weeks",
            difficulty: "Beginner",
          },
        ],
      },
      {
        phase: "Intermediate",
        steps: [
          {
            title: "Workflow Patterns",
            description: `Learn the everyday patterns and tools professionals use with ${title}.`,
            duration: "2 Weeks",
            difficulty: "Intermediate",
          },
          {
            title: "Project Expansion",
            description: "Refactor your project and add stronger features or integrations.",
            duration: "3 Weeks",
            difficulty: "Intermediate",
          },
          {
            title: "Portfolio Delivery",
            description: "Ship a polished project that demonstrates practical range and judgment.",
            duration: "3 Weeks",
            difficulty: "Intermediate",
          },
        ],
      },
      {
        phase: "Advanced",
        steps: [
          {
            title: "Quality and Performance",
            description: "Improve reliability, clarity, testing discipline, and runtime behavior.",
            duration: "2 Weeks",
            difficulty: "Advanced",
          },
          {
            title: "System-Level Thinking",
            description: `Understand how ${title} fits into larger product and team workflows.`,
            duration: "2 Weeks",
            difficulty: "Advanced",
          },
          {
            title: "Teach or Mentor Back",
            description: "Solidify mastery by documenting, reviewing, or teaching others.",
            duration: "2 Weeks",
            difficulty: "Advanced",
          },
        ],
      },
    ],
  };
}

function getFallbackRoadmap(targetSkill) {
  const normalizedSkill = normalizeSkill(targetSkill);
  return FALLBACK_ROADMAPS[normalizedSkill] || buildGenericRoadmap(normalizedSkill);
}

module.exports = {
  getFallbackRoadmap,
};
