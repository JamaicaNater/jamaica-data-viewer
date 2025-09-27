// index.js (CommonJS)
import { onRequest } from "firebase-functions/https";

import { handler} from "./build/handler.js"; // dynamic import returns a promise

// let appPromise = import("../build/handler.js"); // dynamic import returns a promise

export const ssr = onRequest(async (req, res) => {
    // const { handler } = await handler();
    return handler(req, res);
});
