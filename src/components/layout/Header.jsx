import Button from "../common/Button";
import SearchBar from "../SearchBar";
import styles from "./Header.module.css";

function Header() {
  return (
    <>
      <header className={styles.headerWrapper}>
        <div className={styles.headerContainer}>
          <a className={styles.headerIcon} href="/">
            커뮤니티
          </a>
          <SearchBar />
          <div className={styles.headerActions}>
            <Button variant="icon" onClick={() => alert("알림 클릭됨")}>
              <img src="./assets/images/user.svg" style={{ width: "18px", height: "32px" }} />
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
