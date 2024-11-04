// app/components/MidiStudio.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";

export function MidiStudio() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedScale, setSelectedScale] = useState("major");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [variations, setVariations] = useState<any[]>([]);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const SCALES = {
    major: { name: "Major", pattern: [0, 2, 4, 5, 7, 9, 11] },
    minor: { name: "Minor", pattern: [0, 2, 3, 5, 7, 8, 10] },
    harmonicMinor: { name: "Harmonic Minor", pattern: [0, 2, 3, 5, 7, 8, 11] },
    pentatonic: { name: "Pentatonic", pattern: [0, 2, 4, 7, 9] },
    blues: { name: "Blues", pattern: [0, 3, 5, 6, 7, 10] },
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        setAudioContext(new AudioContext());
      }
    }
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFile(file);

    try {
      const url = URL.createObjectURL(file);
      setPreview(url);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        drawPianoRoll(new Uint8Array(arrayBuffer));
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error processing file:", error);
    }
  };

  const drawPianoRoll = (midiData: Uint8Array) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;

    // Vertical lines (time divisions)
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }

    // Horizontal lines (pitch divisions)
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }
  };

  const generateVariations = () => {
    if (!file) return;

    const newVariations = Array(10)
      .fill(null)
      .map((_, index) => ({
        id: index + 1,
        name: `Variation ${index + 1}`,
        scale: selectedScale,
        preview: preview,
      }));

    setVariations(newVariations);
  };

  const togglePlayback = async (variation: any) => {
    if (!audioContext) return;

    setIsPlaying(!isPlaying);

    if (!isPlaying && variation.preview) {
      try {
        const response = await fetch(variation.preview);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;

        const gainNode = audioContext.createGain();
        gainNode.gain.value = volume / 100;

        source.connect(gainNode);
        gainNode.connect(audioContext.destination);

        source.start(0);
        source.onended = () => setIsPlaying(false);
      } catch (error) {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">Genesis MIDI Studio</h1>

        {/* File Upload */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload MIDI File
            </label>
            <input
              type="file"
              accept=".mid,.midi,.mp3,.wav"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          {file && (
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm">Selected file: {file.name}</p>
              {preview && (
                <audio controls className="mt-2 w-full" src={preview} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>

          <div className="space-y-4">
            {/* Scale Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Scale</label>
              <select
                value={selectedScale}
                onChange={(e) => setSelectedScale(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {Object.entries(SCALES).map(([key, scale]) => (
                  <option key={key} value={key}>
                    {scale.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateVariations}
              disabled={!file}
              className={`w-full p-2 rounded-md text-white font-medium
                ${
                  file
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
            >
              Generate Variations
            </button>
          </div>
        </div>

        {/* Piano Roll */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Piano Roll</h2>
          <canvas
            ref={canvasRef}
            width={600}
            height={300}
            className="w-full border rounded-md bg-gray-900"
          />

          {/* Volume Control */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm">Volume:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm">{volume}%</span>
          </div>
        </div>
      </div>

      {/* Variations List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Variations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {variations.map((variation) => (
            <div
              key={variation.id}
              className="flex items-center justify-between p-4 border rounded-md"
            >
              <div>
                <h3 className="font-medium">{variation.name}</h3>
                <p className="text-sm text-gray-500">
                  Scale: {SCALES[variation.scale as keyof typeof SCALES].name}
                </p>
                {variation.preview && (
                  <audio
                    controls
                    className="mt-2 w-full"
                    src={variation.preview}
                  />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => togglePlayback(variation)}
                  className="p-2 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  {isPlaying ? "Stop" : "Play"}
                </button>
                <button className="p-2 rounded-md bg-green-50 text-green-700 hover:bg-green-100">
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
