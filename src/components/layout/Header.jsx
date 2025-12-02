import { Link } from "react-router-dom";
import { usePageRouter } from "../../hooks/usePageRouter";
import SearchBar from "../SearchBar";
import Button from "../common/Button";
import styles from "./Header.module.css";
import userIcon from "../../../public/assets/images/user.svg";

function Header() {
  const { goToLogin } = usePageRouter();
  return (
    <>
      <header className={styles.headerWrapper}>
        <div className={styles.headerContainer}>
          <Link className={styles.headerIcon} to="/">
            커뮤니티
          </Link>
          <SearchBar />
          <div className={styles.headerActions}>
            <Button variant="icon" onClick={goToLogin}>
              <img src={userIcon} style={{ width: "18px", height: "32px" }} />
            </Button>
            {/* <a className={styles.headerProfile} href="../../my.html">
              <span className={styles.headerProfileImage}></span>
            </a> */}
          </div>
        </div>
      </header>
      <hr className={styles.headerDivider} />
    </>
  );
}

export default Header;
