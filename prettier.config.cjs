/** @type {import("prettier").Config} */
const config = {
  plugins: [require.resolve("prettier-plugin-tailwindcss"), 'prettier-plugin-tailwindcss'],
};

module.exports = config;
