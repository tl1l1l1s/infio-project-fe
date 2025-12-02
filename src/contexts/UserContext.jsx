import { useState, useMemo } from "react";
import { UserContext } from "./UserContext";

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  const value = useMemo(
    () => ({
      user,
      setUser,
      clearUser: () => setUser(null),
    }),
    [user]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
