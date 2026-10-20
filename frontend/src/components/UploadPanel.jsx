import { FileUp, LoaderCircle, Sparkles } from "lucide-react";
import { useRef, useState } from "react";

export function UploadPanel({ loading, onTrain }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);

  function selectFile(selectedFile) {
    if (selectedFile?.name.toLowerCase().endsWith(".csv")) setFile(selectedFile);
  }

  function submit(event) {
    event.preventDefault();
    if (file) onTrain(file);
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <div className="mb-6 flex items-start gap-4">
        <div className="rounded-2xl bg-ocean/10 p-3 text-ocean"><Sparkles size={22} /></div>
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">Entrena tu modelo</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Carga observaciones meteorológicas para descubrir patrones de lluvia.</p>
        </div>
      </div>

      <button
        type="button"
        className={`flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-12 text-center transition ${dragging ? "border-ocean bg-ocean/10" : "border-slate-300 bg-mist hover:border-ocean hover:bg-ocean/5"}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files[0]); }}
      >
        <FileUp className="text-ocean" size={34} />
        <span className="mt-4 font-semibold text-ink">{file ? file.name : "Arrastra tu CSV o selecciónalo"}</span>
        <span className="mt-1 text-sm text-slate-500">Solo archivos .csv</span>
        <input ref={inputRef} className="hidden" type="file" accept=".csv,text/csv" onChange={(event) => selectFile(event.target.files[0])} />
      </button>

      <button type="submit" disabled={!file || loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3.5 font-semibold text-white transition hover:bg-ocean disabled:cursor-not-allowed disabled:opacity-40">
        {loading && <LoaderCircle size={18} className="animate-spin" />}
        {loading ? "Entrenando modelo..." : "Entrenar y ver resultados"}
      </button>
    </form>
  );
}