module.exports = {
  apps: [{
    name: 'proj1566-api',
    script: './node_modules/.bin/dotenv',
    args: '-e .env -- node ./dist/app.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
