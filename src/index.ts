import express from "express";
import "express-async-errors";
import cors from "cors";

import { PORT } from "./env";
import { handleError } from "./middleware/handleError";

import { router as routerAuth } from "./router/auth";
import { router as routerGame } from "./router/game";
import { router as routerProgress } from "./router/progress";
import { router as routerStatistics } from "./router/statistics";

export const app = express();

app.use(express.json());
app.use(cors());

app.use(routerAuth);
app.use(routerGame);
app.use(routerProgress);
app.use(routerStatistics);
app.use("/images", express.static("uploads"));
app.use(handleError);

const port = PORT || 3000;

app.listen(port, () => console.log(`Application running in port ${port}`));
