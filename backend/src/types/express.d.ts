import type { JwtPayload } from 'jsonwebtoken';
declare global { namespace Express { interface Request { user?: JwtPayload & { cusername: string; isAdmin: boolean } } } }
export {};
