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
		<section className="mx-auto w-full max-w-5xl">
			<div className="flex flex-col items-center justify-center gap-4 px-4 py-12">
				<h2 className="text-balance text-center font-black font-mono text-4xl md:text-5xl">SkillFlow FAQs</h2>
				<p className="text-center text-muted-foreground">Quick answers before you start swapping skills.</p>
			</div>
			<div className="relative grid grid-cols-1 py-8 md:grid-cols-3">
				<div className="flex h-full items-start justify-center border-b pb-2 md:border-b-0">
					<div className="flex w-max flex-wrap items-start justify-start gap-2 md:flex-col md:justify-center">
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
				<div className="col-span-2 space-y-5 px-4 py-5">
					{currentCategory ? (
						<div className="flex items-center gap-2">
							{currentCategory.icon}
							<span className="font-medium">{currentCategory.label}</span>
						</div>
					) : null}
					<Accordion className="space-y-2">
						{filtered.map((item) => (
							<AccordionItem className="border-b-0" key={item.id} value={item.id.toString()}>
								<AccordionTrigger className="border px-4 hover:no-underline">{item.title}</AccordionTrigger>
								<AccordionContent className="p-4">{item.content}</AccordionContent>
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
