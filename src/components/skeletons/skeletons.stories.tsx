import type { Meta, StoryObj } from "@storybook/react-vite";

import { BrowseOverviewSkeleton } from "./browse-skeleton";
import {
	ClassDetailSkeleton,
	CourseDetailSkeleton,
	DepartmentDetailSkeleton,
	SectionDetailSkeleton,
} from "./departments-skeleton";
import { PlatformStatsSectionSkeleton } from "./home-skeleton";
import {
	SkeletonAvatar,
	SkeletonBadge,
	SkeletonBreadcrumb,
	SkeletonButton,
	SkeletonChart,
	SkeletonFilterBar,
	SkeletonGridCard,
	SkeletonHeading,
	SkeletonHero,
	SkeletonListRow,
	SkeletonRoot,
	SkeletonSearchInput,
	SkeletonStatBlock,
	SkeletonTable,
	SkeletonText,
} from "./primitives";
import {
	FlashcardSkeleton,
	QuizPlaySkeleton,
	QuizResultsSkeleton,
} from "./quiz-skeleton";
import { SearchResultsSkeleton } from "./search-skeleton";
import {
	BookmarksSkeleton,
	NotificationsSkeleton,
	ProgressSkeleton,
	SettingsSkeleton,
	UserClassesSkeleton,
	UserDashboardSkeleton,
	UserRequestsSkeleton,
} from "./user-skeleton";

/**
 * Every `pendingComponent` in the app. These are the one kind of component that can drift silently:
 * nothing breaks when a page layout changes and its skeleton does not, you just get a jump on load.
 * Seeing them next to the pages they stand in for is the whole check.
 */
const meta = {
	title: "Skeletons/Pagine",
	parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Group({ children }: { children: React.ReactNode }) {
	return <div className="divide-border divide-y">{children}</div>;
}

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="py-6">
			<p className="text-muted-foreground eyebrow container mb-3">{label}</p>
			{children}
		</div>
	);
}

export const Browse: Story = {
	name: "Browse",
	render: () => (
		<Group>
			<Labelled label="BrowseOverviewSkeleton">
				<BrowseOverviewSkeleton />
			</Labelled>
			<Labelled label="DepartmentDetailSkeleton">
				<DepartmentDetailSkeleton />
			</Labelled>
			<Labelled label="CourseDetailSkeleton">
				<CourseDetailSkeleton />
			</Labelled>
			<Labelled label="ClassDetailSkeleton">
				<ClassDetailSkeleton />
			</Labelled>
			<Labelled label="SectionDetailSkeleton">
				<SectionDetailSkeleton />
			</Labelled>
		</Group>
	),
};

export const Session: Story = {
	name: "Quiz e flashcard",
	render: () => (
		<Group>
			<Labelled label="QuizPlaySkeleton">
				<QuizPlaySkeleton />
			</Labelled>
			<Labelled label="FlashcardSkeleton">
				<FlashcardSkeleton />
			</Labelled>
			<Labelled label="QuizResultsSkeleton">
				<QuizResultsSkeleton />
			</Labelled>
		</Group>
	),
};

export const User: Story = {
	name: "Area utente",
	render: () => (
		<Group>
			<Labelled label="UserDashboardSkeleton">
				<UserDashboardSkeleton />
			</Labelled>
			<Labelled label="ProgressSkeleton">
				<ProgressSkeleton />
			</Labelled>
			<Labelled label="BookmarksSkeleton">
				<BookmarksSkeleton />
			</Labelled>
			<Labelled label="UserClassesSkeleton">
				<UserClassesSkeleton />
			</Labelled>
			<Labelled label="NotificationsSkeleton">
				<NotificationsSkeleton />
			</Labelled>
			<Labelled label="UserRequestsSkeleton">
				<UserRequestsSkeleton />
			</Labelled>
			<Labelled label="SettingsSkeleton">
				<SettingsSkeleton />
			</Labelled>
		</Group>
	),
};

export const Others: Story = {
	name: "Home, ricerca",
	render: () => (
		<Group>
			<Labelled label="PlatformStatsSectionSkeleton">
				<PlatformStatsSectionSkeleton />
			</Labelled>
			<Labelled label="SearchResultsSkeleton">
				<div className="container">
					<SearchResultsSkeleton />
				</div>
			</Labelled>
		</Group>
	),
};

/** The pieces the page skeletons are built from, which is where a shape or a radius is decided. */
export const Primitives: Story = {
	name: "I mattoni",
	parameters: { layout: "padded" },
	render: () => (
		<SkeletonRoot className="space-y-8">
			<div className="space-y-3">
				<SkeletonHeading level="h1" />
				<SkeletonHeading level="h2" />
				<SkeletonHeading level="h3" />
				<SkeletonText />
				<SkeletonText width="60%" />
				<SkeletonText width={180} />
			</div>
			<div className="flex flex-wrap items-center gap-3">
				<SkeletonAvatar />
				<SkeletonAvatar size={64} />
				<SkeletonBadge />
				<SkeletonButton />
				<SkeletonBreadcrumb />
			</div>
			<SkeletonSearchInput className="max-w-md" />
			<SkeletonFilterBar chips={6} />
			<div className="grid gap-4 sm:grid-cols-3">
				<SkeletonStatBlock />
				<SkeletonStatBlock />
				<SkeletonStatBlock />
			</div>
			<div className="grid gap-4 sm:grid-cols-3">
				<SkeletonGridCard />
				<SkeletonGridCard />
				<SkeletonGridCard />
			</div>
			<div className="space-y-3">
				<SkeletonListRow />
				<SkeletonListRow withTrailing={false} />
			</div>
			<SkeletonChart height={220} />
			<SkeletonTable rows={4} columns={4} />
		</SkeletonRoot>
	),
};

/** The hero, whose three knobs are the only thing separating the browse levels from each other. */
export const Hero: Story = {
	name: "L'hero",
	render: () => (
		<Group>
			<Labelled label="nudo">
				<SkeletonHero />
			</Labelled>
			<Labelled label="withBadges={2}">
				<SkeletonHero withBadges={2} />
			</Labelled>
			<Labelled label="withStats={3} withBreadcrumb">
				<SkeletonHero withStats={3} withBreadcrumb />
			</Labelled>
		</Group>
	),
};
