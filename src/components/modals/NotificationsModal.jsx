import { useModal } from "../../context/ModalContext.jsx";
import { s } from "../../utils.js";

export default function NotificationsModal() {
  const { closeModal } = useModal();
  return (
    <div className="modal active">
      <div className="modal-card">
        <button className="modal-close" onClick={closeModal}>✕</button>
        <h3 style={s("margin-top: 0; font-family: 'Playfair Display'")}>Notifications</h3>
        <div style={s("display: flex; flex-direction: column; gap: 12px")}>
          <div className="notification-item">
            <strong>Chapter Update:</strong> "A House Made of Weather" posted Chapter 14!
          </div>
        </div>
      </div>
    </div>
  );
}
