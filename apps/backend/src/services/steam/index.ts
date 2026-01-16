import type { IService } from "../../interfaces/service"
import { newSpecialsAction } from "./actions/new-specials"
//import { topSellersAction } from "./actions/top-sellers"

export const steamService: IService = {
    name: "steam",
    description: "Steam games reductions and games of the moment",
    requiresAuth: false,
    authType: "none",
    actions: [
        newSpecialsAction,
        //topSellersAction
    ],
    reactions: []
}
