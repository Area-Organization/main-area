import type { ActionDTO, ReactionDTO } from "@area/types"

export type DndItem = {
    type: "action" | "reaction",
    info: ActionDTO | ReactionDTO
}