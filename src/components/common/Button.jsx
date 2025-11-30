import styles from "./Button.module.css";

const variantClass = {
  primary: styles.primary,
  secondary: styles.secondary,
  tertiary: styles.tertiary,
  icon: styles.icon,
};

const sizeClass = {
  md: styles.sizeMd,
  sm: styles.sizeSm,
};

function Button({ variant = "primary", size = "md", className = "", onClick, ...props }) {
  const classes = [
    styles.base,
    sizeClass[size] ?? styles.sizeMd,
    variantClass[variant] ?? styles.primary,
    props.disabled ? styles.disabled : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <button className={classes} onClick={onClick} {...props} />;
}

export default Button;
