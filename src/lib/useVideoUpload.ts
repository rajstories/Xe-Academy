import { useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';

/**
 * Reusable white-labeled video upload, backed by the YouTube Data API.
 *
 * The file is chunked (4 MiB, a multiple of 256 KiB as Google's resumable
 * protocol requires) and each chunk is relayed through our same-origin server
 * routes — YouTube's upload endpoint doesn't allow direct browser-to-Google
 * CORS uploads. Shared by the creator course wizard and the module builder.
 */

export type VideoUploadState = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

const CHUNK_SIZE = 16 * 262_144; // 4 MiB

export function useVideoUpload() {
  const { getToken } = useAuth();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<VideoUploadState>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const startUpload = async (file: File, meta?: { title?: string; description?: string }): Promise<string> => {
    setVideoFile(file);
    setUploadError('');
    setUploadProgress(0);
    setUploadState('uploading');
    setVideoUrl('');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const token = await getToken();
      const initResponse = await fetch('/api/youtube/create-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: meta?.title?.trim() || file.name.replace(/\.[^.]+$/, ''),
          description: meta?.description?.trim() || '',
          contentType: file.type || 'video/*',
          contentLength: file.size,
        }),
        signal: controller.signal,
      });

      const rawBody = await initResponse.text();
      let initData: { error?: string; uploadUrl?: string } = {};
      try {
        initData = JSON.parse(rawBody);
      } catch {
        initData = {};
      }
      if (!initResponse.ok) {
        const detail = initData.error || rawBody.slice(0, 180) || 'No response from the upload service.';
        throw new Error(`Upload service error (${initResponse.status}): ${detail}`);
      }
      const uploadUrl = initData.uploadUrl ?? '';
      if (!uploadUrl) throw new Error('Upload service did not return an upload URL.');

      let start = 0;
      let id = '';

      while (start < file.size) {
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const chunkResponse = await fetch(
          `/api/youtube/upload-chunk?uploadUrl=${encodeURIComponent(uploadUrl)}&start=${start}&end=${end}&total=${file.size}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: chunk,
            signal: controller.signal,
          },
        );

        const chunkRaw = await chunkResponse.text();
        let chunkData: { error?: string; detail?: string; done?: boolean; id?: string } = {};
        try {
          chunkData = JSON.parse(chunkRaw);
        } catch {
          chunkData = {};
        }

        if (!chunkResponse.ok) {
          const base = chunkData.error || `Upload failed while sending bytes ${start}-${end} (status ${chunkResponse.status}).`;
          throw new Error(chunkData.detail ? `${base} ${chunkData.detail.slice(0, 200)}` : base);
        }

        start = end;
        setUploadProgress(Math.round((start / file.size) * 100));

        if (chunkData.done) {
          if (!chunkData.id) throw new Error('Upload finished but no video id was returned.');
          id = chunkData.id;
          break;
        }
      }

      if (!id) throw new Error('Upload did not complete.');

      const playbackUrl = `https://www.youtube.com/watch?v=${id}`;
      setVideoUrl(playbackUrl);
      setUploadProgress(100);
      setUploadState('done');
      return playbackUrl;
    } catch (error) {
      abortRef.current = null;
      if (error instanceof DOMException && error.name === 'AbortError') {
        setUploadState('idle');
        return '';
      }
      setUploadState('error');
      setUploadError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
      return '';
    }
  };

  const reset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setVideoFile(null);
    setUploadState('idle');
    setUploadProgress(0);
    setUploadError('');
    setVideoUrl('');
  };

  return { videoFile, uploadState, uploadProgress, uploadError, videoUrl, startUpload, reset };
}
