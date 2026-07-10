import fs from "fs";
import ImageKit, { toFile } from "@imagekit/nodejs";

const client = new ImageKit();

// If you have access to Node `fs` we recommend using `fs.createReadStream()`:
await client.files.upload({
  file: fs.createReadStream("/path/to/file"),
  fileName: "fileName",
});

// Or if you have the web `File` API you can pass a `File` instance:
await client.files.upload({
  file: new File(["my bytes"], "file"),
  fileName: "fileName",
});

// You can also pass a `fetch` `Response`:
await client.files.upload({
  file: await fetch("https://somesite/file"),
  fileName: "fileName",
});

// Finally, if none of the above are convenient, you can use our `toFile` helper:
await client.files.upload({
  file: await toFile(Buffer.from("my bytes"), "file"),
  fileName: "fileName",
});
await client.files.upload({
  file: await toFile(new Uint8Array([0, 1, 2]), "file"),
  fileName: "fileName",
});
