import type React from "react";
import { ZapIcon, ShieldCheckIcon, ActivityIcon, GlobeIcon } from "lucide-react";

type FeatureType = {
	title: string;
	icon: React.ReactNode;
	description: string;
};

export function FeatureSection() {
	return (
		<div className="landing-container landing-feature-grid">
			{features.map((feature, index) => (
				<article className="landing-feature-card" key={feature.title}>
					<span className="landing-feature-index">0{index + 1}</span>
					{feature.icon}
					<h3>{feature.title}</h3>
					<p>{feature.description}</p>
				</article>
			))}
		</div>
	);
}

const features: FeatureType[] = [
	{
		title: "Find Skill Partners",
		icon: (
			<ZapIcon
			className="text-black"
			/>
		),
		description: "Match with people learning what you teach.",
	},
	{
		title: "Trusted Exchanges",
		icon: (
			<ShieldCheckIcon
			className="text-black"
			/>
		),
		description: "Build confidence with verified peer swaps.",
	},
	{
		title: "Guided Progress",
		icon: (
			<ActivityIcon
			className="text-black"
			/>
		),
		description: "Follow focused paths from goal to practice.",
	},
	{
		title: "Learn Together",
		icon: (
			<GlobeIcon
			className="text-black"
			/>
		),
		description: "Grow through community posts and requests.",
	},
];
