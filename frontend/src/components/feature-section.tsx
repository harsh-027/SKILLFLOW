import { cn } from "@/lib/utils";
import type React from "react";
import { ZapIcon, ShieldCheckIcon, ActivityIcon, GlobeIcon } from "lucide-react";

type FeatureType = {
	title: string;
	icon: React.ReactNode;
	description: string;
};

export function FeatureSection() {
	return (
		<div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 py-4 md:grid-cols-4">
			{features.map((feature, index) => (
				<div
					className={cn(
						"relative flex flex-col items-center justify-center p-2",
						"after:absolute after:inset-y-0 after:right-0 after:h-full after:w-px after:bg-linear-to-b after:from-foreground/6 after:via-foreground/25 after:to-foreground/6",
						"[&_svg]:size-6",
						{
							"after:hidden": index === features.length - 1,
							"after:hidden after:md:block": index === 1,
						}
					)}
					key={feature.title}
				>
					{feature.icon}
					<h3 className="mt-4 text-center font-medium text-xs md:text-sm lg:text-base">
						{feature.title}
					</h3>
					<p className="mt-1 text-center text-[10px] text-muted-foreground md:text-xs">
						{feature.description}
					</p>
				</div>
			))}
		</div>
	);
}

const features: FeatureType[] = [
	{
		title: "Find Skill Partners",
		icon: (
			<ZapIcon
				className="text-amber-300"
			/>
		),
		description: "Match with people learning what you teach.",
	},
	{
		title: "Trusted Exchanges",
		icon: (
			<ShieldCheckIcon
				className="text-emerald-300"
			/>
		),
		description: "Build confidence with verified peer swaps.",
	},
	{
		title: "Guided Progress",
		icon: (
			<ActivityIcon
				className="text-sky-300"
			/>
		),
		description: "Follow focused paths from goal to practice.",
	},
	{
		title: "Learn Together",
		icon: (
			<GlobeIcon
				className="text-fuchsia-300"
			/>
		),
		description: "Grow through community posts and requests.",
	},
];
