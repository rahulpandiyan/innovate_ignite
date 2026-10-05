import { PrismaClient } from "@prisma/client";

// Prisma Postgres hands out connections with a multi-second cold handshake (a
// bare `select 1` measured ~4.5s on a fresh pool, ~0.5s warm). Prisma's default
// connect window is 5s, so a page that fires several queries at once — e.g. the
// six parallel reads in app/dashboard/page.tsx — can blow past it and fail with
// P1001 "Can't reach database server". Give the engine room to wait, and cap the
// pool so bursts queue instead of opening a socket per query.
const CONNECTION_DEFAULTS: [string, string][] = [
  ["connect_timeout", "20"],
  ["connection_limit", "5"],
  ["pool_timeout", "30"],
];

function withConnectionDefaults(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const missing = CONNECTION_DEFAULTS.filter(
    ([key]) => !new RegExp(`[?&]${key}=`).test(url)
  );
  if (missing.length === 0) return url;
  const separator = url.includes("?") ? "&" : "?";
  return url + separator + missing.map(([k, v]) => `${k}=${v}`).join("&");
}

const prismaClientSingleton = () => {
    return new PrismaClient({
        datasourceUrl: withConnectionDefaults(process.env.DATABASE_URL),
        transactionOptions: {
            maxWait: 15000,
            timeout: 60000,
        },
    });
};

declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;