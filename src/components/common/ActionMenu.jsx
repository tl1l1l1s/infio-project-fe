import { useState } from "react";
import styles from "./ActionMenu.module.css";
import moreIcon from "/public/assets/images/more.svg?import";

function ActionMenu({ items = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.menu}>
      <button className={styles.trigger} type="button" onClick={() => setOpen(!open)}>
        <img src={moreIcon} />
      </button>
      <div className={`${styles.dropdown} ${open ? styles.open : ""}`}>
        {items.map((item) => (
          <button
            key={item.label}
            onClick={typeof item.click === "function" ? item.click : undefined}
            className={styles.item}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ActionMenu;
