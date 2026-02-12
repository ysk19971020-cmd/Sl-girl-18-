import { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LiveSelfieCaptureProps {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}

export default function LiveSelfieCapture({ onCapture, onClose }: LiveSelfieCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setError('');
    } catch (err: any) {
      setError('කැමරා access කරන්න බැහැ. කරුණාකර camera permission allow කරන්න.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // SECURITY: Check if video is actually playing (not a static image)
    if (video.readyState < 2) {
      setError('⚠️ කැමරාව සම්පූර්ණයෙන් load වෙලා නැහැ. කරුණාකර නැවත try කරන්න.');
      return;
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // SECURITY: Add timestamp watermark to verify live capture
      const timestamp = new Date().toISOString();
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Add invisible metadata for admin verification
      ctx.font = '12px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; // Nearly invisible
      ctx.fillText(`Captured: ${timestamp}`, 10, canvas.height - 10);
      
      // QUALITY CHECK: Verify image brightness (detect if too dark)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let totalBrightness = 0;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        totalBrightness += (r + g + b) / 3;
      }
      
      const avgBrightness = totalBrightness / (data.length / 4);
      
      // If image is too dark, warn user
      if (avgBrightness < 30) {
        setError('🌑 Photo ඉතාම අඳුරුයි! හොඳ ආලෝකයක් ඇති තැනකට ගොස් නැවත try කරන්න.');
        return;
      }
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          // SECURITY: Check blob size (minimum quality)
          if (blob.size < 10000) { // Less than 10KB = suspiciously small
            setError('⚠️ Photo quality ඉතාම අඩුයි. Clear selfie එකක් capture කරන්න.');
            return;
          }
          
          setCapturedBlob(blob);
          setCaptured(true);
          stopCamera();
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const retake = () => {
    setCaptured(false);
    setCapturedBlob(null);
    startCamera();
  };

  const confirmCapture = () => {
    if (capturedBlob) {
      onCapture(capturedBlob);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-accent p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="text-white" size={24} />
            <h2 className="text-xl font-bold text-white">Live Selfie Verification</h2>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1">
            <X size={24} />
          </button>
        </div>

        {/* Camera/Preview Area */}
        <div className="p-6">
          {error ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
              <p className="text-destructive font-semibold mb-4">{error}</p>
              <Button onClick={startCamera} variant="outline">
                <RefreshCw size={16} className="mr-2" />
                Try Again
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Instructions */}
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                  <Camera size={18} className="text-red-600" />
                  🔴 LIVE SELFIE - MANDATORY SECURITY CHECK
                </h3>
                <ul className="text-sm text-red-900 space-y-1.5 list-disc list-inside">
                  <li className="font-semibold">ඔබේ මුහුණ කැමරාවට පැහැදිලිව පෙනෙන ලෙස තබන්න</li>
                  <li className="font-semibold">හොඳ ආලෝකයක් තිබීම අනිවාර්යයි (අඳුරු photos reject කරනු ලැබේ)</li>
                  <li>Face එක circle එක ඇතුළේ තබන්න</li>
                  <li>"Capture Photo" click කරන්න</li>
                  <li className="font-semibold text-red-700">⚠️ Admin විසින් manual verification කරනු ලැබේ</li>
                  <li className="text-xs text-red-600 mt-1">🚨 Fake/unclear photos reject - Account එක activate නොවේ</li>
                </ul>
              </div>

              {/* Video/Canvas Area */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${captured ? 'hidden' : 'block'}`}
                />
                <canvas
                  ref={canvasRef}
                  className={`w-full h-full object-cover ${captured ? 'block' : 'hidden'}`}
                />
                
                {/* Overlay Guide */}
                {!captured && stream && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-4 border-primary/50 rounded-full w-64 h-64"></div>
                  </div>
                )}

                {/* Captured Badge */}
                {captured && (
                  <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full flex items-center gap-2">
                    <Check size={16} />
                    <span className="text-sm font-semibold">Captured</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!captured ? (
                  <>
                    <Button onClick={onClose} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                    <Button 
                      onClick={capturePhoto} 
                      className="flex-1"
                      disabled={!stream}
                    >
                      <Camera size={18} className="mr-2" />
                      Capture Photo
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={retake} variant="outline" className="flex-1">
                      <RefreshCw size={18} className="mr-2" />
                      Retake
                    </Button>
                    <Button onClick={confirmCapture} className="flex-1">
                      <Check size={18} className="mr-2" />
                      Use This Photo
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
