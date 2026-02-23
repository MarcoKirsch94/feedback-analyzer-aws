import { createRemoteJWKSet, jwtVerify } from "jose";

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} missing`);
  return v;
}

/**
 * requireAuth(optionalGroup)
 * - Wenn AUTH_DISABLED=true → lässt alles durch (lokale Entwicklung)
 * - Wenn AUTH_DISABLED=false → validiert Cognito JWT (RS256) gegen JWKS
 * - optionalGroup="admin" → prüft cognito:groups enthält "admin"
 */
export function requireAuth(optionalGroup) {
  const disabled = (process.env.AUTH_DISABLED || "").toLowerCase() === "true";
  if (disabled) {
    return (req, res, next) => next();
  }

  const region = mustEnv("COGNITO_REGION");
  const userPoolId = mustEnv("COGNITO_USER_POOL_ID");
  const clientId = mustEnv("COGNITO_CLIENT_ID");

  const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
  const jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));

  return async (req, res, next) => {
    try {
      const auth = req.headers.authorization || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
      if (!token) return res.status(401).json({ error: "missing_token" });

      const { payload } = await jwtVerify(token, jwks, {
        issuer,
        audience: clientId
      });

      if (optionalGroup) {
        const groups = payload["cognito:groups"] || [];
        if (!Array.isArray(groups) || !groups.includes(optionalGroup)) {
          return res.status(403).json({ error: "forbidden" });
        }
      }

      req.user = payload;
      next();
    } catch (e) {
      console.error("auth failed:", e?.message || e);
      res.status(401).json({ error: "invalid_token" });
    }
  };
}