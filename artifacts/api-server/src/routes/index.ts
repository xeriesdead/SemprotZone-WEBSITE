import { Router, type IRouter } from "express";
import healthRouter from "./health";
import catalogRouter from "./catalog";
import adminRouter from "./admin";
import doodStreamRouter from "./doodstream";

const router: IRouter = Router();

router.use(healthRouter);
router.use(catalogRouter);
router.use(adminRouter);
router.use(doodStreamRouter);

export default router;
