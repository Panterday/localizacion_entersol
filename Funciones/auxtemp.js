const handleConvertedBase = (base, noDecimals) => {
  log.debug("BASE", base);
  const stringBase = base + "";
  const intPart = keepBefore(stringBase, ".");
  const decimalPart = keepAfter(stringBase, ".");
  let newDecimalPart = "";
  if (decimalPart) {
    for (let i = 0; i < noDecimals; i++) {
      newDecimalPart += decimalPart[i];
    }
  }
  const newNumber = intPart + newDecimalPart;
  return newNumber;
};
