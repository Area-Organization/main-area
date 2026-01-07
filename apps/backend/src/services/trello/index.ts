import type { IService } from "../../interfaces/service";
import { newCardAction } from "./actions/new-card";
import { createCardReaction } from "./reactions/create-card";

export const trelloService: IService = {
  name: "trello",
  description: "Connect to Trello to manage your project boards.",
  requiresAuth: true,
  authType: "api_key", // API Key + Token
  authFields: [
    {
      key: "accessToken",
      label: "Personal Token",
      type: "password",
      required: true,
      description: "Generate a token at trello.com/app-key after logging in"
    }
  ],
  actions: [
    newCardAction
  ],
  reactions: [
    createCardReaction
  ]
};