import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { s } from "../utils.js";

export default function AdvancedSearchPage() {
  const navigate = useNavigate();
  const [f, setF] = useState({ title: "", author: "", min: "", max: "" });
  const set = (key) => (e) => setF((prev) => ({ ...prev, [key]: e.target.value }));

  function submit(e) {
    e.preventDefault();
    navigate(`/search?${new URLSearchParams({ mode: "advanced", ...f })}`);
  }

  return (
    <section className="page-view active">
      <form className="advanced-search-card" onSubmit={submit}>
        <h2 style={s("font-family: 'Playfair Display'; margin-top: 0")}>Advanced Search</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Title Keywords</label>
            <input type="text" placeholder="Exact or partial story title…" value={f.title} onChange={set("title")} />
          </div>
          <div className="form-group">
            <label>Author Name</label>
            <input type="text" placeholder="Author username…" value={f.author} onChange={set("author")} />
          </div>
          <div className="form-group">
            <label>Minimum Word Count</label>
            <input type="number" placeholder="e.g. 5000" value={f.min} onChange={set("min")} />
          </div>
          <div className="form-group">
            <label>Maximum Word Count</label>
            <input type="number" placeholder="e.g. 100000" value={f.max} onChange={set("max")} />
          </div>
        </div>
        <button type="submit" className="btn-primary" style={s("margin-top: 24px")}>Apply Advanced Filters</button>
      </form>
    </section>
  );
}
