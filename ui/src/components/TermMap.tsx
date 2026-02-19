import { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { mds2D } from "@/lib/dimensionality";

interface TermMapProps {
  matrix: number[][];
  labels: string[];
}

export function TermMap({ matrix, labels }: TermMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const points = useMemo(
    () => mds2D(matrix, labels),
    [matrix, labels],
  );

  useEffect(() => {
    if (!svgRef.current || points.length < 2) return;

    const svg = d3.select(svgRef.current);
    const width = 600;
    const height = 400;
    const margin = { top: 30, right: 30, bottom: 30, left: 30 };

    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);

    const xExtent = d3.extent(xs) as [number, number];
    const yExtent = d3.extent(ys) as [number, number];

    // Add padding to extents
    const xPad = (xExtent[1] - xExtent[0]) * 0.15 || 1;
    const yPad = (yExtent[1] - yExtent[0]) * 0.15 || 1;

    const xScale = d3
      .scaleLinear()
      .domain([xExtent[0] - xPad, xExtent[1] + xPad])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([yExtent[0] - yPad, yExtent[1] + yPad])
      .range([height - margin.bottom, margin.top]);

    const colors = d3.schemeTableau10;

    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr("transform", event.transform.toString());
      });

    svg.call(zoom);

    // Draw dots
    g.selectAll("circle")
      .data(points)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 8)
      .attr("fill", (_, i) => colors[i % colors.length]!)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer");

    // Draw labels
    g.selectAll("text")
      .data(points)
      .enter()
      .append("text")
      .attr("x", (d) => xScale(d.x))
      .attr("y", (d) => yScale(d.y) - 14)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("fill", "currentColor")
      .text((d) =>
        d.label.length > 20 ? d.label.slice(0, 17) + "..." : d.label,
      );

    // Tooltip on hover
    const tooltip = svg
      .append("text")
      .attr("font-size", "10px")
      .attr("fill", "currentColor")
      .style("pointer-events", "none")
      .style("opacity", 0);

    g.selectAll("circle")
      .on("mouseover", function (event: MouseEvent, d: unknown) {
        const point = d as { label: string; x: number; y: number };
        d3.select(this).attr("r", 12);
        tooltip
          .attr("x", (event.target as SVGCircleElement).cx.baseVal.value)
          .attr(
            "y",
            (event.target as SVGCircleElement).cy.baseVal.value - 24,
          )
          .text(point.label)
          .style("opacity", 1);
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 8);
        tooltip.style("opacity", 0);
      });
  }, [points]);

  if (points.length < 2) {
    return (
      <p className="text-muted-foreground text-center text-sm py-8">
        Upload at least 2 documents to see the map.
      </p>
    );
  }

  return (
    <div className="w-full aspect-[3/2] border rounded-lg overflow-hidden bg-background">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}
