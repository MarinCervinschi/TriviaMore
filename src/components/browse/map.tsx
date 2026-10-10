"use client";

import {
	type ReactNode,
	createContext,
	forwardRef,
	useCallback,
	useContext,
	useEffect,
	useId,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";

import { GpsIcon } from "@solar-icons/react/linear/gps";
import { MaximizeIcon } from "@solar-icons/react/linear/maximize";
import MapLibreGL, { type MarkerOptions, type PopupOptions } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { createPortal } from "react-dom";

import { CloseGlyph, MinusGlyph, PlusGlyph, Spinner } from "@/components/icons";
import { cn } from "@/lib/utils";

const defaultStyles = {
	dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
	light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};

type Theme = "light" | "dark";

function getDocumentTheme(): Theme | null {
	if (typeof document === "undefined") return null;
	if (document.documentElement.classList.contains("dark")) return "dark";
	if (document.documentElement.classList.contains("light")) return "light";
	return null;
}

function getSystemTheme(): Theme {
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function useResolvedTheme(themeProp?: "light" | "dark"): Theme {
	const [detectedTheme, setDetectedTheme] = useState<Theme>(
		() => getDocumentTheme() ?? getSystemTheme()
	);

	useEffect(() => {
		if (themeProp) return;

		const observer = new MutationObserver(() => {
			const docTheme = getDocumentTheme();
			if (docTheme) {
				setDetectedTheme(docTheme);
			}
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleSystemChange = (e: MediaQueryListEvent) => {
			if (!getDocumentTheme()) {
				setDetectedTheme(e.matches ? "dark" : "light");
			}
		};
		mediaQuery.addEventListener("change", handleSystemChange);

		return () => {
			observer.disconnect();
			mediaQuery.removeEventListener("change", handleSystemChange);
		};
	}, [themeProp]);

	return themeProp ?? detectedTheme;
}

type MapContextValue = {
	map: MapLibreGL.Map | null;
	isLoaded: boolean;
};

const MapContext = createContext<MapContextValue | null>(null);

function useMap() {
	const context = useContext(MapContext);
	if (!context) {
		throw new Error("useMap must be used within a Map component");
	}
	return context;
}

type MapViewport = {
	/** [longitude, latitude] */
	center: [number, number];
	zoom: number;
	bearing: number;
	pitch: number;
};

type MapStyleOption = string | MapLibreGL.StyleSpecification;

type MapRef = MapLibreGL.Map;

type MapProps = {
	children?: ReactNode;
	className?: string;
	/** Detected from the document class or the system preference when omitted. */
	theme?: Theme;
	styles?: {
		light?: MapStyleOption;
		dark?: MapStyleOption;
	};
	projection?: MapLibreGL.ProjectionSpecification;
	viewport?: Partial<MapViewport>;
	onViewportChange?: (viewport: MapViewport) => void;
	loading?: boolean;
} & Omit<MapLibreGL.MapOptions, "container" | "style">;

function DefaultLoader() {
	return (
		<div className="bg-background/50 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-xs">
			<div className="flex gap-1">
				<span className="bg-muted-foreground/60 size-1.5 animate-pulse rounded-full" />
				<span className="bg-muted-foreground/60 size-1.5 animate-pulse rounded-full [animation-delay:150ms]" />
				<span className="bg-muted-foreground/60 size-1.5 animate-pulse rounded-full [animation-delay:300ms]" />
			</div>
		</div>
	);
}

function getViewport(map: MapLibreGL.Map): MapViewport {
	const center = map.getCenter();
	return {
		center: [center.lng, center.lat],
		zoom: map.getZoom(),
		bearing: map.getBearing(),
		pitch: map.getPitch(),
	};
}

const Map = forwardRef<MapRef, MapProps>(function Map(
	{
		children,
		className,
		theme: themeProp,
		styles,
		projection,
		viewport,
		onViewportChange,
		loading = false,
		...props
	},
	ref
) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [isStyleLoaded, setIsStyleLoaded] = useState(false);
	const currentStyleRef = useRef<MapStyleOption | null>(null);
	const styleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const internalUpdateRef = useRef(false);
	const resolvedTheme = useResolvedTheme(themeProp);

	const isControlled = viewport !== undefined && onViewportChange !== undefined;

	const onViewportChangeRef = useRef(onViewportChange);
	onViewportChangeRef.current = onViewportChange;

	const mapStyles = useMemo(
		() => ({
			dark: styles?.dark ?? defaultStyles.dark,
			light: styles?.light ?? defaultStyles.light,
		}),
		[styles]
	);

	useImperativeHandle(ref, () => mapInstance as MapLibreGL.Map, [mapInstance]);

	const clearStyleTimeout = useCallback(() => {
		if (styleTimeoutRef.current) {
			clearTimeout(styleTimeoutRef.current);
			styleTimeoutRef.current = null;
		}
	}, []);

	useEffect(() => {
		if (!containerRef.current) return;

		const initialStyle = resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
		currentStyleRef.current = initialStyle;

		const map = new MapLibreGL.Map({
			container: containerRef.current,
			style: initialStyle,
			renderWorldCopies: false,
			attributionControl: {
				compact: true,
			},
			...props,
			...viewport,
		});

		const styleDataHandler = () => {
			clearStyleTimeout();
			// Waits for the style to finish processing, or layer operations race the style load.
			styleTimeoutRef.current = setTimeout(() => {
				setIsStyleLoaded(true);
				if (projection) {
					map.setProjection(projection);
				}
			}, 100);
		};
		const loadHandler = () => setIsLoaded(true);

		const handleMove = () => {
			if (internalUpdateRef.current) return;
			onViewportChangeRef.current?.(getViewport(map));
		};

		map.on("load", loadHandler);
		map.on("styledata", styleDataHandler);
		map.on("move", handleMove);
		setMapInstance(map);

		return () => {
			clearStyleTimeout();
			map.off("load", loadHandler);
			map.off("styledata", styleDataHandler);
			map.off("move", handleMove);
			map.remove();
			setIsLoaded(false);
			setIsStyleLoaded(false);
			setMapInstance(null);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!mapInstance || !isControlled || !viewport) return;
		if (mapInstance.isMoving()) return;

		const current = getViewport(mapInstance);
		const next = {
			center: viewport.center ?? current.center,
			zoom: viewport.zoom ?? current.zoom,
			bearing: viewport.bearing ?? current.bearing,
			pitch: viewport.pitch ?? current.pitch,
		};

		if (
			next.center[0] === current.center[0] &&
			next.center[1] === current.center[1] &&
			next.zoom === current.zoom &&
			next.bearing === current.bearing &&
			next.pitch === current.pitch
		) {
			return;
		}

		internalUpdateRef.current = true;
		mapInstance.jumpTo(next);
		internalUpdateRef.current = false;
	}, [mapInstance, isControlled, viewport]);

	useEffect(() => {
		if (!mapInstance || !resolvedTheme) return;

		const newStyle = resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;

		if (currentStyleRef.current === newStyle) return;

		clearStyleTimeout();
		currentStyleRef.current = newStyle;
		setIsStyleLoaded(false);

		mapInstance.setStyle(newStyle, { diff: true });
	}, [mapInstance, resolvedTheme, mapStyles, clearStyleTimeout]);

	const contextValue = useMemo(
		() => ({
			map: mapInstance,
			isLoaded: isLoaded && isStyleLoaded,
		}),
		[mapInstance, isLoaded, isStyleLoaded]
	);

	return (
		<MapContext.Provider value={contextValue}>
			<div ref={containerRef} className={cn("relative h-full w-full", className)}>
				{(!isLoaded || loading) && <DefaultLoader />}
				{mapInstance && children}
			</div>
		</MapContext.Provider>
	);
});

type MarkerContextValue = {
	marker: MapLibreGL.Marker;
	map: MapLibreGL.Map | null;
};

const MarkerContext = createContext<MarkerContextValue | null>(null);

function useMarkerContext() {
	const context = useContext(MarkerContext);
	if (!context) {
		throw new Error("Marker components must be used within MapMarker");
	}
	return context;
}

type MapMarkerProps = {
	longitude: number;
	latitude: number;
	children: ReactNode;
	onClick?: (e: MouseEvent) => void;
	onMouseEnter?: (e: MouseEvent) => void;
	onMouseLeave?: (e: MouseEvent) => void;
	onDragStart?: (lngLat: { lng: number; lat: number }) => void;
	onDrag?: (lngLat: { lng: number; lat: number }) => void;
	onDragEnd?: (lngLat: { lng: number; lat: number }) => void;
} & Omit<MarkerOptions, "element">;

function MapMarker({
	longitude,
	latitude,
	children,
	onClick,
	onMouseEnter,
	onMouseLeave,
	onDragStart,
	onDrag,
	onDragEnd,
	draggable = false,
	...markerOptions
}: MapMarkerProps) {
	const { map } = useMap();

	const callbacksRef = useRef({
		onClick,
		onMouseEnter,
		onMouseLeave,
		onDragStart,
		onDrag,
		onDragEnd,
	});
	callbacksRef.current = {
		onClick,
		onMouseEnter,
		onMouseLeave,
		onDragStart,
		onDrag,
		onDragEnd,
	};

	const marker = useMemo(() => {
		const markerInstance = new MapLibreGL.Marker({
			...markerOptions,
			element: document.createElement("div"),
			draggable,
		}).setLngLat([longitude, latitude]);

		const handleClick = (e: MouseEvent) => callbacksRef.current.onClick?.(e);
		const handleMouseEnter = (e: MouseEvent) => callbacksRef.current.onMouseEnter?.(e);
		const handleMouseLeave = (e: MouseEvent) => callbacksRef.current.onMouseLeave?.(e);

		markerInstance.getElement()?.addEventListener("click", handleClick);
		markerInstance.getElement()?.addEventListener("mouseenter", handleMouseEnter);
		markerInstance.getElement()?.addEventListener("mouseleave", handleMouseLeave);

		const handleDragStart = () => {
			const lngLat = markerInstance.getLngLat();
			callbacksRef.current.onDragStart?.({ lng: lngLat.lng, lat: lngLat.lat });
		};
		const handleDrag = () => {
			const lngLat = markerInstance.getLngLat();
			callbacksRef.current.onDrag?.({ lng: lngLat.lng, lat: lngLat.lat });
		};
		const handleDragEnd = () => {
			const lngLat = markerInstance.getLngLat();
			callbacksRef.current.onDragEnd?.({ lng: lngLat.lng, lat: lngLat.lat });
		};

		markerInstance.on("dragstart", handleDragStart);
		markerInstance.on("drag", handleDrag);
		markerInstance.on("dragend", handleDragEnd);

		return markerInstance;

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!map) return;

		marker.addTo(map);

		return () => {
			marker.remove();
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [map]);

	if (marker.getLngLat().lng !== longitude || marker.getLngLat().lat !== latitude) {
		marker.setLngLat([longitude, latitude]);
	}
	if (marker.isDraggable() !== draggable) {
		marker.setDraggable(draggable);
	}

	const currentOffset = marker.getOffset();
	const newOffset = markerOptions.offset ?? [0, 0];
	const [newOffsetX, newOffsetY] = Array.isArray(newOffset)
		? newOffset
		: [newOffset.x, newOffset.y];
	if (currentOffset.x !== newOffsetX || currentOffset.y !== newOffsetY) {
		marker.setOffset(newOffset);
	}

	if (marker.getRotation() !== markerOptions.rotation) {
		marker.setRotation(markerOptions.rotation ?? 0);
	}
	if (marker.getRotationAlignment() !== markerOptions.rotationAlignment) {
		marker.setRotationAlignment(markerOptions.rotationAlignment ?? "auto");
	}
	if (marker.getPitchAlignment() !== markerOptions.pitchAlignment) {
		marker.setPitchAlignment(markerOptions.pitchAlignment ?? "auto");
	}

	return (
		<MarkerContext.Provider value={{ marker, map }}>{children}</MarkerContext.Provider>
	);
}

type MarkerContentProps = {
	children?: ReactNode;
	className?: string;
};

function MarkerContent({ children, className }: MarkerContentProps) {
	const { marker } = useMarkerContext();

	return createPortal(
		<div className={cn("relative cursor-pointer", className)}>
			{children || <DefaultMarkerIcon />}
		</div>,
		marker.getElement()
	);
}

function DefaultMarkerIcon() {
	return (
		<div className="relative h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-lg" />
	);
}

type MarkerPopupProps = {
	children: ReactNode;
	className?: string;
	closeButton?: boolean;
} & Omit<PopupOptions, "className" | "closeButton">;

function MarkerPopup({
	children,
	className,
	closeButton = false,
	...popupOptions
}: MarkerPopupProps) {
	const { marker, map } = useMarkerContext();
	const container = useMemo(() => document.createElement("div"), []);
	const prevPopupOptions = useRef(popupOptions);

	const popup = useMemo(() => {
		const popupInstance = new MapLibreGL.Popup({
			offset: 16,
			...popupOptions,
			closeButton: false,
		})
			.setMaxWidth("none")
			.setDOMContent(container);

		return popupInstance;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!map) return;

		popup.setDOMContent(container);
		marker.setPopup(popup);

		return () => {
			marker.setPopup(null);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [map]);

	if (popup.isOpen()) {
		const prev = prevPopupOptions.current;

		if (prev.offset !== popupOptions.offset) {
			popup.setOffset(popupOptions.offset ?? 16);
		}
		if (prev.maxWidth !== popupOptions.maxWidth && popupOptions.maxWidth) {
			popup.setMaxWidth(popupOptions.maxWidth ?? "none");
		}

		prevPopupOptions.current = popupOptions;
	}

	const handleClose = () => popup.remove();

	return createPortal(
		<div
			className={cn(
				"bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 relative rounded-lg border p-3 shadow-md",
				className
			)}
		>
			{closeButton && (
				<button
					type="button"
					onClick={handleClose}
					className="ring-offset-background focus:ring-ring absolute top-1 right-1 z-10 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
					aria-label="Close popup"
				>
					<CloseGlyph className="h-4 w-4" />
					<span className="sr-only">Close</span>
				</button>
			)}
			{children}
		</div>,
		container
	);
}

type MarkerTooltipProps = {
	children: ReactNode;
	className?: string;
} & Omit<PopupOptions, "className" | "closeButton" | "closeOnClick">;

function MarkerTooltip({ children, className, ...popupOptions }: MarkerTooltipProps) {
	const { marker, map } = useMarkerContext();
	const container = useMemo(() => document.createElement("div"), []);
	const prevTooltipOptions = useRef(popupOptions);

	const tooltip = useMemo(() => {
		const tooltipInstance = new MapLibreGL.Popup({
			offset: 16,
			...popupOptions,
			closeOnClick: true,
			closeButton: false,
		}).setMaxWidth("none");

		return tooltipInstance;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!map) return;

		tooltip.setDOMContent(container);

		const handleMouseEnter = () => {
			tooltip.setLngLat(marker.getLngLat()).addTo(map);
		};
		const handleMouseLeave = () => tooltip.remove();

		marker.getElement()?.addEventListener("mouseenter", handleMouseEnter);
		marker.getElement()?.addEventListener("mouseleave", handleMouseLeave);

		return () => {
			marker.getElement()?.removeEventListener("mouseenter", handleMouseEnter);
			marker.getElement()?.removeEventListener("mouseleave", handleMouseLeave);
			tooltip.remove();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [map]);

	if (tooltip.isOpen()) {
		const prev = prevTooltipOptions.current;

		if (prev.offset !== popupOptions.offset) {
			tooltip.setOffset(popupOptions.offset ?? 16);
		}
		if (prev.maxWidth !== popupOptions.maxWidth && popupOptions.maxWidth) {
			tooltip.setMaxWidth(popupOptions.maxWidth ?? "none");
		}

		prevTooltipOptions.current = popupOptions;
	}

	return createPortal(
		<div
			className={cn(
				"bg-foreground text-background animate-in fade-in-0 zoom-in-95 rounded-lg px-2 py-1 text-xs shadow-md",
				className
			)}
		>
			{children}
		</div>,
		container
	);
}

type MarkerLabelProps = {
	children: ReactNode;
	className?: string;
	position?: "top" | "bottom";
};

function MarkerLabel({ children, className, position = "top" }: MarkerLabelProps) {
	const positionClasses = {
		top: "bottom-full mb-1",
		bottom: "top-full mt-1",
	};

	return (
		<div
			className={cn(
				"absolute left-1/2 -translate-x-1/2 whitespace-nowrap",
				"text-foreground text-2xs font-medium",
				positionClasses[position],
				className
			)}
		>
			{children}
		</div>
	);
}

type MapControlsProps = {
	position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
	showZoom?: boolean;
	showCompass?: boolean;
	showLocate?: boolean;
	showFullscreen?: boolean;
	className?: string;
	onLocate?: (coords: { longitude: number; latitude: number }) => void;
};

const positionClasses = {
	"top-left": "top-2 left-2",
	"top-right": "top-2 right-2",
	"bottom-left": "bottom-2 left-2",
	"bottom-right": "bottom-10 right-2",
};

function ControlGroup({ children }: { children: React.ReactNode }) {
	return (
		<div className="border-border bg-background [&>button:not(:last-child)]:border-border flex flex-col overflow-hidden rounded-lg border shadow-sm [&>button:not(:last-child)]:border-b">
			{children}
		</div>
	);
}

function ControlButton({
	onClick,
	label,
	children,
	disabled = false,
}: {
	onClick: () => void;
	label: string;
	children: React.ReactNode;
	disabled?: boolean;
}) {
	return (
		<button
			onClick={onClick}
			aria-label={label}
			type="button"
			className={cn(
				"hover:bg-accent dark:hover:bg-accent/40 flex size-8 items-center justify-center transition-colors",
				disabled && "pointer-events-none cursor-not-allowed opacity-50"
			)}
			disabled={disabled}
		>
			{children}
		</button>
	);
}

function MapControls({
	position = "bottom-right",
	showZoom = true,
	showCompass = false,
	showLocate = false,
	showFullscreen = false,
	className,
	onLocate,
}: MapControlsProps) {
	const { map } = useMap();
	const [waitingForLocation, setWaitingForLocation] = useState(false);

	const handleZoomIn = useCallback(() => {
		map?.zoomTo(map.getZoom() + 1, { duration: 300 });
	}, [map]);

	const handleZoomOut = useCallback(() => {
		map?.zoomTo(map.getZoom() - 1, { duration: 300 });
	}, [map]);

	const handleResetBearing = useCallback(() => {
		map?.resetNorthPitch({ duration: 300 });
	}, [map]);

	const handleLocate = useCallback(() => {
		setWaitingForLocation(true);
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(
				pos => {
					const coords = {
						longitude: pos.coords.longitude,
						latitude: pos.coords.latitude,
					};
					map?.flyTo({
						center: [coords.longitude, coords.latitude],
						zoom: 14,
						duration: 1500,
					});
					onLocate?.(coords);
					setWaitingForLocation(false);
				},
				error => {
					console.error("Error getting location:", error);
					setWaitingForLocation(false);
				}
			);
		}
	}, [map, onLocate]);

	const handleFullscreen = useCallback(() => {
		const container = map?.getContainer();
		if (!container) return;
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			container.requestFullscreen();
		}
	}, [map]);

	return (
		<div
			className={cn(
				"absolute z-10 flex flex-col gap-1.5",
				positionClasses[position],
				className
			)}
		>
			{showZoom && (
				<ControlGroup>
					<ControlButton onClick={handleZoomIn} label="Zoom in">
						<PlusGlyph className="size-4" />
					</ControlButton>
					<ControlButton onClick={handleZoomOut} label="Zoom out">
						<MinusGlyph className="size-4" />
					</ControlButton>
				</ControlGroup>
			)}
			{showCompass && (
				<ControlGroup>
					<CompassButton onClick={handleResetBearing} />
				</ControlGroup>
			)}
			{showLocate && (
				<ControlGroup>
					<ControlButton
						onClick={handleLocate}
						label="Find my location"
						disabled={waitingForLocation}
					>
						{waitingForLocation ? <Spinner /> : <GpsIcon className="size-4" />}
					</ControlButton>
				</ControlGroup>
			)}
			{showFullscreen && (
				<ControlGroup>
					<ControlButton onClick={handleFullscreen} label="Toggle fullscreen">
						<MaximizeIcon className="size-4" />
					</ControlButton>
				</ControlGroup>
			)}
		</div>
	);
}

function CompassButton({ onClick }: { onClick: () => void }) {
	const { map } = useMap();
	const compassRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		if (!map || !compassRef.current) return;

		const compass = compassRef.current;

		const updateRotation = () => {
			const bearing = map.getBearing();
			const pitch = map.getPitch();
			compass.style.transform = `rotateX(${pitch}deg) rotateZ(${-bearing}deg)`;
		};

		map.on("rotate", updateRotation);
		map.on("pitch", updateRotation);
		updateRotation();

		return () => {
			map.off("rotate", updateRotation);
			map.off("pitch", updateRotation);
		};
	}, [map]);

	return (
		<ControlButton onClick={onClick} label="Reset bearing to north">
			<svg
				ref={compassRef}
				viewBox="0 0 24 24"
				className="size-5 transition-transform duration-200"
				style={{ transformStyle: "preserve-3d" }}
			>
				<path d="M12 2L16 12H12V2Z" className="fill-red-500" />
				<path d="M12 2L8 12H12V2Z" className="fill-red-300" />
				<path d="M12 22L16 12H12V22Z" className="fill-muted-foreground/60" />
				<path d="M12 22L8 12H12V22Z" className="fill-muted-foreground/30" />
			</svg>
		</ControlButton>
	);
}

type MapPopupProps = {
	longitude: number;
	latitude: number;
	onClose?: () => void;
	children: ReactNode;
	className?: string;
	closeButton?: boolean;
} & Omit<PopupOptions, "className" | "closeButton">;

function MapPopup({
	longitude,
	latitude,
	onClose,
	children,
	className,
	closeButton = false,
	...popupOptions
}: MapPopupProps) {
	const { map } = useMap();
	const popupOptionsRef = useRef(popupOptions);
	const onCloseRef = useRef(onClose);
	onCloseRef.current = onClose;
	const container = useMemo(() => document.createElement("div"), []);

	const popup = useMemo(() => {
		const popupInstance = new MapLibreGL.Popup({
			offset: 16,
			...popupOptions,
			closeButton: false,
		})
			.setMaxWidth("none")
			.setLngLat([longitude, latitude]);

		return popupInstance;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!map) return;

		const onCloseProp = () => onCloseRef.current?.();

		popup.on("close", onCloseProp);

		popup.setDOMContent(container);
		popup.addTo(map);

		return () => {
			popup.off("close", onCloseProp);
			if (popup.isOpen()) {
				popup.remove();
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [map]);

	if (popup.isOpen()) {
		const prev = popupOptionsRef.current;

		if (popup.getLngLat().lng !== longitude || popup.getLngLat().lat !== latitude) {
			popup.setLngLat([longitude, latitude]);
		}

		if (prev.offset !== popupOptions.offset) {
			popup.setOffset(popupOptions.offset ?? 16);
		}
		if (prev.maxWidth !== popupOptions.maxWidth && popupOptions.maxWidth) {
			popup.setMaxWidth(popupOptions.maxWidth ?? "none");
		}
		popupOptionsRef.current = popupOptions;
	}

	const handleClose = () => {
		popup.remove();
	};

	return createPortal(
		<div
			className={cn(
				"bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 relative rounded-lg border p-3 shadow-md",
				className
			)}
		>
			{closeButton && (
				<button
					type="button"
					onClick={handleClose}
					className="ring-offset-background focus:ring-ring absolute top-1 right-1 z-10 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
					aria-label="Close popup"
				>
					<CloseGlyph className="h-4 w-4" />
					<span className="sr-only">Close</span>
				</button>
			)}
			{children}
		</div>,
		container
	);
}

type MapRouteProps = {
	id?: string;
	/** [longitude, latitude] pairs. */
	coordinates: [number, number][];
	color?: string;
	width?: number;
	opacity?: number;
	dashArray?: [number, number];
	onClick?: () => void;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	interactive?: boolean;
};

function MapRoute({
	id: propId,
	coordinates,
	color = "#4285F4",
	width = 3,
	opacity = 0.8,
	dashArray,
	onClick,
	onMouseEnter,
	onMouseLeave,
	interactive = true,
}: MapRouteProps) {
	const { map, isLoaded } = useMap();
	const autoId = useId();
	const id = propId ?? autoId;
	const sourceId = `route-source-${id}`;
	const layerId = `route-layer-${id}`;

	useEffect(() => {
		if (!isLoaded || !map) return;

		map.addSource(sourceId, {
			type: "geojson",
			data: {
				type: "Feature",
				properties: {},
				geometry: { type: "LineString", coordinates: [] },
			},
		});

		map.addLayer({
			id: layerId,
			type: "line",
			source: sourceId,
			layout: { "line-join": "round", "line-cap": "round" },
			paint: {
				"line-color": color,
				"line-width": width,
				"line-opacity": opacity,
				...(dashArray && { "line-dasharray": dashArray }),
			},
		});

		return () => {
			try {
				if (map.getLayer(layerId)) map.removeLayer(layerId);
				if (map.getSource(sourceId)) map.removeSource(sourceId);
			} catch {}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoaded, map]);

	useEffect(() => {
		if (!isLoaded || !map || coordinates.length < 2) return;

		const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource;
		if (source) {
			source.setData({
				type: "Feature",
				properties: {},
				geometry: { type: "LineString", coordinates },
			});
		}
	}, [isLoaded, map, coordinates, sourceId]);

	useEffect(() => {
		if (!isLoaded || !map || !map.getLayer(layerId)) return;

		map.setPaintProperty(layerId, "line-color", color);
		map.setPaintProperty(layerId, "line-width", width);
		map.setPaintProperty(layerId, "line-opacity", opacity);
		if (dashArray) {
			map.setPaintProperty(layerId, "line-dasharray", dashArray);
		}
	}, [isLoaded, map, layerId, color, width, opacity, dashArray]);

	useEffect(() => {
		if (!isLoaded || !map || !interactive) return;

		const handleClick = () => {
			onClick?.();
		};
		const handleMouseEnter = () => {
			map.getCanvas().style.cursor = "pointer";
			onMouseEnter?.();
		};
		const handleMouseLeave = () => {
			map.getCanvas().style.cursor = "";
			onMouseLeave?.();
		};

		map.on("click", layerId, handleClick);
		map.on("mouseenter", layerId, handleMouseEnter);
		map.on("mouseleave", layerId, handleMouseLeave);

		return () => {
			map.off("click", layerId, handleClick);
			map.off("mouseenter", layerId, handleMouseEnter);
			map.off("mouseleave", layerId, handleMouseLeave);
		};
	}, [isLoaded, map, layerId, onClick, onMouseEnter, onMouseLeave, interactive]);

	return null;
}

type MapClusterLayerProps<
	P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
> = {
	data: string | GeoJSON.FeatureCollection<GeoJSON.Point, P>;
	clusterMaxZoom?: number;
	clusterRadius?: number;
	/** Circle colours for [small, medium, large] clusters. */
	clusterColors?: [string, string, string];
	/** Point counts at which a cluster becomes [medium, large]. */
	clusterThresholds?: [number, number];
	pointColor?: string;
	onPointClick?: (
		feature: GeoJSON.Feature<GeoJSON.Point, P>,
		coordinates: [number, number]
	) => void;
	/** Defaults to zooming into the cluster. */
	onClusterClick?: (
		clusterId: number,
		coordinates: [number, number],
		pointCount: number
	) => void;
};

function MapClusterLayer<
	P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
>({
	data,
	clusterMaxZoom = 14,
	clusterRadius = 50,
	clusterColors = ["#22c55e", "#eab308", "#ef4444"],
	clusterThresholds = [100, 750],
	pointColor = "#3b82f6",
	onPointClick,
	onClusterClick,
}: MapClusterLayerProps<P>) {
	const { map, isLoaded } = useMap();
	const id = useId();
	const sourceId = `cluster-source-${id}`;
	const clusterLayerId = `clusters-${id}`;
	const clusterCountLayerId = `cluster-count-${id}`;
	const unclusteredLayerId = `unclustered-point-${id}`;

	const stylePropsRef = useRef({
		clusterColors,
		clusterThresholds,
		pointColor,
	});

	useEffect(() => {
		if (!isLoaded || !map) return;

		map.addSource(sourceId, {
			type: "geojson",
			data,
			cluster: true,
			clusterMaxZoom,
			clusterRadius,
		});

		map.addLayer({
			id: clusterLayerId,
			type: "circle",
			source: sourceId,
			filter: ["has", "point_count"],
			paint: {
				"circle-color": [
					"step",
					["get", "point_count"],
					clusterColors[0],
					clusterThresholds[0],
					clusterColors[1],
					clusterThresholds[1],
					clusterColors[2],
				],
				"circle-radius": [
					"step",
					["get", "point_count"],
					20,
					clusterThresholds[0],
					30,
					clusterThresholds[1],
					40,
				],
				"circle-stroke-width": 1,
				"circle-stroke-color": "#fff",
				"circle-opacity": 0.85,
			},
		});

		map.addLayer({
			id: clusterCountLayerId,
			type: "symbol",
			source: sourceId,
			filter: ["has", "point_count"],
			layout: {
				"text-field": "{point_count_abbreviated}",
				"text-font": ["Open Sans"],
				"text-size": 12,
			},
			paint: {
				"text-color": "#fff",
			},
		});

		map.addLayer({
			id: unclusteredLayerId,
			type: "circle",
			source: sourceId,
			filter: ["!", ["has", "point_count"]],
			paint: {
				"circle-color": pointColor,
				"circle-radius": 5,
				"circle-stroke-width": 2,
				"circle-stroke-color": "#fff",
			},
		});

		return () => {
			try {
				if (map.getLayer(clusterCountLayerId)) map.removeLayer(clusterCountLayerId);
				if (map.getLayer(unclusteredLayerId)) map.removeLayer(unclusteredLayerId);
				if (map.getLayer(clusterLayerId)) map.removeLayer(clusterLayerId);
				if (map.getSource(sourceId)) map.removeSource(sourceId);
			} catch {}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoaded, map, sourceId]);

	useEffect(() => {
		if (!isLoaded || !map || typeof data === "string") return;

		const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource;
		if (source) {
			source.setData(data);
		}
	}, [isLoaded, map, data, sourceId]);

	useEffect(() => {
		if (!isLoaded || !map) return;

		const prev = stylePropsRef.current;
		const colorsChanged =
			prev.clusterColors !== clusterColors ||
			prev.clusterThresholds !== clusterThresholds;

		if (map.getLayer(clusterLayerId) && colorsChanged) {
			map.setPaintProperty(clusterLayerId, "circle-color", [
				"step",
				["get", "point_count"],
				clusterColors[0],
				clusterThresholds[0],
				clusterColors[1],
				clusterThresholds[1],
				clusterColors[2],
			]);
			map.setPaintProperty(clusterLayerId, "circle-radius", [
				"step",
				["get", "point_count"],
				20,
				clusterThresholds[0],
				30,
				clusterThresholds[1],
				40,
			]);
		}

		if (map.getLayer(unclusteredLayerId) && prev.pointColor !== pointColor) {
			map.setPaintProperty(unclusteredLayerId, "circle-color", pointColor);
		}

		stylePropsRef.current = { clusterColors, clusterThresholds, pointColor };
	}, [
		isLoaded,
		map,
		clusterLayerId,
		unclusteredLayerId,
		clusterColors,
		clusterThresholds,
		pointColor,
	]);

	useEffect(() => {
		if (!isLoaded || !map) return;

		const handleClusterClick = async (
			e: MapLibreGL.MapMouseEvent & {
				features?: MapLibreGL.MapGeoJSONFeature[];
			}
		) => {
			const features = map.queryRenderedFeatures(e.point, {
				layers: [clusterLayerId],
			});
			if (!features.length) return;

			const feature = features[0];
			const clusterId = feature.properties?.cluster_id as number;
			const pointCount = feature.properties?.point_count as number;
			const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [
				number,
				number,
			];

			if (onClusterClick) {
				onClusterClick(clusterId, coordinates, pointCount);
			} else {
				const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource;
				const zoom = await source.getClusterExpansionZoom(clusterId);
				map.easeTo({
					center: coordinates,
					zoom,
				});
			}
		};

		const handlePointClick = (
			e: MapLibreGL.MapMouseEvent & {
				features?: MapLibreGL.MapGeoJSONFeature[];
			}
		) => {
			if (!onPointClick || !e.features?.length) return;

			const feature = e.features[0];
			const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [
				number,
				number,
			];

			while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
				coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
			}

			onPointClick(
				feature as unknown as GeoJSON.Feature<GeoJSON.Point, P>,
				coordinates
			);
		};

		const handleMouseEnterCluster = () => {
			map.getCanvas().style.cursor = "pointer";
		};
		const handleMouseLeaveCluster = () => {
			map.getCanvas().style.cursor = "";
		};
		const handleMouseEnterPoint = () => {
			if (onPointClick) {
				map.getCanvas().style.cursor = "pointer";
			}
		};
		const handleMouseLeavePoint = () => {
			map.getCanvas().style.cursor = "";
		};

		map.on("click", clusterLayerId, handleClusterClick);
		map.on("click", unclusteredLayerId, handlePointClick);
		map.on("mouseenter", clusterLayerId, handleMouseEnterCluster);
		map.on("mouseleave", clusterLayerId, handleMouseLeaveCluster);
		map.on("mouseenter", unclusteredLayerId, handleMouseEnterPoint);
		map.on("mouseleave", unclusteredLayerId, handleMouseLeavePoint);

		return () => {
			map.off("click", clusterLayerId, handleClusterClick);
			map.off("click", unclusteredLayerId, handlePointClick);
			map.off("mouseenter", clusterLayerId, handleMouseEnterCluster);
			map.off("mouseleave", clusterLayerId, handleMouseLeaveCluster);
			map.off("mouseenter", unclusteredLayerId, handleMouseEnterPoint);
			map.off("mouseleave", unclusteredLayerId, handleMouseLeavePoint);
		};
	}, [
		isLoaded,
		map,
		clusterLayerId,
		unclusteredLayerId,
		sourceId,
		onClusterClick,
		onPointClick,
	]);

	return null;
}

export {
	Map,
	useMap,
	MapMarker,
	MarkerContent,
	MarkerPopup,
	MarkerTooltip,
	MarkerLabel,
	MapPopup,
	MapControls,
	MapRoute,
	MapClusterLayer,
};

export type { MapRef, MapViewport };
