import { Router, type IRouter } from "express";
import healthRouter from "./health";
import erpProxyRouter from "./erp-proxy";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/erp", erpProxyRouter);

export default router;
