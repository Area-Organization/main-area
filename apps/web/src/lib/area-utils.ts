import type { ParameterDTO } from "@area/types";
import type { Edge, Node } from "@xyflow/svelte";
import type { ActionNodeData, ReactionNodeData } from "$lib/types";

export function validateArea(nodes: Node[], edges: Edge[]) {
  let actionNb = nodes.filter((n) => n.type === "action").length;
  let reactionNb = nodes.filter((n) => n.type === "reaction").length;

  if (actionNb !== 1 || reactionNb === 0) return false;

  const allNodesValid = nodes.every((n) => n.data.valid !== false);
  if (!allNodesValid) return false;

  let link = 0;
  edges.forEach((e) => {
    if (e.source && e.target) link++;
  });
  // Rudimentary check: at least enough links to connect reactions
  if (link < reactionNb) return false;

  return true;
}

function validateParams(params: [string, ParameterDTO][], paramValues: Record<string, string>) {
  for (const [key, value] of params) {
    if (paramValues[key] === "" && value.required) {
      return false;
    }
  }
  return true;
}

export function validateNode(
  params: [string, ParameterDTO][],
  paramValues: Record<string, string>,
  data: ActionNodeData | ReactionNodeData,
  id: string,
  updateNodeData: Function,
  edgesCtx: { value: Edge[] }
) {
  let isConnected = edgesCtx.value.some((edge) => {
    if (data.label == "action") return edge.source === id;
    else return edge.target === id;
  });

  let paramsValid = validateParams(params, paramValues);

  const currentValues = JSON.stringify(data.paramValues || {});
  const newValues = JSON.stringify(paramValues);

  if (data.valid === (paramsValid && isConnected) && currentValues === newValues) {
    return;
  }
  updateNodeData(id, { valid: paramsValid && isConnected, paramValues });
}
