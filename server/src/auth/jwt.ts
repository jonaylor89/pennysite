import { jwtVerify, SignJWT } from "jose";
import { config } from "../config.js";

const secret = new TextEncoder().encode(config.jwtSecret);

export interface JwtPayload {
	sub: string;
	email: string;
	iat?: number;
	exp?: number;
}

export async function createAccessToken(
	userId: string,
	email: string,
): Promise<string> {
	return new SignJWT({ sub: userId, email })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("15m")
		.sign(secret);
}

export async function createRefreshToken(
	userId: string,
	email: string,
): Promise<string> {
	return new SignJWT({ sub: userId, email, type: "refresh" })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("30d")
		.sign(secret);
}

export async function verifyAccessToken(token: string): Promise<JwtPayload> {
	const { payload } = await jwtVerify(token, secret);
	return payload as unknown as JwtPayload;
}

export async function verifyRefreshToken(token: string): Promise<JwtPayload> {
	const { payload } = await jwtVerify(token, secret);
	if ((payload as Record<string, unknown>).type !== "refresh") {
		throw new Error("Not a refresh token");
	}
	return payload as unknown as JwtPayload;
}

/**
 * Create a signed unsubscribe token for email links.
 */
export async function createUnsubscribeToken(
	userId: string,
	category: string,
): Promise<string> {
	return new SignJWT({ sub: userId, category, type: "unsub" })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("90d")
		.sign(secret);
}

export async function verifyUnsubscribeToken(
	token: string,
): Promise<{ userId: string; category: string }> {
	const { payload } = await jwtVerify(token, secret);
	const p = payload as Record<string, unknown>;
	if (p.type !== "unsub") {
		throw new Error("Not an unsubscribe token");
	}
	return { userId: p.sub as string, category: p.category as string };
}
