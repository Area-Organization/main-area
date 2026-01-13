import type { ParameterDTO } from "@area/types";
import type { Edge, Node } from "@xyflow/svelte";

export function validateArea(nodes: Node[], edges: Edge[]) {
  let actionNb = nodes.filter((n) => n.type === "action").length;
  let reactionNb = nodes.filter((n) => n.type === "reaction").length;

  if (actionNb === 0 || reactionNb === 0) return false;

  const allNodesValid = nodes.every((n) => n.data.valid !== false);
  if (!allNodesValid) return false;

  let link = 0;
  edges.forEach((e) => {
    if (e.source && e.target) link++;
  });
  if (!link) return false;

  return true;
}

export function validateNodeParams(params: [string, ParameterDTO][], paramValues: Record<string, string>) {
  for (const [key, value] of params) {
    if (paramValues[key] === "" && value.required) return false;
  }
  return true;
}
