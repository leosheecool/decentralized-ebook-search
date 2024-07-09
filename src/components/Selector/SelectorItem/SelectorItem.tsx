import React from "react";
import styles from "./SelectorItem.module.scss";

type Props = {
  value: string;
  label: string;
  isChecked: boolean;
  onChange: (e: React.MouseEvent<HTMLInputElement>) => void;
};

const SelectorItem = ({ value, label, isChecked, onChange }: Props) => {
  return (
    <label htmlFor={label} className={styles.container}>
      <input
        type='checkbox'
        id={label}
        name={label}
        value={value}
        checked={isChecked}
        onClick={onChange}
      />
      {label}
    </label>
  );
};

export default SelectorItem;
