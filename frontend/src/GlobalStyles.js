// src/GlobalStyles.js
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  /* Import a clean, modern font */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', sans-serif;
    color: #4A4A4A;
  }
`;

export default GlobalStyle;