"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import {
  UploadCloud,
  AlertCircle,
  Trash2,
  RefreshCw,
  Music2,
  ImageIcon,
  Play,
  Pause,
  Link2,
  Cloud,
  Loader2,
  PlaySquare,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { uploadToCloudinary } from "@/lib/upload-client";
import {
  isYouTubeUrl,
  extractYouTubeId,
  extractYouTubeParams,
  getYouTubeEmbedUrl,
  buildYouTubeWatchUrl,
} from "@/lib/youtube";

interface MediaUploaderProps {
  label: string;
  type: "avatar" | "banner" | "audio";
  value: string | null;
  onChange: (url: string | null) => void;
  accept?: string;
  helperText?: string;
  placeholder?: string;
  onAudioMetadata?: (metadata: { title?: string; artist?: string }) => void;
}

export function MediaUploader({
  label,
  type,
  value,
  onChange,
  accept,
  helperText,
  placeholder = "https://...",
  onAudioMetadata,
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSourceTab, setAudioSourceTab] = useState<"upload" | "youtube">("upload");
  const [youtubeInput, setYoutubeInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const isAudio = type === "audio";
  const defaultAccept = isAudio
    ? "audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/x-m4a,audio/aac,audio/flac"
    : "image/jpeg,image/png,image/webp,image/gif,image/svg+xml";

  const isYouTube = isAudio && isYouTubeUrl(value);
  const youtubeId = isYouTube ? extractYouTubeId(value) : null;
  const isCloudinaryUrl = value?.includes("cloudinary.com");

  async function handleFile(file: File) {
    setError(null);

    // Client-side quick size validation
    const maxSizeBytes = isAudio ? 30 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(
        `File is too large. Max size is ${isAudio ? "30MB" : "10MB"}.`,
      );
      return;
    }

    setUploading(true);
    setProgress(5);

    try {
      const result = await uploadToCloudinary(file, type, (pct) => {
        setProgress(pct);
      });

      onChange(result.url);

      // Auto-extract track metadata from filename if it's audio
      if (isAudio && onAudioMetadata) {
        const rawName = file.name.replace(/\.[^/.]+$/, "");
        if (rawName.includes(" - ")) {
          const [artist, title] = rawName.split(" - ");
          onAudioMetadata({
            artist: artist?.trim(),
            title: title?.trim(),
          });
        } else {
          onAudioMetadata({
            title: rawName.replace(/[_-]+/g, " ").trim(),
          });
        }
      }
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload to Cloudinary. Check your credentials.",
      );
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleApplyYouTube() {
    setError(null);
    const trimmed = youtubeInput.trim();
    if (!trimmed) {
      setError("Please paste a YouTube URL.");
      return;
    }

    const { id, start, end } = extractYouTubeParams(trimmed);
    if (!id) {
      setError("Invalid YouTube URL. Please provide a link like https://www.youtube.com/watch?v=... or https://youtu.be/...");
      return;
    }

    const normalizedUrl = buildYouTubeWatchUrl(id, start, end);
    onChange(normalizedUrl);
    setYoutubeInput("");
  }

  function handleSetSnippet(start?: number, end?: number) {
    if (!youtubeId) return;
    const normalizedUrl = buildYouTubeWatchUrl(youtubeId, start, end);
    onChange(normalizedUrl);
  }

  function onFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function toggleAudioPlayback() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }

  return (
    <div className="media-uploader">
      <div className="media-uploader-header">
        <label className="media-uploader-label">
          <span>{label}</span>
          {helperText && <small>{helperText}</small>}
        </label>
        <div className="media-uploader-header-actions">
          {isAudio && !value && (
            <div className="media-mode-tabs">
              <button
                type="button"
                className={`media-mode-tab ${audioSourceTab === "upload" ? "active" : ""}`}
                onClick={() => setAudioSourceTab("upload")}
              >
                <UploadCloud size={13} />
                Upload file
              </button>
              <button
                type="button"
                className={`media-mode-tab ${audioSourceTab === "youtube" ? "active" : ""}`}
                onClick={() => setAudioSourceTab("youtube")}
              >
                <PlaySquare size={13} />
                YouTube link
              </button>
            </div>
          )}
          <button
            type="button"
            className="button-quiet text-xs"
            onClick={() => setShowManualUrl(!showManualUrl)}
          >
            <Link2 size={13} />
            {showManualUrl ? "Hide URL" : "Edit URL"}
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept || defaultAccept}
        className="hidden"
        style={{ display: "none" }}
        onChange={onFileInputChange}
      />

      {value ? (
        <div className="media-preview-container">
          {type === "avatar" && (
            <div className="media-preview-avatar-row">
              <div className="media-avatar-thumb">
                <img src={value} alt="Avatar" />
              </div>
              <div className="media-preview-info">
                <div className="media-preview-badges">
                  <span className="badge-media">Avatar</span>
                  {isCloudinaryUrl && (
                    <span className="badge-cloudinary">
                      <Cloud size={11} /> Cloudinary
                    </span>
                  )}
                </div>
                <span className="media-url-text" title={value}>
                  {value}
                </span>
              </div>
              <div className="media-preview-actions">
                <button
                  type="button"
                  className="button button-secondary button-small"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload a new avatar"
                >
                  <RefreshCw size={14} className={uploading ? "animate-spin" : ""} />
                  Replace
                </button>
                <button
                  type="button"
                  className="icon-button danger"
                  disabled={uploading}
                  onClick={() => onChange(null)}
                  title="Remove avatar"
                  aria-label="Remove avatar"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )}

          {type === "banner" && (
            <div className="media-preview-banner-col">
              <div className="media-banner-thumb">
                <img src={value} alt="Banner" />
                <div className="media-banner-overlay">
                  <div className="media-preview-badges">
                    <span className="badge-media">Banner</span>
                    {isCloudinaryUrl && (
                      <span className="badge-cloudinary">
                        <Cloud size={11} /> Cloudinary
                      </span>
                    )}
                  </div>
                  <div className="media-preview-actions">
                    <button
                      type="button"
                      className="button button-secondary button-small"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <RefreshCw size={14} className={uploading ? "animate-spin" : ""} />
                      Replace
                    </button>
                    <button
                      type="button"
                      className="icon-button danger"
                      disabled={uploading}
                      onClick={() => onChange(null)}
                      title="Remove banner"
                      aria-label="Remove banner"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
              <span className="media-url-text" title={value}>
                {value}
              </span>
            </div>
          )}

          {type === "audio" && (
            <>
              {isYouTube && youtubeId ? (
                <div className="media-preview-youtube-col">
                  <div className="media-youtube-header-row">
                    <div className="media-preview-badges">
                      <span className="badge-youtube">
                        <PlaySquare size={12} /> YouTube
                      </span>
                      <span className="badge-media">Video ID: {youtubeId}</span>
                    </div>
                    <div className="media-preview-actions">
                      <button
                        type="button"
                        className="button button-secondary button-small"
                        onClick={() => {
                          setAudioSourceTab("youtube");
                          setShowManualUrl(true);
                        }}
                      >
                        <RefreshCw size={14} /> Change
                      </button>
                      <button
                        type="button"
                        className="icon-button danger"
                        onClick={() => onChange(null)}
                        title="Remove YouTube soundtrack"
                        aria-label="Remove YouTube soundtrack"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="media-youtube-preview-frame">
                    <iframe
                      key={value || youtubeId}
                      src={getYouTubeEmbedUrl(value || youtubeId, { autoplay: false })}
                      title="YouTube soundtrack preview"
                      className="media-youtube-iframe"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  {(() => {
                    const ytParams = value ? extractYouTubeParams(value) : { id: youtubeId };
                    return (
                      <div className="media-youtube-snippet-card">
                        <div className="media-youtube-snippet-header">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-white/90">
                            <Clock size={13} className="text-accent" />
                            <span>Playback snippet / short clip</span>
                          </div>
                          {ytParams.start !== undefined || ytParams.end !== undefined ? (
                            <span className="badge-media text-[10px]">
                              {ytParams.start ?? 0}s – {ytParams.end ? `${ytParams.end}s` : "end"}
                              {ytParams.start !== undefined && ytParams.end !== undefined
                                ? ` (${ytParams.end - ytParams.start}s duration)`
                                : ""}
                            </span>
                          ) : (
                            <span className="text-[11px] text-white/40">Full track</span>
                          )}
                        </div>

                        <div className="media-youtube-snippet-inputs">
                          <div className="media-youtube-time-input">
                            <label className="text-[11px] text-white/60">Start (seconds)</label>
                            <input
                              type="number"
                              min={0}
                              className="input input-small"
                              placeholder="0"
                              value={ytParams.start ?? ""}
                              onChange={(e) => {
                                const val =
                                  e.target.value === ""
                                    ? undefined
                                    : Math.max(0, parseInt(e.target.value, 10));
                                handleSetSnippet(
                                  isNaN(val as number) ? undefined : val,
                                  ytParams.end
                                );
                              }}
                            />
                          </div>
                          <div className="media-youtube-time-input">
                            <label className="text-[11px] text-white/60">End (seconds)</label>
                            <input
                              type="number"
                              min={(ytParams.start ?? 0) + 1}
                              className="input input-small"
                              placeholder="optional"
                              value={ytParams.end ?? ""}
                              onChange={(e) => {
                                const val =
                                  e.target.value === ""
                                    ? undefined
                                    : Math.max(0, parseInt(e.target.value, 10));
                                handleSetSnippet(
                                  ytParams.start,
                                  isNaN(val as number) ? undefined : val
                                );
                              }}
                            />
                          </div>
                        </div>

                        <div className="media-youtube-snippet-presets">
                          <span className="text-[11px] text-white/40 self-center">Presets:</span>
                          <button
                            type="button"
                            className="button-preset"
                            onClick={() => handleSetSnippet(20, 30)}
                          >
                            20s – 30s
                          </button>
                          <button
                            type="button"
                            className="button-preset"
                            onClick={() => handleSetSnippet(20, 50)}
                          >
                            20s – 50s (30s)
                          </button>
                          <button
                            type="button"
                            className="button-preset"
                            onClick={() => handleSetSnippet(0, 30)}
                          >
                            0s – 30s
                          </button>
                          {(ytParams.start !== undefined || ytParams.end !== undefined) && (
                            <button
                              type="button"
                              className="button-preset-clear"
                              onClick={() => handleSetSnippet(undefined, undefined)}
                            >
                              Clear clip
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <span className="media-url-text" title={value}>
                    {value}
                  </span>
                </div>
              ) : (
                <div className="media-preview-audio-row">
                  <div className="media-audio-player">
                    <button
                      type="button"
                      className="media-audio-play-btn"
                      onClick={toggleAudioPlayback}
                      aria-label={isPlaying ? "Pause soundtrack" : "Play soundtrack"}
                    >
                      {isPlaying ? (
                        <Pause size={17} fill="currentColor" />
                      ) : (
                        <Play size={17} fill="currentColor" />
                      )}
                    </button>
                    <audio
                      ref={audioRef}
                      src={value}
                      onEnded={() => setIsPlaying(false)}
                      onPause={() => setIsPlaying(false)}
                      onPlay={() => setIsPlaying(true)}
                    />
                    <div className="media-audio-meta">
                      <div className="media-preview-badges">
                        <span className="badge-media">Audio soundtrack</span>
                        {isCloudinaryUrl && (
                          <span className="badge-cloudinary">
                            <Cloud size={11} /> Cloudinary
                          </span>
                        )}
                      </div>
                      <span className="media-url-text" title={value}>
                        {value}
                      </span>
                    </div>
                  </div>
                  <div className="media-preview-actions">
                    <button
                      type="button"
                      className="button button-secondary button-small"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload new audio track"
                    >
                      <RefreshCw size={14} className={uploading ? "animate-spin" : ""} />
                      Replace
                    </button>
                    <button
                      type="button"
                      className="icon-button danger"
                      disabled={uploading}
                      onClick={() => {
                        if (audioRef.current) audioRef.current.pause();
                        setIsPlaying(false);
                        onChange(null);
                      }}
                      title="Remove audio track"
                      aria-label="Remove audio track"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : isAudio && audioSourceTab === "youtube" ? (
        <div className="media-youtube-input-card">
          <div className="media-youtube-input-inner">
            <div className="media-youtube-icon-wrap">
              <PlaySquare size={24} className="text-red-400" />
            </div>
            <div className="media-youtube-input-field">
              <label className="text-xs font-semibold text-white/90">
                Paste YouTube video URL
              </label>
              <div className="media-youtube-input-row">
                <input
                  className="input"
                  type="url"
                  value={youtubeInput}
                  onChange={(e) => setYoutubeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyYouTube();
                    }
                  }}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                />
                <button
                  type="button"
                  className="button button-primary button-small shrink-0"
                  onClick={handleApplyYouTube}
                >
                  <CheckCircle2 size={15} /> Set soundtrack
                </button>
              </div>
              <small className="text-xs text-white/50">
                Supports standard video links, youtu.be short links, and YouTube Music.
              </small>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`media-dropzone ${isDragging ? "dragging" : ""} ${uploading ? "uploading" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !uploading) {
              fileInputRef.current?.click();
            }
          }}
        >
          {uploading ? (
            <div className="media-uploading-state">
              <Loader2 size={24} className="animate-spin text-accent" />
              <div className="media-uploading-text">
                <strong>Uploading to Cloudinary...</strong>
                <span>{progress}% completed</span>
              </div>
              <div className="media-progress-bar">
                <div
                  className="media-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="media-dropzone-content">
              <div className="media-dropzone-icon">
                {isAudio ? <Music2 size={24} /> : <ImageIcon size={24} />}
                <span className="media-dropzone-badge">
                  <UploadCloud size={13} />
                </span>
              </div>
              <div className="media-dropzone-text">
                <p>
                  <strong>Click to upload</strong> or drag and drop
                </p>
                <span className="media-dropzone-sub">
                  {isAudio
                    ? "MP3, WAV, OGG, M4A, FLAC up to 30MB"
                    : "PNG, JPG, WEBP, GIF up to 10MB"}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {uploading && value && (
        <div className="media-progress-bar active">
          <div
            className="media-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && (
        <div className="media-uploader-error" role="alert">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {showManualUrl && (
        <div className="media-manual-url">
          <input
            className="input"
            type="url"
            value={value || ""}
            onChange={(e) => {
              const val = e.target.value.trim();
              if (!val) {
                onChange(null);
                return;
              }
              const ytId = extractYouTubeId(val);
              if (ytId) {
                onChange(`https://www.youtube.com/watch?v=${ytId}`);
              } else {
                onChange(val);
              }
            }}
            placeholder={placeholder}
          />
          <small className="media-manual-hint">
            Direct HTTPS URL or YouTube link stored in database.
          </small>
        </div>
      )}
    </div>
  );
}
