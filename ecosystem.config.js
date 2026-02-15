module.exports = {
    apps: [
        {
            name: "frontend",
            script: "node_modules/next/dist/bin/next",
            args: "start",
            cwd: "./frontend",
            interpreter: "node",
            env: {
                PORT: 80,
                NODE_ENV: "production"
            }
        },
        {
            name: "backend",
            script: "node_modules/tsx/dist/cli.mjs",
            args: "src/index.ts",
            cwd: "./backend",
            interpreter: "node",
            env_file: ".env",
            env: {
                PORT: 3001,
                TEE_SIMULATION: "true",
                DATABASE_URL: "postgresql://user:password@localhost:5432/forge?sslmode=disable",
                REDIS_URL: "redis://localhost:6379"
            }
        }
    ]
};
