'use client';
import { useState } from 'react';

export default function ImportPage() {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState('');
  const [token, setToken] = useState(''); // optional

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setText(await f.text());
  }

  async function runImport() {
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-admin-token': token } : {}),
        },
        body: text,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Import failed');
      setResult(`Imported ${data.imported} beliefs ✔`);
    } catch (e: any) {
      setResult(`Error: ${e.message || e}`);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4 space-y-4">
      <h2 className="text-xl font-semibold">Import beliefs from JSON</h2>

      <div className="flex items-center gap-2">
        <input type="file" accept="application/json" onChange={handleFile} />
        {fileName && <span className="text-xs text-slate-500">Selected: {fileName}</span>}
      </div>

      <textarea
        className="w-full h-64 rounded border p-2 font-mono text-sm"
        placeholder='Paste a JSON array (or {"items":[...]}) with fields like text, topic[], title, author, etc.'
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex items-center gap-2">
        <input
          className="rounded border px-2 py-1"
          placeholder="Admin token (optional)"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button className="rounded border px-3 py-2" onClick={() => setText('')}>Clear</button>
        <button className="rounded bg-indigo-600 px-3 py-2 text-white" onClick={runImport}>Import</button>
      </div>

      {result && <div className="text-sm">{result}</div>}
    </div>
  );
}
