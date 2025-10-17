import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JWTPayload } from '../types';

export const generateAccessToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
    issuer: 'chatapp-api',
    audience: 'chatapp-client'
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
    issuer: 'chatapp-api',
    audience: 'chatapp-client'
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.JWT_SECRET, {
      issuer: 'chatapp-api',
      audience: 'chatapp-client'
    }) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.JWT_REFRESH_SECRET, {
      issuer: 'chatapp-api',
      audience: 'chatapp-client'
    }) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};
