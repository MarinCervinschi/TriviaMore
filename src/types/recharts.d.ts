declare module "recharts" {
	import * as React from "react";

	export interface ResponsiveContainerProps {
		width?: string | number;
		height?: string | number;
		children?: React.ReactNode;
	}

	export interface PieChartProps {
		children?: React.ReactNode;
	}

	export interface BarChartProps {
		data?: any[];
		children?: React.ReactNode;
	}

	export interface PieProps {
		data?: any[];
		cx?: string | number;
		cy?: string | number;
		labelLine?: boolean;
		label?: any;
		outerRadius?: number;
		fill?: string;
		dataKey?: string;
		children?: React.ReactNode;
	}

	export interface CellProps {
		key?: string;
		fill?: string;
	}

	export interface CartesianGridProps {
		strokeDasharray?: string;
	}

	export interface XAxisProps {
		dataKey?: string;
		angle?: number;
		textAnchor?: string;
		height?: number;
		fontSize?: number;
	}
	export interface BarProps {
		dataKey?: string;
		fill?: string;
		name?: string;
	}

	export const ResponsiveContainer: React.FC<ResponsiveContainerProps>;
	export const PieChart: React.FC<PieChartProps>;
	export const BarChart: React.FC<BarChartProps>;
	export const Pie: React.FC<PieProps>;
	export const Cell: React.FC<CellProps>;
	export const CartesianGrid: React.FC<CartesianGridProps>;
	export const XAxis: React.FC<XAxisProps>;
	export const YAxis: React.FC<YAxisProps>;
	export const Tooltip: React.FC<TooltipProps>;
	export const Bar: React.FC<BarProps>;
}
