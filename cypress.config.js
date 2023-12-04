const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: 'grhjxu',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});
