import * as crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

export function generateHmac(
  data: string,
  secretKey: string
): string {
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(data, 'utf8');
  return hmac.digest('hex');
}

export function verifyHmac(
  data: string,
  secretKey: string,
  receivedSignature: string
): boolean {
  const expectedSignature = generateHmac(data, secretKey);

  const expectedSignatureBuffer = Buffer.from(expectedSignature, 'hex');
  const receivedSignatureBuffer = Buffer.from(receivedSignature, 'hex');

  try {
    return crypto.timingSafeEqual(expectedSignatureBuffer, receivedSignatureBuffer);
  } catch (error) {
    console.error("Error during HMAC verification:", error);
    return false;
  }
}

export const hmacAuthenticationMiddleware = (secretKey: string) => {
  const generateDataToSign = (req: Request) => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      if (!req.body || Object.keys(req.body).length === 0) {
        return "";
      }
      return JSON.stringify(req.body);
    }
    return "";
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const receivedSignature = req.headers['x-signature'] as string;

    // only ignore authenticate for GET method
    if (req.method === 'GET') {
      next()
    } else {
      try {
        const isValid = verifyHmac(generateDataToSign(req), secretKey, receivedSignature)
        if (isValid || req.method === 'GET') {
          next();
        } else {
          res.status(403).json({ message: 'Invalid HMAC signature' });
        }
      } catch (error) {
        console.error('Error during HMAC verification:', error);
        res.status(500).json({ message: 'Error during signature verification' });
      }
    }
  }
}
