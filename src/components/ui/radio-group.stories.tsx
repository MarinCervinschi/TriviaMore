import type { Meta, StoryObj } from "@storybook/react-vite";

import { Label } from "./label";
import { RadioGroup, RadioGroupItem } from "./radio-group";

const meta = {
	title: "UI/RadioGroup",
	component: RadioGroup,
	tags: ["autodocs"],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<RadioGroup defaultValue="medio">
			<div className="flex items-center gap-2">
				<RadioGroupItem value="facile" id="facile" />
				<Label htmlFor="facile">Facile</Label>
			</div>
			<div className="flex items-center gap-2">
				<RadioGroupItem value="medio" id="medio" />
				<Label htmlFor="medio">Medio</Label>
			</div>
			<div className="flex items-center gap-2">
				<RadioGroupItem value="difficile" id="difficile" />
				<Label htmlFor="difficile">Difficile</Label>
			</div>
		</RadioGroup>
	),
};

export const QuizAnswers: Story = {
	render: () => (
		<RadioGroup defaultValue="b" className="w-96">
			<div className="flex items-center gap-2">
				<RadioGroupItem value="a" id="answer-a" />
				<Label htmlFor="answer-a">La derivata è la pendenza della tangente</Label>
			</div>
			<div className="flex items-center gap-2">
				<RadioGroupItem value="b" id="answer-b" />
				<Label htmlFor="answer-b">L'integrale è l'area sotto la curva</Label>
			</div>
			<div className="flex items-center gap-2">
				<RadioGroupItem value="c" id="answer-c" />
				<Label htmlFor="answer-c">Il limite non esiste in questo punto</Label>
			</div>
		</RadioGroup>
	),
};

export const Disabled: Story = {
	render: () => (
		<RadioGroup defaultValue="medio" disabled>
			<div className="flex items-center gap-2">
				<RadioGroupItem value="facile" id="facile-off" />
				<Label htmlFor="facile-off">Facile</Label>
			</div>
			<div className="flex items-center gap-2">
				<RadioGroupItem value="medio" id="medio-off" />
				<Label htmlFor="medio-off">Medio</Label>
			</div>
		</RadioGroup>
	),
};
