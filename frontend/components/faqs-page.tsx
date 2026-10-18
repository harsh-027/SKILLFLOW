"use client";

import React from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FeatherIcon, LayoutGridIcon, LifeBuoyIcon, PowerIcon, RepeatIcon } from "lucide-react";

const categories = [
	{ icon: <LayoutGridIcon className="size-4" />, id: "all", label: "All" },
	{ icon: <PowerIcon className="size-4" />, id: "getting-started", label: "Account" },
	{ icon: <FeatherIcon className="size-4" />, id: "features", label: "Skills" },
	{ icon: <RepeatIcon className="size-4" />, id: "swaps", label: "Swaps" },
	{ icon: <LifeBuoyIcon className="size-4" />, id: "support", label: "Support" },
];

export function FaqsSection() {
	const [activeCategory, setActiveCategory] = React.useState("all");
	const filtered = faqs.filter((faq) => activeCategory === "all" || faq.category === activeCategory);
	const currentCategory = React.useMemo(
		() => categories.find((cat) => cat.id === activeCategory),
		[activeCategory]
	);

	return (
		<section className="faq-section">
			<div className="faq-intro">
				<span className="faq-kicker">FAQ · SkillFlow</span>
				<h2>Common Questions</h2>
				<p>Quick answers before you start swapping skills.</p>
			</div>
			<div className="faq-layout">
				<div className="faq-categories">
					<div className="faq-category-list">
						{categories.map((cat) => (
							<Button
								key={cat.id}
								className={activeCategory === cat.id ? "faq-category-active" : ""}
								onClick={() => setActiveCategory(cat.id)}
								variant={activeCategory === cat.id ? "outline" : "ghost"}
							>
								{cat.icon}
								{cat.label}
							</Button>
						))}
					</div>
				</div>
				<div className="faq-list">
					{currentCategory ? (
						<div className="flex items-center gap-2">
							{currentCategory.icon}
							<span className="font-medium">{currentCategory.label}</span>
						</div>
					) : null}
					<Accordion className="faq-accordion">
						{filtered.map((item) => (
							<AccordionItem className="faq-item" key={item.id} value={item.id.toString()}>
								<AccordionTrigger className="faq-trigger"><span className="faq-number">{String(item.id).padStart(2, "0")}</span><span>{item.title}</span></AccordionTrigger>
								<AccordionContent className="faq-content">{item.content}</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</div>
		</section>
	);
}

const faqs = [
	{
		id: 1,
		category: "getting-started",
		title: "How do I start on SkillFlow?",
		content: "Create an account, set up your profile, add skills you can offer, and list what you want to learn.",
	},
	{
		id: 2,
		category: "getting-started",
		title: "Do I need to add skills right away?",
		content: "No. You can join first, then update your offered and wanted skills from your profile.",
	},
	{
		id: 3,
		category: "features",
		title: "What skills can I list?",
		content: "List practical skills you can teach or want to learn, from coding and design to communication, tools, and creative work.",
	},
	{
		id: 4,
		category: "features",
		title: "How does SkillFlow match people?",
		content: "SkillFlow helps people discover others through profiles, posts, listed skills, and swap requests.",
	},
	{
		id: 5,
		category: "features",
		title: "Can I share posts with the community?",
		content: "Yes. Use the community area to post updates, ask questions, and find people with similar learning goals.",
	},
	{
		id: 6,
		category: "swaps",
		title: "How do swap requests work?",
		content: "Send a request to someone whose skills fit your goal. They can accept, reject, or continue the conversation.",
	},
	{
		id: 7,
		category: "swaps",
		title: "Do swaps cost money?",
		content: "SkillFlow is built around peer learning exchanges, so the value comes from trading knowledge and time.",
	},
	{
		id: 8,
		category: "support",
		title: "How do I report an issue?",
		content: "Use the report button on the site and include what happened so the team can review it.",
	},
	{
		id: 9,
		category: "support",
		title: "What if I forget my password?",
		content: "Use the forgot password page from login to request a reset link for your SkillFlow account.",
	},
];
