import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { getStories, saveComic } from "./stories.js";

const EMOTIONS = [
  { name: "Happy", icon: "😄", color: "bg-sun" },
  { name: "Sad", icon: "😢", color: "bg-sky" },
  { name: "Angry", icon: "😠", color: "bg-pop" },
  { name: "Scared", icon: "😱", color: "bg-mint" },
  { name: "Surprised", icon: "😲", color: "bg-orange-300" },
];

export default function App() {
  const [idea, setIdea] = useState("");
  const [emotion, setEmotion] = useState("Happy");
  const [stories, setStories] = useState([]);
  const [comic, setComic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [link, setLink] = useState("");
  const sheet = useRef(null);

  const generate = async () => {
    setLoading(true); setError(""); setStories([]); setComic(null);
    try { setStories(await getStories(emotion, idea, link)); }
    catch (e) { setError(e.message); }
    setLoading(false);
  };

  const pick = (s) => { setComic({ ...s, idea, emotion }); setSaved(false); };

  const editLine = (p, d, text) =>
    setComic((c) => ({ ...c, panels: c.panels.map((pan, i) => i !== p ? pan : {
      ...pan, dialogue: pan.dialogue.map((line, j) => (j === d ? { ...line, text } : line)) }) }));

  const save = () => {
    try { saveComic(comic); setSaved(true); } catch (e) { setError(e.message); }
  };

  const downloadPng = async () => {
    const url = await toPng(sheet.current, { pixelRatio: 2 });
    Object.assign(document.createElement("a"), { href: url, download: `${comic.title}.png` }).click();
  };

  const downloadPdf = async () => {
    const url = await toPng(sheet.current, { pixelRatio: 2 });
    const el = sheet.current;
    const pdf = new jsPDF({ orientation: el.offsetWidth > el.offsetHeight ? "l" : "p", unit: "px", format: [el.offsetWidth, el.offsetHeight] });
    pdf.addImage(url, "PNG", 0, 0, el.offsetWidth, el.offsetHeight);
    pdf.save(`${comic.title}.pdf`);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-6xl tracking-wide text-pop [text-shadow:3px_3px_0_#1B1B2F]">ComicCraft AI</h1>
      <p className="mt-1 font-bold">Pick a mood, get matching comic stories. No server needed.</p>

      <section className="mt-6 border-4 border-ink bg-white p-5 shadow-comic">
        <textarea value={idea} onChange={(e) => setIdea(e.target.value)} rows={3}
          placeholder="Optional idea keywords, e.g. robot, dragon, garden…"
          className="w-full border-4 border-ink p-3 text-lg focus:outline-none focus:ring-4 focus:ring-sky" />
        <input value={link} onChange={(e) => setLink(e.target.value)} type="url"
          placeholder="Optional: paste a link to a story JSON (open source)"
          className="mt-3 w-full border-4 border-ink p-2 text-sm focus:outline-none focus:ring-4 focus:ring-sky" />
        <div className="mt-4 flex flex-wrap gap-3">
          {EMOTIONS.map((e) => (
            <button key={e.name} onClick={() => setEmotion(e.name)} aria-pressed={emotion === e.name}
              className={`border-4 border-ink px-4 py-2 font-bold ${e.color} ${emotion === e.name ? "shadow-comic -translate-y-1" : "opacity-60"}`}>
              {e.icon} {e.name}
            </button>
          ))}
        </div>
        <button className="btn mt-5" disabled={loading} onClick={generate}>
          {loading ? "Loading stories…" : "Get stories for this mood"}
        </button>
        {error && <p role="alert" className="mt-3 font-bold text-pop">{error}</p>}
      </section>

      {stories.length > 0 && !comic && (
        <section className="mt-8 grid gap-5 sm:grid-cols-2">
          {stories.map((s, i) => (
            <article key={i} className="border-4 border-ink bg-white p-4 shadow-comic">
              <h2 className="font-display text-3xl">{s.title}</h2>
              <p className="mt-2">{s.summary}</p>
              <p className="mt-2 text-sm font-bold">{s.panels?.length} panels · {s.characters?.map((c) => c.name).join(", ")}</p>
              <button className="btn mt-3" onClick={() => pick(s)}>Make this comic</button>
            </article>
          ))}
        </section>
      )}

      {comic && (
        <section className="mt-8">
          <div className="flex flex-wrap gap-3">
            <button className="btn" onClick={() => setComic(null)}>Back to stories</button>
            <button className="btn bg-mint" onClick={save}>{saved ? "Saved ✓" : "Save comic"}</button>
            <button className="btn bg-sky" onClick={downloadPng}>Download PNG</button>
            <button className="btn bg-pop" onClick={downloadPdf}>Download PDF</button>
          </div>
          <div ref={sheet} className="mt-5 bg-white p-5">
            <h2 className="mb-4 font-display text-5xl">{comic.title}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {comic.panels.map((p, i) => (
                <figure key={i} className="border-4 border-ink">
                  <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-sun to-pop p-4 text-center text-sm font-bold">
                    {p.image ? <img src={p.image} alt={p.scene} className="h-full w-full object-cover" /> : p.scene}
                  </div>
                  <figcaption className="space-y-2 bg-white p-3">
                    {p.dialogue.map((d, j) => (
                      <label key={j} className="block text-sm font-bold">
                        {d.speaker}
                        <input value={d.text} onChange={(e) => editLine(i, j, e.target.value)}
                          className="mt-1 w-full rounded-full border-2 border-ink px-3 py-1 font-normal" />
                      </label>
                    ))}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
