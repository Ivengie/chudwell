import { useModal } from "../../context/ModalContext.jsx";
import BookDetailModal from "./BookDetailModal.jsx";
import AddToListModal from "./AddToListModal.jsx";
import CreateListModal from "./CreateListModal.jsx";
import ReadingListModal from "./ReadingListModal.jsx";
import NotificationsModal from "./NotificationsModal.jsx";
import ProfileModal from "./ProfileModal.jsx";
import MyBooksModal from "./MyBooksModal.jsx";

const MODALS = {
  book: BookDetailModal,
  addToList: AddToListModal,
  createList: CreateListModal,
  readingList: ReadingListModal,
  notifications: NotificationsModal,
  profile: ProfileModal,
  myBooks: MyBooksModal,
};

export default function ModalRoot() {
  const { modal } = useModal();
  const Modal = modal && MODALS[modal.name];
  return Modal ? <Modal {...modal.props} /> : null;
}
