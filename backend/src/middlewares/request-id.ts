import type { NextFunction, Request, Response } from 'express';
import { generateRequestId } from '@/utils/id.js';

const HEADER = 'x-request-id';

declare module 'express-serve-static-core' {
  interface Request {
    requestId: string;
  }
}

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header(HEADER);
  const id = incoming && incoming.length <= 128 ? incoming : generateRequestId();
  req.requestId = id;
  res.setHeader(HEADER, id);
  next();
}
