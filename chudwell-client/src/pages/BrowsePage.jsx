import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { s } from "../utils.js";

const STATUSES = [["all", "All"], ["ongoing", "Ongoing"], ["completed", "Completed"], ["dropped", "Dropped"]];
const SORTS = [["likes", "Likes"], ["latest update", "Latest Update"], ["word count", "Word Count"]];
const ORDERS = [["ascending", "Ascending"], ["descending", "Descending"]];
const TAGS = [["fiction", "Fiction"], ["adventure", "Adventure"], ["drama", "Drama"], ["science fiction", "Science Fiction"], ["romance", "Romance"], ["mystery", "Mystery"], ["literary", "Literary"]];

function RadioGroup({ title, name, options, value, onChange }) {
  return (
    <div className="browse-section-block">
      <h3>{title}</h3>
      <div className="browse-box-border radio-group-horizontal">
        {options.map(([val, label]) => (
          <label key={val} className="radio-label">
            <input type="radio" name={name} value={val} checked={value === val} onChange={() => onChange(val)} /> {label}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function BrowsePage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("likes");
  const [order, setOrder] = useState("descending");
  const [tags, setTags] = useState([]);

  const toggleTag = (t) => setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  function search() {
    const params = new URLSearchParams({ mode: "browse", keyword: keyword.trim(), status, sort, order, tags: tags.join(",") });
    navigate(`/search?${params}`);
  }

  return (
    <section className="page-view active">
      <div className="browse-container">
        <div className="browse-search-box">
          <input type="text" placeholder="search" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          <span style={s("font-size: 18px")}>🔍︎</span>
        </div>

        <RadioGroup title="Status:" name="browse-status" options={STATUSES} value={status} onChange={setStatus} />
        <RadioGroup title="Sort Results By:" name="browse-sort" options={SORTS} value={sort} onChange={setSort} />
        <RadioGroup title="Type" name="browse-type" options={ORDERS} value={order} onChange={setOrder} />

        <div className="browse-section-block">
          <h3>Tags:</h3>
          <div className="browse-box-border tags-grid-wireframe">
            {TAGS.map(([val, label]) => (
              <label key={val} className="radio-label">
                <input type="checkbox" checked={tags.includes(val)} onChange={() => toggleTag(val)} /> {label}
              </label>
            ))}
          </div>
        </div>

        <div className="browse-search-btn-wrap">
          <button className="browse-search-btn" onClick={search}>Search</button>
        </div>
      </div>
    </section>
  );
}
