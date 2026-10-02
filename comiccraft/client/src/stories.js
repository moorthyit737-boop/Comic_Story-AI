// Static story loader: no backend. Reads open-source/public story JSON from /stories.json
// plus an optional link the user pastes. Expected format: array (or {stories:[...]}) of
// { emotion, title, summary, characters:[{name,role}], panels:[{scene, dialogue:[{speaker,text}]}] }
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${url} (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.stories || [];
}

const valid = (s) => s?.title && Array.isArray(s.panels) && s.panels.every((p) => Array.isArray(p.dialogue));

export async function getStories(emotion, idea = "", link = "") {
  const lists = [fetchJson("/stories.json")];
  if (link.trim()) lists.push(fetchJson(link.trim()));
  const all = (await Promise.all(lists)).flat().filter(valid);
  const matches = all.filter((s) => s.emotion?.toLowerCase() === emotion.toLowerCase());
  if (!matches.length) throw new Error(`No ${emotion} stories found in the source.`);
  const words = idea.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
  const score = (s) => {
    const text = JSON.stringify(s).toLowerCase();
    return words.filter((w) => text.includes(w)).length + Math.random() * 0.5;
  };
  return matches.sort((a, b) => score(b) - score(a)).slice(0, 5)
    .map((s) => ({ ...s, characters: s.characters || [] }));
}

const KEY = "comiccraft.comics";
export const saveComic = (comic) => {
  const list = JSON.parse(localStorage.getItem(KEY) || "[]");
  localStorage.setItem(KEY, JSON.stringify([{ ...comic, savedAt: Date.now() }, ...list]));
};
