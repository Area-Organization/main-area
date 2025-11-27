import {treaty} from "@elysiajs/eden";
import type {App} from "@area/backend";

const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://0.0.0.0:8080";

export const client = treaty<App>(apiUrl);
