// src/utils/verifyJwt.ts
import { jwtVerify, importJWK } from "jose";

export async function verifyJwt(token: string): Promise<any> {
  const res = await fetch("https://api.openlogin.com/jwks");
  const { keys } = await res.json();

  const decoded = JSON.parse(Buffer.from(token.split(".")[0], "base64").toString());
  const key = keys.find((k: any) => k.kid === decoded.kid);

  if (!key) throw new Error("Matching JWK not found");

  const jwk = await importJWK(key, "RS256");
  const { payload } = await jwtVerify(token, jwk);
  return payload;
}
