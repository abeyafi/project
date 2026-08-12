// Helper: ambil area crop dari sebuah <img> dan hasilkan Blob WebP.
// Dipakai oleh ImageCropper.js.

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });
}

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

export async function getCroppedImageBlob(
  imageSrc,
  croppedAreaPixels,
  rotation = 0,
  maxDimension = 2000
) {
  const image = await createImage(imageSrc);
  const rotRad = toRadians(rotation);

  // Kanvas cukup besar untuk menampung gambar yang dirotasi
  const sin = Math.abs(Math.sin(rotRad));
  const cos = Math.abs(Math.cos(rotRad));
  const bboxWidth = image.width * cos + image.height * sin;
  const bboxHeight = image.width * sin + image.height * cos;

  const rotCanvas = document.createElement("canvas");
  rotCanvas.width = bboxWidth;
  rotCanvas.height = bboxHeight;
  const rotCtx = rotCanvas.getContext("2d");
  rotCtx.translate(bboxWidth / 2, bboxHeight / 2);
  rotCtx.rotate(rotRad);
  rotCtx.drawImage(image, -image.width / 2, -image.height / 2);

  let outW = croppedAreaPixels.width;
  let outH = croppedAreaPixels.height;
  if (outW > maxDimension || outH > maxDimension) {
    const scale = maxDimension / Math.max(outW, outH);
    outW = Math.round(outW * scale);
    outH = Math.round(outH * scale);
  }

  const outCanvas = document.createElement("canvas");
  outCanvas.width = outW;
  outCanvas.height = outH;
  const outCtx = outCanvas.getContext("2d");
  outCtx.drawImage(
    rotCanvas,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    outW,
    outH
  );

  return new Promise((resolve) => {
    outCanvas.toBlob(
      (blob) => resolve(blob),
      "image/webp",
      0.9
    );
  });
}
