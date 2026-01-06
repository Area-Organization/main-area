import type { ActionDTO } from "@area/types"

export type DndItem = {
    type: "action" | "reaction",
    info: ActionDTO
}