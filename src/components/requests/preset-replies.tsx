type PresetRepliesProps = {
	presets: string[];
	onPick: (text: string) => void;
};

// Quick-insert chips that append a canned reply to a note textarea.
export function PresetReplies({ presets, onPick }: PresetRepliesProps) {
	if (presets.length === 0) return null;

	return (
		<div className="flex flex-wrap gap-1.5">
			{presets.map(preset => (
				<button
					key={preset}
					type="button"
					onClick={() => onPick(preset)}
					className="bg-muted/40 text-muted-foreground hover:bg-accent hover:text-foreground rounded-full border px-3 py-1 text-xs transition-colors"
				>
					{preset}
				</button>
			))}
		</div>
	);
}
