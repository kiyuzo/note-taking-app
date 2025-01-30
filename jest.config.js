import nextJest from 'next/jest.js';
 
const createJestConfig = nextJest({
  dir: './',
})
 
const config = {};
 
export default createJestConfig(config);