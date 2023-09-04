"use client";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const voiceRef = useRef(null);
  const textRef = useRef(null);

  const [audio, setAudio] = useState("");
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState([]);
  const [url, setUrl] = useState("");

  useEffect(() => {
    async function getVoices() {
      try {
        const response = await fetch("https://api.elevenlabs.io/v1/voices");

        if (!response.ok) {
          throw new Error("some error occured");
        }

        const data = await response.json();

        setVoices(data.voices);
      } catch (error) {
        console.error(error);
      }
    }
    getVoices();
  }, []);

  async function handleGenerateTTS() {
    setLoading(true);
    if (textRef.current && voiceRef.current) {
      const text = textRef.current.value;
      const voice = voiceRef.current.value;

      try {
        if (!text || text.trim() === "") {
          alert("Please enter a text");
          return;
        }

        const response = await fetch("/api/elevenlabs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: text,
            voice: voice
          })
        });

        if (!response.ok) {
          throw new Error("Error");
        }

        const { file } = await response.json();
        setAudio(file);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <main className="bg-white py-4 px-4">
      <h3 className="text-2xl text-blue-800 uppercase mb-6">say something</h3>
      <div className="my-6 flex flex-col gap-4">
        <div className="flex gap-4 items-center">
          <label>select your voice</label>
          <select className="py-2 bg-blue-100 px-4 rounded-lg" ref={voiceRef}>
            {voices.map((voice) => (
              <option key={voice.voice_id} value={voice.voice_id}>
                {voice.name}
              </option>
            ))}
          </select>
        </div>
        <textarea
          className="p-4 border-blue-100 rounded-lg border-dashed border-[2px] placeholder-gray-400 focus-within:drop-shadow-md focus:outline-none"
          placeholder=""
          cols={50}
          rows={10}
          ref={textRef}
        />
        <button
          className="py-2 px-4 bg-blue-800 rounded-lg hover:opacity-80 text-white"
          onClick={handleGenerateTTS}
          disabled={loading}
        >
          {loading ? "Generating" : "Generate"}
        </button>
        {true && <audio src={`${audio}`} controls autoPlay />}
      </div>
    </main>
  );
}
