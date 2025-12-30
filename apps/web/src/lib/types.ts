import type { ActionDTO } from "@area/types"

export type DndItem = {
    type: "Action" | "Reaction",
    info: ActionDTO
}