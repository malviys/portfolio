import path from "node:path";
import { encode } from "blurhash";
import { Jimp } from "jimp";

const imagePaths = process.argv.slice(2);

if (imagePaths.length === 0) {
  console.error("Usage: bun run blurhash:generate <image-1> <image-2> ...");
  process.exit(1);
}

const encodeImageToBlurhash = async (filePath: string): Promise<string> => {
  const image = await Jimp.read(filePath);
  image.resize({ w: 64, h: 64 });

  const { data, width, height } = image.bitmap;
  const rgbaPixels = new Uint8ClampedArray(data);
  return encode(rgbaPixels, width, height, 4, 4);
};

const run = async () => {
  for (const imagePath of imagePaths) {
    const absolutePath = path.resolve(imagePath);
    const blurHash = await encodeImageToBlurhash(absolutePath);

    console.log(`${imagePath} => ${blurHash}`);
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
