import BookCard from "../components/BookCard.jsx";
import { useLibrary } from "../context/LibraryContext.jsx";
import { s } from "../utils.js";

export default function HomePage() {
  const { books } = useLibrary();
  return (
    <section className="page-view active">
      <div className="hero">
        <div className="eyebrow">A quiet corner of the internet</div>
        <h1>of the chuds, by the chuds, for the <i>chuds.</i></h1>
        <p className="lead">A home for every kind of story— made for wandering, lingering, and finding your people.</p>
      </div>

      <div>
        <h2 style={s("font-family: 'Playfair Display'; font-size: 28px")}>Featured Works</h2>
        <div className="books-grid">
          {books.map((book) => <BookCard key={book.id} book={book} />)}
        </div>
      </div>
    </section>
  );
}
