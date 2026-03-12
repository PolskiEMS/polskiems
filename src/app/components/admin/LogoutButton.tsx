"use client";

import styles from "./LogoutButton.module.css";

export default function LogoutButton() {
  const handleLogout = async () => {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    window.location.href = "/admin/login";
  };

  return (
    <button className={styles.logout} onClick={handleLogout}>
      Wyloguj
    </button>
  );
}