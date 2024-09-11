import * as d3 from "d3";
import { RefObject, useEffect, useRef } from "react";
import { DataType, ListDataType } from "./InsDelChart.type";

import { getFileChangesMap } from "../FileIcicleSummary/FileIcicleSummary.util";
import { useGetSelectedData } from "../Statistics.hook";
import "./InsDelChart.scss";
import { convertFileChangesMapToDataType } from "./InsDelChart.util";

const drawInsDelChart = async ($target: RefObject<SVGSVGElement>, data: DataType) => {
  // if (!$target.current) return;

  // // Remove any existing content in the SVG
  // d3.select($target.current).selectAll("*").remove();

  d3.select($target.current)
    .append("text")
    .attr("x", 100)
    .attr("y", 100)
    .attr("fill", "white")
    .text("Starting SVG generation...");

  const signs = new Map<string, number>([
    ...data.negatives.map((d) => [d, -1] as [string, number]),
    ...data.positives.map((d) => [d, +1] as [string, number]),
  ]);

  const bias = d3.sort(
    d3.rollup(
      data.listData,
      (v: ListDataType[]) => d3.sum(v, (d: ListDataType) => d.value * Math.min(0, signs.get(d.category) ?? 0)),
      (d: ListDataType) => d.name
    ),
    ([, a]: [string, number | undefined]) => a as number
  );

  const width = 1200;
  const marginTop = 40;
  const marginRight = 30;
  const marginBottom = 0;
  const marginLeft = 80;
  const height = bias.length * 33 + marginTop + marginBottom;

  const series = d3
    .stack<[string, Map<string, number>], string>()
    .keys([...data.negatives.slice().reverse(), ...data.positives])
    .value(
      ([, value]: [string, Map<string, number>], category: string) =>
        (signs.get(category) ?? 0) * (value.get(category) || 0)
    )
    .offset(d3.stackOffsetDiverging)(
    d3.rollup(
      data.listData,
      (d1: ListDataType[]) =>
        d3.rollup(
          d1,
          (d2: ListDataType[]) => d2[0].value,
          (d: ListDataType) => d.category
        ),
      (d: ListDataType) => d.name
    )
  );

  const extent = d3.extent(series.flat(2)) as [number | undefined, number | undefined];

  const x = d3
    .scaleLinear()
    .domain(extent[0] !== undefined && extent[1] !== undefined ? (extent as [number, number]) : [0, 1])
    .rangeRound([marginLeft, width - marginRight]);

  const y = d3
    .scaleBand<string>()
    .domain(bias.map(([name]: [string, number | undefined]) => name))
    .rangeRound([marginTop, height - marginBottom])
    .padding(2 / 33);

  const color = d3
    .scaleOrdinal<string>()
    .domain([...data.negatives, ...data.positives])
    .range(d3.schemeSpectral[data.negatives.length + data.positives.length]);

  const formatValue = (
    (format: (n: number) => string) => (xx: number) =>
      format(Math.abs(xx))
  )(d3.format(".0%"));

  const svg = d3
    .select($target.current)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; font: 20px sans-serif; background-color: white;");

  svg
    .append("g")
    .selectAll("g")
    .data(series)
    .join("g")
    .attr("fill", (d) => color(d.key))
    .selectAll("rect")
    .data((d) => d.map((v) => Object.assign(v, { key: d.key })))
    .join("rect")
    .attr("x", (d) => x(d[0]) ?? 0)
    .attr("y", (d) => y(d.data[0]) ?? 0)
    .attr("width", (d) => x(d[1]) - x(d[0]))
    .attr("height", y.bandwidth())
    .append("title")
    .text((d) => {
      const { key } = d;
      const name = d.data[0];
      const value = d.data[1];
      return `${name}\n${formatValue(value.get(key) || 0)} ${key}`;
    });

  svg
    .append("g")
    .attr("transform", `translate(0,${marginTop})`)
    // .call(
    //   d3
    //     .axisTop(x)
    //     .ticks(width / 80)
    //     .tickFormat(formatValue)
    //     .tickSizeOuter(0)
    // )
    .call((g) => {
      g.select(".domain").remove();
    })
    .call((g) => {
      g.append("text")
        .attr("x", x(0) + 20)
        .attr("y", -24)
        .attr("fill", "#fff !important")
        .attr("text-anchor", "start")
        .style("font-size", "30px")
        // .style("color", "#fff")
        .text(data.positive);
    })
    .call((g) => {
      g.append("text")
        .attr("x", x(0) - 20)
        .attr("y", -24)
        .attr("fill", "#fff")
        .attr("text-anchor", "end")
        .style("font-size", "30px")
        // .style("color", "#fff")
        .text(data.negative);
    });

  svg
    .append("g")
    .call(d3.axisLeft(y).tickSizeOuter(0))
    .call((g) =>
      g
        .selectAll(".tick")
        .data(bias)
        .attr("transform", ([name, min]: [string, number | undefined]) => {
          const yPos = y(name); // y(name)의 결과를 확인
          return `translate(${x(min as number)},${yPos !== undefined ? yPos + y.bandwidth() / 2 : 0})`; // yPos가 undefined인 경우 0으로 처리
        })
        .select("text")
        .attr("fill", "white")
        .style("font-size", "30px")
    )
    .call((g) => g.select(".domain").attr("transform", `translate(${x(0)},0)`));

  const svgNode = svg.node();

  return svgNode ? Object.assign(svgNode, { scales: { color } }) : "차트";
};
const destroyInsDelChart = ($target: RefObject<SVGSVGElement>) => {
  d3.select($target.current).selectAll("*").remove();
};

const InsDelChart = ({ currentPath }: { currentPath: string }) => {
  const data = useGetSelectedData();
  const $summary = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (data) {
      const treeData = getFileChangesMap(data);
      drawInsDelChart($summary, convertFileChangesMapToDataType(treeData, currentPath));
      // drawIcicleTree($summary, data);
    }
    return () => {
      destroyInsDelChart($summary);
    };
  }, [data, currentPath]);

  if (!data) {
    return null;
  }

  return (
    <div className="ins-del-chart">
      <span className="ins-del-chart-title">InsDelChart</span>
      <span>{currentPath}</span>
      <svg ref={$summary} />
    </div>
  );
};

export default InsDelChart;
