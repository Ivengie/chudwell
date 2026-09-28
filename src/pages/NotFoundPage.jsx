import { Link } from "react-router-dom";
import { s } from "../utils.js";

export default function NotFoundPage() {
  return (
    <section className="page-view active" style={s("text-align: center; padding: 80px 0")}>
      <h2 style={s("font-family: 'Playfair Display'; font-size: 28px")}>There's nothing here.</h2>
      <Link to="/" className="btn-primary" style={s("display: inline-block; width: auto; padding: 8px 18px; text-decoration: none")}>← Back to Home</Link>
    </section>
  );
}
