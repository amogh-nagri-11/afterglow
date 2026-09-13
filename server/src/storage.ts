import fs from "fs/promises";
import path from "path";
import { DeleteObjectsCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Photos uploaded before object storage store "/uploads/<file>" paths served from local disk
const LEGACY_PREFIX = "/uploads/";
const LOCAL_ROOT = path.join(__dirname, "../uploads");

const SIGNED_URL_TTL_SECONDS = 60 * 60;
const SIGNING_WINDOW_MS = 30 * 60 * 1000;

interface StorageDriver {
    put(key: string, body: Buffer, contentType: string): Promise<void>;
    remove(keys: string[]): Promise<void>;
    url(key: string): Promise<string>;
}

const localDriver: StorageDriver = {
    async put(key, body) {
        const file = path.join(LOCAL_ROOT, key);
        await fs.mkdir(path.dirname(file), { recursive: true });
        await fs.writeFile(file, body);
    },
    async remove(keys) {
        await Promise.all(keys.map((key) => fs.unlink(path.join(LOCAL_ROOT, key)).catch(() => {})));
    },
    async url(key) {
        return `/uploads/${key}`;
    },
};

function createR2Driver(): StorageDriver {
    const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_ENDPOINT } = process.env;

    const missing = Object.entries({ R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET })
        .filter(([, value]) => !value)
        .map(([name]) => name);
    if (!R2_ENDPOINT && !R2_ACCOUNT_ID) missing.push("R2_ACCOUNT_ID");
    if (missing.length) {
        throw new Error(`STORAGE_DRIVER=r2 but these env vars are missing: ${missing.join(", ")}`);
    }

    const client = new S3Client({
        region: "auto",
        // R2_ENDPOINT is only for pointing at another S3-compatible server (e.g. MinIO in tests)
        endpoint: R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        forcePathStyle: Boolean(R2_ENDPOINT),
        credentials: { accessKeyId: R2_ACCESS_KEY_ID!, secretAccessKey: R2_SECRET_ACCESS_KEY! },
        // Cloudflare recommends this for R2 with newer SDK versions
        requestChecksumCalculation: "WHEN_REQUIRED",
        responseChecksumValidation: "WHEN_REQUIRED",
    });

    return {
        async put(key, body, contentType) {
            await client.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: body, ContentType: contentType }));
        },
        async remove(keys) {
            await client.send(
                new DeleteObjectsCommand({ Bucket: R2_BUCKET, Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true } }),
            );
        },
        url(key) {
            // Sign from the start of a 30-minute window so the URL is identical (and browser-cacheable) within it.
            // With a 1-hour TTL every URL stays valid for at least 30 minutes after it's handed out.
            const signingDate = new Date(Math.floor(Date.now() / SIGNING_WINDOW_MS) * SIGNING_WINDOW_MS);
            return getSignedUrl(client, new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }), {
                expiresIn: SIGNED_URL_TTL_SECONDS,
                signingDate,
            });
        },
    };
}

let driver: StorageDriver | null = null;

// Called at startup (after dotenv) so misconfiguration fails fast rather than on the first upload
export function initStorage() {
    const name = process.env.STORAGE_DRIVER || "local";
    if (name === "r2") driver = createR2Driver();
    else if (name === "local") driver = localDriver;
    else throw new Error(`Unknown STORAGE_DRIVER "${name}" (expected "local" or "r2")`);
    return name;
}

function active(): StorageDriver {
    if (!driver) initStorage();
    return driver!;
}

const isLegacy = (key: string) => key.startsWith(LEGACY_PREFIX);

export const storage = {
    put: (key: string, body: Buffer, contentType: string) => active().put(key, body, contentType),

    async remove(keys: (string | null | undefined)[]) {
        const present = keys.filter((key): key is string => Boolean(key));
        const legacy = present.filter(isLegacy).map((key) => key.slice(LEGACY_PREFIX.length));
        const current = present.filter((key) => !isLegacy(key));

        await Promise.all([
            legacy.length ? localDriver.remove(legacy) : undefined,
            current.length ? active().remove(current) : undefined,
        ]);
    },

    url: (key: string) => (isLegacy(key) ? Promise.resolve(key) : active().url(key)),
};

// Swaps stored object keys for URLs the browser can load
export async function photoUrls<T extends { storageKey: string; thumbnailKey: string | null }>({
    storageKey,
    thumbnailKey,
    ...rest
}: T) {
    const [storageUrl, thumbnailUrl] = await Promise.all([
        storage.url(storageKey),
        thumbnailKey ? storage.url(thumbnailKey) : null,
    ]);
    return { ...rest, storageUrl, thumbnailUrl };
}
