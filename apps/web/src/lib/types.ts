import type { ActionDTO, ReactionDTO } from "@area/types";

export type DndItem = {
    type: "action" | "reaction",
    info: ActionDTO | ReactionDTO
}

export type NodeData = {
  label: string;
  info: ActionDTO | ReactionDTO;
  valid?: boolean;
  paramValues?: Record<string, string>;
};

export type ActionNodeData = NodeData & { info: ActionDTO };
export type ReactionNodeData = NodeData & { info: ReactionDTO };