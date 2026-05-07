import { useMemo, useRef, useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  GraphCanvas,
  type GraphCanvasRef,
  type GraphEdge,
  type GraphNode,
  type Theme,
  darkTheme,
  lightTheme,
  useSelection,
} from "reagraph"

import { Button } from "@/components/ui/button"
import { useThemeContext } from "@/providers/theme-provider"

import type { GraphData } from "@/lib/browse/types"

interface NetworkGraphProps {
  data: GraphData
}

type NodeMeta =
  | { kind: "root"; name: string }
  | { kind: "department"; code: string; name: string }
  | {
      kind: "course"
      deptCode: string
      courseCode: string
      name: string
      courseType: string
    }

const ROOT_NODE_ID = "unimore"

const BRAND_PRIMARY = "#c4361b"
const BRAND_PRIMARY_ACTIVE = "#e85a3e"
const COURSE_FILL_LIGHT = "#475569"
const COURSE_FILL_DARK = "#94a3b8"
const COURSE_ACTIVE = "#0ea5e9"

const MAX_COURSE_LABEL_CHARS = 22

function shortenCourseLabel(text: string): string {
  if (text.length <= MAX_COURSE_LABEL_CHARS) return text
  return text.slice(0, MAX_COURSE_LABEL_CHARS - 1).trimEnd() + "…"
}

function buildTheme(base: Theme, courseFill: string): Theme {
  return {
    ...base,
    canvas: {},
    node: {
      ...base.node,
      fill: courseFill,
      activeFill: COURSE_ACTIVE,
      label: {
        ...base.node.label,
        activeColor: BRAND_PRIMARY_ACTIVE,
      },
      subLabel: base.node.subLabel
        ? {
            ...base.node.subLabel,
            stroke: undefined,
            activeColor: BRAND_PRIMARY_ACTIVE,
          }
        : undefined,
    },
    edge: {
      ...base.edge,
      activeFill: BRAND_PRIMARY_ACTIVE,
      label: {
        ...base.edge.label,
        activeColor: BRAND_PRIMARY_ACTIVE,
      },
      subLabel: base.edge.subLabel
        ? {
            ...base.edge.subLabel,
            stroke: undefined,
            activeColor: BRAND_PRIMARY_ACTIVE,
          }
        : undefined,
    },
    arrow: {
      ...base.arrow,
      activeFill: BRAND_PRIMARY_ACTIVE,
    },
    ring: {
      ...base.ring,
      activeFill: BRAND_PRIMARY_ACTIVE,
    },
  }
}

export function NetworkGraph({ data }: NetworkGraphProps) {
  const { resolvedTheme } = useThemeContext()
  const ref = useRef<GraphCanvasRef | null>(null)
  const [hovered, setHovered] = useState<NodeMeta | null>(null)
  const [selected, setSelected] = useState<NodeMeta | null>(null)

  const { nodes, edges } = useMemo(() => {
    const deptById = new Map(data.departments.map((d) => [d.id, d]))

    const rootNode: GraphNode = {
      id: ROOT_NODE_ID,
      label: "UNIMORE",
      size: 36,
      fill: BRAND_PRIMARY,
      data: {
        kind: "root",
        name: "Università di Modena e Reggio Emilia",
      } satisfies NodeMeta,
    }

    const deptNodes: GraphNode[] = data.departments.map((d) => ({
      id: `dept-${d.id}`,
      label: d.name,
      size: 20,
      fill: BRAND_PRIMARY,
      data: {
        kind: "department",
        code: d.code,
        name: d.name,
      } satisfies NodeMeta,
    }))

    const courseNodes: GraphNode[] = data.courses
      .filter((c) => deptById.has(c.department_id))
      .map((c) => {
        const dept = deptById.get(c.department_id)!
        return {
          id: `course-${c.id}`,
          label: shortenCourseLabel(c.name),
          size: 6,
          data: {
            kind: "course",
            deptCode: dept.code,
            courseCode: c.code,
            name: c.name,
            courseType: c.course_type,
          } satisfies NodeMeta,
        }
      })

    const deptEdges: GraphEdge[] = data.departments.map((d) => ({
      id: `root-dept-${d.id}`,
      source: ROOT_NODE_ID,
      target: `dept-${d.id}`,
    }))

    const courseDeptEdges: GraphEdge[] = data.courses
      .filter((c) => deptById.has(c.department_id))
      .map((c) => ({
        id: `dept-course-${c.id}`,
        source: `dept-${c.department_id}`,
        target: `course-${c.id}`,
      }))

    const courseRootEdges: GraphEdge[] = data.courses
      .filter((c) => deptById.has(c.department_id))
      .map((c) => ({
        id: `root-course-${c.id}`,
        source: ROOT_NODE_ID,
        target: `course-${c.id}`,
      }))

    return {
      nodes: [rootNode, ...deptNodes, ...courseNodes],
      edges: [...deptEdges, ...courseDeptEdges, ...courseRootEdges],
    }
  }, [data])

  const theme = useMemo(() => {
    if (resolvedTheme === "dark") {
      return buildTheme(darkTheme, COURSE_FILL_DARK)
    }
    return buildTheme(lightTheme, COURSE_FILL_LIGHT)
  }, [resolvedTheme])

  const {
    selections,
    actives,
    onNodeClick,
    onNodePointerOver,
    onNodePointerOut,
    onCanvasClick,
    clearSelections,
  } = useSelection({
    ref,
    nodes,
    edges,
    type: "single",
    pathHoverType: "all",
    pathSelectionType: "all",
    focusOnSelect: false,
  })

  const handleNodeClick = (node: GraphNode) => {
    onNodeClick?.(node)
    const meta = node.data as NodeMeta | undefined
    setSelected(meta ?? null)
  }

  const handleCanvasClick = (event: MouseEvent) => {
    onCanvasClick?.(event)
    setSelected(null)
  }

  const handlePointerOver = (node: GraphNode) => {
    onNodePointerOver?.(node)
    const meta = node.data as NodeMeta | undefined
    if (meta) setHovered(meta)
  }

  const handlePointerOut = (node: GraphNode) => {
    onNodePointerOut?.(node)
    setHovered(null)
  }

  const cardMeta = selected ?? hovered

  return (
    <div className="relative h-full w-full">
      <GraphCanvas
        ref={ref}
        nodes={nodes}
        edges={edges}
        layoutType="forceDirected2d"
        layoutOverrides={{
          linkDistance: 180,
          nodeStrength: -800,
          forceLinkDistance: 200,
        }}
        theme={theme}
        selections={selections}
        actives={actives}
        draggable={false}
        labelType="auto"
        glOptions={{ alpha: true, antialias: true }}
        onNodeClick={handleNodeClick}
        onNodePointerOver={handlePointerOver}
        onNodePointerOut={handlePointerOut}
        onCanvasClick={handleCanvasClick}
      />
      <NodeCard
        meta={cardMeta}
        isPinned={!!selected}
        onClose={() => {
          clearSelections()
          setSelected(null)
        }}
      />
    </div>
  )
}

function NodeCard({
  meta,
  isPinned,
  onClose,
}: {
  meta: NodeMeta | null
  isPinned: boolean
  onClose: () => void
}) {
  if (!meta) return null

  const kindLabel =
    meta.kind === "root"
      ? "Ateneo"
      : meta.kind === "department"
        ? "Dipartimento"
        : "Corso"

  return (
    <div className="absolute right-4 bottom-4 z-10 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border bg-card/95 p-4 shadow-lg backdrop-blur-sm sm:right-6 sm:bottom-6">
      <div className="flex items-center justify-between gap-2">
        <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {kindLabel}
        </div>
        {isPinned && (
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground -mr-1 -mt-1 cursor-pointer rounded-full p-1 text-xs leading-none"
            aria-label="Chiudi"
          >
            ✕
          </button>
        )}
      </div>
      <div className="mt-1 text-sm font-semibold leading-snug">{meta.name}</div>
      {meta.kind === "course" && (
        <div className="text-muted-foreground mt-1 text-xs">
          {meta.courseType} · {meta.deptCode}
        </div>
      )}

      {isPinned ? (
        <Button asChild size="sm" className="mt-3 w-full">
          {meta.kind === "root" ? (
            <Link to="/browse">Apri panoramica</Link>
          ) : meta.kind === "department" ? (
            <Link
              to="/browse/$department"
              params={{ department: meta.code }}
            >
              Apri dipartimento
            </Link>
          ) : (
            <Link
              to="/browse/$department/$course"
              params={{ department: meta.deptCode, course: meta.courseCode }}
            >
              Apri corso
            </Link>
          )}
        </Button>
      ) : (
        <div className="text-primary mt-2 text-xs">Clicca per fissare →</div>
      )}
    </div>
  )
}

export default NetworkGraph
