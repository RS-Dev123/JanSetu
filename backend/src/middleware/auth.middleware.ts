import { Response, NextFunction } from 'express';

export const requireAuth = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    // Default fallback to citizen
    let role = 'citizen';
    let uid = 'usr_citizen_demo';
    let email = 'citizen.demo@jansetu.in';
    let name = 'Demo Citizen';
    let constituency = 'New Delhi';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (['citizen', 'officer', 'mp', 'admin'].includes(token)) {
        role = token;
        uid = `usr_${token}_demo`;
        email = `${token}.demo@jansetu.in`;
        name = role === 'citizen' ? 'Demo Citizen' :
               role === 'officer' ? 'Dr. Suresh Bose (Officer)' :
               role === 'mp' ? 'Mohan Reddy (MP)' : 'Admin Demo';
        
        if (role === 'officer') {
          constituency = 'Paschim Medinipur';
        } else if (role === 'mp') {
          constituency = 'Bengaluru Urban';
        }
      }
    }

    req.user = {
      uid,
      email,
      name,
      role,
      constituency,
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: any, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const hasRole = allowedRoles.includes(req.user.role);
    if (!hasRole) {
      res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
      return;
    }

    next();
  };
};
