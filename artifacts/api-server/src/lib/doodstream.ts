import { z } from "zod";

const DOODSTREAM_API_BASE_URL = "https://doodapi.co/api";
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024;

const doodStreamResponseSchema = z.object({
  msg: z.string(),
  status: z.number(),
  result: z.unknown(),
});

const doodStreamFileSchema = z.object({
  download_url: z.string().url().optional(),
  single_img: z.string().url().optional(),
  status: z.number().optional(),
  filecode: z.string().min(1),
  splash_img: z.string().url().optional(),
  canplay: z.number().optional(),
  size: z.string().optional(),
  length: z.string().optional(),
  uploaded: z.string().optional(),
  protected_embed: z.string().url().optional(),
  protected_dl: z.string().url().optional(),
  title: z.string().optional(),
});

export type DoodStreamFile = z.infer<typeof doodStreamFileSchema>;

export class DoodStreamError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 502,
  ) {
    super(message);
    this.name = "DoodStreamError";
  }
}

function getApiKey() {
  const apiKey = process.env.DOODSTREAM_API_KEY?.trim();
  if (!apiKey) {
    throw new DoodStreamError(
      "DoodStream integration is not configured",
      503,
    );
  }
  return apiKey;
}

function getResponseError(payload: unknown) {
  const parsed = doodStreamResponseSchema.safeParse(payload);
  if (!parsed.success) {
    return "DoodStream returned an invalid response";
  }
  return parsed.data.msg || "DoodStream rejected the request";
}

async function readJson(response: Response) {
  try {
    return await response.json();
  } catch {
    throw new DoodStreamError("DoodStream returned invalid JSON");
  }
}

async function getUploadServer(apiKey: string) {
  const response = await fetch(
    `${DOODSTREAM_API_BASE_URL}/upload/server?key=${encodeURIComponent(apiKey)}`,
  );
  const payload = await readJson(response);
  const parsed = doodStreamResponseSchema.safeParse(payload);
  if (!response.ok || !parsed.success || parsed.data.status !== 200) {
    throw new DoodStreamError(getResponseError(payload));
  }

  const uploadUrl = z.string().url().safeParse(parsed.data.result);
  if (!uploadUrl.success) {
    throw new DoodStreamError("DoodStream did not provide an upload URL");
  }
  return uploadUrl.data;
}

export async function uploadVideoToDoodStream(file: File): Promise<DoodStreamFile> {
  if (file.size <= 0) {
    throw new DoodStreamError("The uploaded file is empty", 400);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new DoodStreamError("The uploaded file exceeds the 2 GB limit", 413);
  }

  const apiKey = getApiKey();
  const uploadUrl = await getUploadServer(apiKey);
  const form = new FormData();
  form.append("api_key", apiKey);
  form.append("file", file, file.name || "video");

  const uploadEndpoint = new URL(uploadUrl);
  uploadEndpoint.search = apiKey;
  const response = await fetch(uploadEndpoint, {
    method: "POST",
    body: form,
  });
  const payload = await readJson(response);
  const parsed = doodStreamResponseSchema.safeParse(payload);
  if (!response.ok || !parsed.success || parsed.data.status !== 200) {
    throw new DoodStreamError(getResponseError(payload));
  }

  const files = z.array(doodStreamFileSchema).safeParse(parsed.data.result);
  if (!files.success || !files.data[0]) {
    throw new DoodStreamError("DoodStream did not return uploaded file metadata");
  }

  return files.data[0];
}

export function getUploadLimitBytes() {
  return MAX_UPLOAD_BYTES;
}