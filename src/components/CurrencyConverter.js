import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/CurrencyConverter.css';

// Popular currency pairs
const POPULAR_PAIRS = [
  { from: 'USD', to: 'EUR', name: 'US Dollar to Euro' },
  { from: 'INR', to: 'USD', name: 'rupee to US Dollar' },
  { from: 'USD', to: 'INR', name: 'US Dollar to rupee' },
  { from: 'GBP', to: 'USD', name: 'British Pound to US Dollar' },
  { from: 'USD', to: 'JPY', name: 'US Dollar to Japanese Yen' },
  { from: 'EUR', to: 'GBP', name: 'Euro to British Pound' },
  { from: 'USD', to: 'CAD', name: 'US Dollar to Canadian Dollar' },
  { from: 'USD', to: 'AUD', name: 'US Dollar to Australian Dollar' },
  { from: 'USD', to: 'CHF', name: 'US Dollar to Swiss Franc' },
  { from: 'EUR', to: 'JPY', name: 'Euro to Japanese Yen' },
  { from: 'GBP', to: 'EUR', name: 'British Pound to Euro' },
  { from: 'AUD', to: 'USD', name: 'Australian Dollar to US Dollar' }
];

// CurrencySelector component
const CurrencySelector = ({ value, onChange, currencies }) => {
  return (
    <div className="custom-select-wrapper">
      <select
        value={value}
        onChange={onChange}
        className="currency-select"
      >
        {currencies.map((currency) => (
          <option key={currency} value={currency}>
            {currency}
          </option>
        ))}
      </select>
      <div className="select-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>
  );
};

// Popular Pair Button component
const PopularPairButton = ({ pair, onClick, isActive }) => {
  return (
    <motion.button
      className={`popular-pair-button ${isActive ? 'active' : ''}`}
      onClick={() => onClick(pair)}
      whileHover={{ y: -2, backgroundColor: isActive ? '' : 'rgba(114, 137, 218, 0.08)' }}
      whileTap={{ y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {pair.from} → {pair.to}
    </motion.button>
  );
};

const CurrencyConverter = () => {
  const API_KEY = 'f004a0571b3940635f0aae0e';
  const BASE_URL = 'https://v6.exchangerate-api.com/v6';

  // State management
  const [currencies, setCurrencies] = useState(['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'MXN']);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState(1);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showPopularPairs, setShowPopularPairs] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const popularPairsVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { 
      height: 'auto', 
      opacity: 1,
      transition: { 
        height: { duration: 0.3, ease: "easeOut" },
        opacity: { duration: 0.3, delay: 0.1 }
      }
    },
    exit: { 
      height: 0, 
      opacity: 0,
      transition: { 
        opacity: { duration: 0.2 },
        height: { duration: 0.3, delay: 0.1 }
      }
    }
  };

  // Fetch available currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch(`${BASE_URL}/${API_KEY}/codes`);
        const data = await response.json();
        
        if (data.result === 'success') {
          setCurrencies(data.supported_codes.map(codePair => codePair[0]).sort());
        } else {
          throw new Error(data['error-type'] || 'Failed to fetch currencies');
        }
      } catch (err) {
        console.error("Currency fetch error:", err);
        setError('Failed to load currency list. Using default currencies.');
      }
    };

    fetchCurrencies();
  }, []);

  // Fetch exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (!fromCurrency || !toCurrency) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${BASE_URL}/${API_KEY}/pair/${fromCurrency}/${toCurrency}`
        );
        
        const data = await response.json();
        
        if (data.result === 'success') {
          const rate = data.conversion_rate;
          setExchangeRate(rate);
          setConvertedAmount((amount * rate).toFixed(2));
          setLastUpdated(new Date().toLocaleTimeString());
        } else {
          throw new Error(data['error-type'] || 'Failed to fetch exchange rate');
        }
      } catch (error) {
        console.error("Exchange rate error:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchExchangeRate, 300);
    return () => clearTimeout(debounceTimer);
  }, [fromCurrency, toCurrency, amount]);

  // Helper functions
  const handleAmountChange = (e) => {
    const value = parseFloat(e.target.value);
    setAmount(isNaN(value) ? 0 : value);
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handlePopularPairClick = (pair) => {
    setFromCurrency(pair.from);
    setToCurrency(pair.to);
    setShowPopularPairs(false);
  };

  const togglePopularPairs = () => {
    setShowPopularPairs(!showPopularPairs);
  };

  // Icons
  const DollarSign = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  );


  const ArrowLeftRight = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
      <path d="M8 3 4 7l4 4"></path>
      <path d="M4 7h16"></path>
      <path d="m16 21 4-4-4-4"></path>
      <path d="M20 17H4"></path>
    </svg>
  );

  const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );

  const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  );

  const ChevronDown = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );

  return (
    <div className="app-container">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="converter-container"
      >
        <div className="header">
          <motion.div 
            className="logo-container"
            variants={itemVariants}
          >
            <motion.div 
              className="logo-circle"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            >
              <DollarSign />
            </motion.div>
          </motion.div>
          <motion.h1 
            className="title"
            variants={itemVariants}
          >
            Currency Converter
          </motion.h1>
          {lastUpdated && (
            <motion.div 
              className="last-updated"
              variants={itemVariants}
            >
              <ClockIcon />
              <span>Updated: {lastUpdated}</span>
            </motion.div>
          )}
        </div>
        
        <div className="content">
          <motion.button
            className="popular-pairs-toggle"
            onClick={togglePopularPairs}
            whileHover={{ backgroundColor: 'rgba(114, 137, 218, 0.1)' }}
            whileTap={{ scale: 0.98 }}
            variants={itemVariants}
          >
            <StarIcon />
            <span>Popular Currency Pairs</span>
            <motion.div 
              className="chevron-icon"
              animate={{ rotate: showPopularPairs ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {showPopularPairs && (
              <motion.div
                className="popular-pairs-container"
                variants={popularPairsVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="popular-pairs-grid">
                  {POPULAR_PAIRS.map((pair, index) => (
                    <PopularPairButton
                      key={`${pair.from}-${pair.to}`}
                      pair={pair}
                      onClick={handlePopularPairClick}
                      isActive={fromCurrency === pair.from && toCurrency === pair.to}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            className="glass-card"
            variants={itemVariants}
          >
            <div className="form-group">
              <label className="form-label">Amount</label>
              <div className="input-wrapper">
                <input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="currency-section">
              <div className="currency-item">
                <label className="form-label">From</label>
                <CurrencySelector
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  currencies={currencies}
                />
              </div>
              
              <motion.button 
                onClick={swapCurrencies} 
                whileHover={{ 
                  scale: 1.1, 
                  boxShadow: "0 10px 25px rgba(114, 137, 218, 0.3)",
                  rotate: 180
                }}
                whileTap={{ scale: 0.9 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 17 
                }}
                className="swap-button"
              >
                <ArrowLeftRight />
              </motion.button>
              
              <div className="currency-item">
                <label className="form-label">To</label>
                <CurrencySelector
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  currencies={currencies}
                />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="result-container"
            variants={itemVariants}
          >
            {isLoading ? (
              <div className="loading-container">
                <div className="pulse-loader">
                  <div className="pulse-loader-inner"></div>
                </div>
                <p className="loading-text">Fetching latest rates...</p>
              </div>
            ) : error ? (
              <div className="error-message">
                <div className="error-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <p>{error}</p>
              </div>
            ) : (
              <div className="result">
                <div className="result-card">
                  <div className="result-header">Conversion Result</div>
                  <motion.div 
                    className="conversion-result"
                    key={convertedAmount}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 300,
                      damping: 20
                    }}
                  >
                    <div className="amount-from">
                      {amount.toLocaleString()} {fromCurrency}
                    </div>
                    <div className="equals-sign">=</div>
                    <div className="amount-to">
                      <span className="highlight">{convertedAmount}</span> {toCurrency}
                    </div>
                  </motion.div>
                  <div className="exchange-rate-container">
                    <div className="exchange-rate">
                      <span>1 {fromCurrency} = {exchangeRate.toFixed(6)} {toCurrency}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CurrencyConverter;