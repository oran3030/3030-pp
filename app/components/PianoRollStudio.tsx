// app/components/PianoRollStudio.tsx
import React, { useState, useRef, useEffect } from "react";
import { Card } from "../components/ui/card"; // עדכון הנתיב
import { Slider } from "../components/ui/slider"; // עדכון הנתיב
import {
  PlayCircle,
  PauseCircle,
  Volume2,
  Music,
  Download,
  RefreshCw,
} from "lucide-react";

const PianoRollStudio = () => {
  const [tempo, setTempo] = useState(120);
  const [audioVolume, setAudioVolume] = useState(75);
  const [midiVolume, setMidiVolume] = useState(75);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHarmonic, setIsHarmonic] = useState(true);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const pianoRollCanvasRef = useRef<HTMLCanvasElement>(null);

  // Piano roll dimensions
  const WHITE_KEY_WIDTH = 30;
  const NOTE_HEIGHT = 20;
  const TOTAL_OCTAVES = 8;
  const GRID_COLOR = "#2a2a2a";

  useEffect(() => {
    drawEmptyPianoRoll();
    drawWaveform();
  }, []);

  const drawEmptyPianoRoll = () => {
    const canvas = pianoRollCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw piano keys
    for (let i = 0; i < TOTAL_OCTAVES * 12; i++) {
      const y = i * NOTE_HEIGHT;
      const isBlackKey = [1, 3, 6, 8, 10].includes(i % 12);

      ctx.fillStyle = isBlackKey ? "#333" : "#555";
      ctx.fillRect(0, y, WHITE_KEY_WIDTH, NOTE_HEIGHT - 1);
    }

    // Draw grid
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;

    // Vertical lines (time divisions)
    for (let x = WHITE_KEY_WIDTH; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Horizontal lines (pitch divisions)
    for (let y = 0; y < canvas.height; y += NOTE_HEIGHT) {
      ctx.beginPath();
      ctx.moveTo(WHITE_KEY_WIDTH, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw some example notes
    drawExampleNotes(ctx);
  };

  const drawExampleNotes = (ctx: CanvasRenderingContext2D) => {
    // Example MIDI notes
    const notes = [
      { pitch: 60, start: 100, duration: 100 },
      { pitch: 64, start: 200, duration: 50 },
      { pitch: 67, start: 300, duration: 75 },
      { pitch: 72, start: 400, duration: 100 },
    ];

    ctx.fillStyle = "#3b82f6";
    notes.forEach((note) => {
      const x = WHITE_KEY_WIDTH + note.start;
      const y = (127 - note.pitch) * NOTE_HEIGHT;
      ctx.fillRect(x, y, note.duration, NOTE_HEIGHT - 2);
    });
  };

  const drawWaveform = () => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw example waveform
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);

    // Generate random waveform
    for (let x = 0; x < canvas.width; x++) {
      const y =
        canvas.height / 2 + Math.sin(x * 0.05) * 20 + Math.random() * 10;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <Card className="bg-gray-800 border-gray-700">
        <div className="p-6 space-y-6">
          {/* Waveform Display */}
          <div className="h-24 bg-gray-900 rounded-lg overflow-hidden">
            <canvas
              ref={waveformCanvasRef}
              width={800}
              height={96}
              className="w-full h-full"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Volume2 className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-gray-400">Audio</span>
              <Slider
                value={[audioVolume]}
                max={100}
                step={1}
                className="w-24"
                onValueChange={([value]) => setAudioVolume(value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Music className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-gray-400">MIDI</span>
              <Slider
                value={[midiVolume]}
                max={100}
                step={1}
                className="w-24"
                onValueChange={([value]) => setMidiVolume(value)}
              />
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-full hover:bg-gray-700"
            >
              {isPlaying ? (
                <PauseCircle className="h-8 w-8 text-blue-400" />
              ) : (
                <PlayCircle className="h-8 w-8 text-blue-400" />
              )}
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">{tempo}</span>
              <span className="text-sm text-gray-400">bpm</span>
            </div>
          </div>

          {/* Piano Roll */}
          <div className="h-96 bg-gray-900 rounded-lg overflow-hidden relative">
            <canvas
              ref={pianoRollCanvasRef}
              width={800}
              height={TOTAL_OCTAVES * 12 * NOTE_HEIGHT}
              className="w-full h-full"
            />
          </div>

          {/* Bottom Controls */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isHarmonic}
                  onChange={(e) => setIsHarmonic(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-500"
                />
                <span className="text-sm text-gray-400">Harmonic</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!isHarmonic}
                  onChange={(e) => setIsHarmonic(!e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-500"
                />
                <span className="text-sm text-gray-400">Percussive</span>
              </label>
            </div>

            <div className="flex space-x-4">
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span>Convert Again</span>
              </button>
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Download MIDI</span>
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PianoRollStudio;
