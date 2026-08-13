import { Router, type IRouter } from "express";
import { DoodStreamError, getUploadLimitBytes, uploadVideoToDoodStream } from "../lib/doodstream";
import { requireAdmin } from "../lib/admin-auth";

const router: IRouter = Router();

router.use("/admin/doodstream", requireAdmin);

router.post("/admin/doodstream/upload", async (req, res) => {
  const contentType = req.headers["content-type"] ?? "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    res.status(415).json({ error: "Upload harus menggunakan multipart/form-data" });
    return;
  }

  const contentLength = Number(req.headers["content-length"]);
  if (Number.isFinite(contentLength) && contentLength > getUploadLimitBytes()) {
    res.status(413).json({ error: "Ukuran file melebihi batas 2 GB" });
    return;
  }

  try {
    const headers = new Headers();
    for (const [name, value] of Object.entries(req.headers)) {
      if (typeof value === "string") {
        headers.set(name, value);
      } else if (Array.isArray(value)) {
        headers.set(name, value.join(", "));
      }
    }

    const webRequest = new Request("http://doodstream-upload.local", {
      method: "POST",
      headers,
      body: req as unknown as AsyncIterable<Uint8Array>,
      duplex: "half",
    });
    const form = await webRequest.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      res.status(400).json({ error: "Field file wajib diisi" });
      return;
    }

    const uploadedFile = await uploadVideoToDoodStream(file);
    res.status(201).json({
      filecode: uploadedFile.filecode,
      embedUrl: uploadedFile.protected_embed,
      downloadUrl: uploadedFile.download_url,
      thumbnailUrl: uploadedFile.single_img,
      splashUrl: uploadedFile.splash_img,
      title: uploadedFile.title,
      size: uploadedFile.size,
      length: uploadedFile.length,
      doodStream: uploadedFile,
    });
  } catch (error) {
    if (error instanceof DoodStreamError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    req.log?.error({ err: error }, "DoodStream upload failed");
    res.status(400).json({ error: "Unable to read the uploaded video" });
  }
});

export default router;