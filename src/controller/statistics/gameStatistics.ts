import { Request, Response } from "express";
import {
  chapterStatistics,
  contentStatistics,
  dashboardStatistics,
  levelStatistics,
  playerStatistics,
} from "../../services/statistics";

export const playerStats = async (req: Request, res: Response) => {
  const result = await playerStatistics();
  res.json(result);
};

export const dashboardStats = async (req: Request, res: Response) => {
  const result = await dashboardStatistics();
  res.json(result);
};

export const chapterStats = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await chapterStatistics();
  res.json(result);
};

export const levelStats = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { id_chapter } = req.query;
  const result = await levelStatistics({ id_chapter });
  res.json(result);
};

export const contentStats = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { id_level } = req.query;
  const result = await contentStatistics({ id_level });
  res.json(result);
};
