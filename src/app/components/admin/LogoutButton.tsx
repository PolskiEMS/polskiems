"use client";

export default function LogoutButton() {
  const handleLogout = async () => {
      await fetch("/api/admin/logout", {
            method: "POST",
                });

                    window.location.href = "/admin/login";
                      };

                        return (
                            <button onClick={handleLogout}>
                                  Wyloguj
                                      </button>
                                        );
                                        }