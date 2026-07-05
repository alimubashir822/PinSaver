import { cookies } from 'next/headers';
import { verifyToken, JWTPayload } from './auth';

export async function getSessionUser(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch (error) {
    return null;
  }
}
