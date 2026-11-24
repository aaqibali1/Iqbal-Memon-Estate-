import { useRef, useState } from 'react';
import {
  AlertCircle,
  Download,
  Film,
  ImagePlus,
  Loader2,
  Play,
  RectangleHorizontal,
  RectangleVertical,
} from 'lucide-react';
import { PROPERTIES } from '../data/properties';

const MOTION_PRESETS = [
  'Smooth cinematic golden-hour architectural drone reveal gliding toward the facade as warm interior lights glow and palm fronds sway gently.',
  'Slow executive walk-in through the marble courtyard with gentle sunlight shifting across limestone walls and reflections rippling in the pool.',
  'Vertical social reel panning smoothly upward across the double-height glass facade under a serene coastal twilight sky.',
];

async function urlToBase64(imageUrl: string): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const mimeType = blob.type || 'image/jpeg';
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = String(reader.result || '');
      const base64 = dataUrl.split(',')[1] || '';
      resolve({ base64, mimeType });
    };
    reader.onerror = () => reject(new Error('Could not read sample photo.'));
    reader.readAsDataURL(blob);
  });
}

export function VideoStudioSection() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(PROPERTIES[0].imageUrl);
  const [uploadedFileName, setUploadedFileName] = useState<string>(
    'Featured Sample: DHA Phase 8 Designer Bungalow',
  );
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [uploadedMime, setUploadedMime] = useState<string>('image/jpeg');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [prompt, setPrompt] = useState<string>(MOTION_PRESETS[0]);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a JPG, PNG, or WebP property photograph.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Please select an image smaller than 10 MB.');
      return;
    }
    setError(null);
    setVideoUrl(null);
    setUploadedFileName(file.name);
    setUploadedMime(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      setPreviewUrl(dataUrl);
      setUploadedBase64(dataUrl.split(',')[1] || null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (imageUrl: string, title: string) => {
    setPreviewUrl(imageUrl);
    setUploadedBase64(null);
    setUploadedFileName(`Listing Photo: ${title}`);
    setError(null);
    setVideoUrl(null);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setGenerating(true);

    try {
      let base64 = uploadedBase64;
      let mimeType = uploadedMime;

      if (!base64) {
        const converted = await urlToBase64(previewUrl);
        base64 = converted.base64;
        mimeType = converted.mimeType;
      }

      const res = await fetch('/api/video/animate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          prompt,
          aspectRatio,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Unable to generate property video right now.');
      }
      setVideoUrl(data.videoDataUrl || data.videoUri || null);
    } catch (err: any) {
      setError(
        err?.message ||
          'Video generation failed. Note that gemini-omni-1.2-flash requires a billing-enabled Gemini API key in Settings > Secrets.',
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section id="video-studio" className="py-16 lg:py-24 bg-[#F8FAFC] border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl pb-8 border-b border-[#E2E8F0]">
          <p className="text-sm font-medium text-[#9A7835]">
            Cinematic Walkthrough Studio
          </p>
          <h2 className="mt-1 font-display text-3xl sm:text-4xl font-semibold text-[#0F172A] text-balance">
            Animate Property Photos into Video Tours
          </h2>
          <p className="mt-2 text-sm text-[#475569]">
            Upload any bungalow, interior, or commercial plot photograph—or start from one of our
            DHA Karachi listings—and generate a smooth 16:9 presentation tour or 9:16 social reel.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form Controls (6 cols) */}
          <form
            onSubmit={handleGenerate}
            className="lg:col-span-6 bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-5"
          >
            {/* Upload Dropzone */}
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-2">
                1. Property Photograph (Starting Frame)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="sr-only"
                id="property-photo-upload"
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#0F172A] bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#CBD5E1] rounded-lg transition-colors cursor-pointer"
                >
                  <ImagePlus className="w-4 h-4 text-[#9A7835]" aria-hidden="true" />
                  <span>Upload Your Photo</span>
                </button>
                <span className="text-xs text-[#475569] truncate max-w-[260px]">
                  {uploadedFileName}
                </span>
              </div>

              {/* Sample DHA Listing Picker */}
              <div className="mt-3">
                <p className="text-[11px] text-[#475569] mb-2">
                  Or select a curated DHA listing photo:
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {PROPERTIES.slice(0, 4).map((item) => {
                    const selected = !uploadedBase64 && previewUrl === item.imageUrl;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSample(item.imageUrl, item.title)}
                        aria-label={`Use ${item.title} photo`}
                        className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-colors cursor-pointer ${
                          selected ? 'border-[#C5A059]' : 'border-transparent hover:border-[#CBD5E1]'
                        }`}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <span className="block text-xs font-semibold text-[#475569] mb-2">
                2. Output Aspect Ratio
              </span>
              <div role="group" aria-label="Video aspect ratio" className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAspectRatio('16:9')}
                  aria-pressed={aspectRatio === '16:9'}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-semibold rounded-lg border transition-colors cursor-pointer ${
                    aspectRatio === '16:9'
                      ? 'bg-[#0F172A] text-white border-[#0F172A]'
                      : 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:border-[#0F172A]'
                  }`}
                >
                  <RectangleHorizontal className="w-4 h-4" aria-hidden="true" />
                  <span>16:9 Landscape</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('9:16')}
                  aria-pressed={aspectRatio === '9:16'}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-semibold rounded-lg border transition-colors cursor-pointer ${
                    aspectRatio === '9:16'
                      ? 'bg-[#0F172A] text-white border-[#0F172A]'
                      : 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:border-[#0F172A]'
                  }`}
                >
                  <RectangleVertical className="w-4 h-4" aria-hidden="true" />
                  <span>9:16 Portrait Reel</span>
                </button>
              </div>
            </div>

            {/* Camera Motion Prompt */}
            <div>
              <label
                htmlFor="video-motion-prompt"
                className="block text-xs font-semibold text-[#475569] mb-1.5"
              >
                3. Camera Movement &amp; Mood
              </label>
              <textarea
                id="video-motion-prompt"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {['Golden-Hour Drone', 'Courtyard Walk-In', 'Twilight Reel'].map((label, idx) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setPrompt(MOTION_PRESETS[idx])}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] hover:border-[#C5A059] hover:text-[#0F172A] cursor-pointer"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-3 px-5 inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#0F172A] bg-[#C5A059] hover:bg-[#B08D46] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Animating Property Video (may take 1–2 min)...</span>
                </>
              ) : (
                <>
                  <Film className="w-4 h-4" aria-hidden="true" />
                  <span>Generate {aspectRatio} Property Video</span>
                </>
              )}
            </button>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </form>

          {/* Right Output / Frame Preview (6 cols) */}
          <div className="lg:col-span-6 bg-[#0F172A] rounded-xl border border-[#1E293B] p-6 text-white flex flex-col justify-between min-h-[420px]">
            <div className="flex items-center justify-between text-xs text-slate-300 pb-4 border-b border-white/10">
              <span>{videoUrl ? 'Generated Property Tour Video' : 'Starting Frame Preview'}</span>
              <span className="tabular-nums text-[#E2C68B]">{aspectRatio} Format</span>
            </div>

            <div className="my-5 flex-1 flex items-center justify-center">
              {videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className={`rounded-lg bg-black shadow-xl ${
                    aspectRatio === '9:16' ? 'max-h-[420px] aspect-[9/16]' : 'w-full aspect-video'
                  }`}
                />
              ) : (
                <div
                  className={`relative rounded-lg overflow-hidden border border-white/10 bg-black/40 ${
                    aspectRatio === '9:16'
                      ? 'h-[340px] aspect-[9/16]'
                      : 'w-full aspect-video'
                  }`}
                >
                  <img
                    src={previewUrl}
                    alt="Selected property frame ready to animate"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-[#0F172A]/35 flex flex-col items-center justify-center text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-[#C5A059] text-[#0F172A] flex items-center justify-center shadow-lg">
                      {generating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                      )}
                    </div>
                    <p className="mt-3 text-xs font-medium text-white max-w-xs">
                      {generating
                        ? 'Rendering cinematic motion with Gemini Omni Flash...'
                        : 'Click Generate to animate this frame into a shareable property tour.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
              <span>Powered by Gemini Interactions API (gemini-omni-1.2-flash)</span>
              {videoUrl && (
                <a
                  href={videoUrl}
                  download={`iqbal-memon-estate-tour-${aspectRatio.replace(':', 'x')}.mp4`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold text-[#0F172A] bg-[#C5A059] hover:bg-[#B08D46] rounded-md transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download MP4</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
