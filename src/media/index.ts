import { Models, ThumbnailProvider } from "../../typings";
import express, { Router } from "express";
import { OpenApiBuilder } from "openapi3-ts";
import { Persistence } from "../persistence";
import routes from "./routes";
import describe from "./describe";
import Storage from "./storage/Storage";
import FsStorage from "./storage/FsStorage";
import LocalThumbnailProvider from "./thumbnails/LocalThumbnailProvider";

export default function media(
  persistence: Persistence,
  models: Models,
  storage: Storage,
  customThumbnailProvider?: ThumbnailProvider
) {
  const thumbnailProvider = customThumbnailProvider
    ? customThumbnailProvider
    : new LocalThumbnailProvider(storage);
  return {
    describe(api: OpenApiBuilder) {
      describe(api, models.media);
    },
    routes(router: Router) {
      routes(router, persistence, storage);
      if (storage instanceof FsStorage) {
        router.use("/media", express.static(storage.uploadDir));
      }
      router.get("/thumbs/:format/*", async (req, res) => {
        const { format } = req.params;
        const id = req.params["0"];
        try {
          const url = await thumbnailProvider.getThumbUrl(id, format);
          if (!url) res.status(404).end();
          else res.redirect(url);
        } catch (err) {
          res.status(500).end();
        }
      });
    }
  };
}
