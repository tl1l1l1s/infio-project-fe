import alertIcon from "../../../public/assets/images/alert.svg";
import xIcon from "../../../public/assets/images/x-circle.svg";
import styles from "./Toast.module.css";

const iconType = {
  alert: alertIcon,
  x: xIcon,
};

function Toast({ icon, message }) {
  return (
    <div className={styles.container}>
      <img className={styles.icon} src={iconType[icon]} />
      <span className={styles.message}>{message}</span>
    </div>
  );
}

export default Toast;
