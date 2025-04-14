import React from 'react';

const CurrencySelector = ({ value, onChange, currencies }) => {
  return (
    <select value={value} onChange={onChange} className="currency-select">
      {currencies.map((currency) => (
        <option key={currency} value={currency}>
          {currency}
        </option>
      ))}
    </select>
  );
};

export default CurrencySelector;