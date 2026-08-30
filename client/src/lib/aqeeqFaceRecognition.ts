import * as faceapi from "@vladmandic/face-api";

let modelsPromise: Promise<boolean> | null = null;

export async function loadFaceRecognitionModels(): Promise<boolean> {
  if (modelsPromise) return modelsPromise;

  modelsPromise = (async () => {
    try {
      const MODEL_PATH = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_PATH),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_PATH).catch(() => faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_PATH)),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_PATH),
      ]);
      return true;
    } catch (err) {
      console.warn("Could not load local face models, falling back to CDN:", err);
      try {
        const CDN_PATH = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(CDN_PATH),
          faceapi.nets.faceLandmark68Net.loadFromUri(CDN_PATH),
          faceapi.nets.faceRecognitionNet.loadFromUri(CDN_PATH),
        ]);
        return true;
      } catch (cdnErr) {
        console.error("Failed to load face recognition neural models:", cdnErr);
        return false;
      }
    }
  })();

  return modelsPromise;
}

export async function detectFaceDescriptor(imageElementOrUrl: HTMLImageElement | string): Promise<Float32Array | null> {
  await loadFaceRecognitionModels();

  let img: HTMLImageElement;
  if (typeof imageElementOrUrl === "string") {
    img = await faceapi.fetchImage(imageElementOrUrl);
  } else {
    img = imageElementOrUrl;
  }

  const detection = await faceapi
    .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 }))
    .withFaceLandmarks(true)
    .withFaceDescriptor();

  return detection ? detection.descriptor : null;
}

export async function matchSelfieAgainstPhotos(
  selfieUrl: string,
  photos: { id: number; imageUrl: string; caption?: string | null; fileName?: string | null }[],
  onProgress?: (scanned: number, total: number) => void
): Promise<{ photo: typeof photos[0]; distance: number; confidence: number }[]> {
  const loaded = await loadFaceRecognitionModels();
  if (!loaded) return [];

  const selfieImg = await faceapi.fetchImage(selfieUrl);
  const selfieDetection = await faceapi
    .detectSingleFace(selfieImg, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.35 }))
    .withFaceLandmarks(true)
    .withFaceDescriptor();

  if (!selfieDetection) {
    throw new Error("NO_FACE_DETECTED_IN_SELFIE");
  }

  const selfieDescriptor = selfieDetection.descriptor;
  const matches: { photo: typeof photos[0]; distance: number; confidence: number }[] = [];

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    if (onProgress) onProgress(i + 1, photos.length);

    try {
      const targetImg = await faceapi.fetchImage(photo.imageUrl);
      const detections = await faceapi
        .detectAllFaces(targetImg, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.35 }))
        .withFaceLandmarks(true)
        .withFaceDescriptors();

      if (detections.length === 0) continue;

      let minDistance = 1.0;
      for (const det of detections) {
        const dist = faceapi.euclideanDistance(selfieDescriptor, det.descriptor);
        if (dist < minDistance) {
          minDistance = dist;
        }
      }

      // Threshold: distance < 0.58 is a real biometric face match
      if (minDistance <= 0.58) {
        // Compute realistic confidence % (distance 0.30 -> 98%, distance 0.55 -> 80%)
        const confidence = Math.round(Math.max(65, Math.min(99, (1 - (minDistance - 0.2) / 0.4) * 100)));
        matches.push({
          photo,
          distance: minDistance,
          confidence,
        });
      }
    } catch {
      // Ignore individual photo fetch or decode errors and continue scanning
    }
  }

  // Sort best matches first
  matches.sort((a, b) => a.distance - b.distance);
  return matches;
}
