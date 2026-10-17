import app from './src/app.js';
import { env } from './src/config/env.js';
import { checkSupabaseHealth } from './src/config/supabase.js';

const PORT = env.PORT || 5000;

// Catch unhandled synchronous exceptions
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err);
  process.exit(1);
});

// Start HTTP server
const server = app.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(`🔥 Bramarambika Home Foods Backend Server`);
  console.log(`🚀 Mode:     ${env.NODE_ENV.toUpperCase()}`);
  console.log(`🌐 URL:      http://localhost:${PORT}`);
  console.log(`🩺 Health:   http://localhost:${PORT}/api/health`);
  console.log(`🔐 Admin:    ${env.ADMIN_EMAIL}`);
  console.log(`=======================================================`);

  // Supabase connection verification
  const dbHealth = await checkSupabaseHealth();
  if (dbHealth.connected) {
    console.log(`✅ Supabase Database: Connected`);
  } else {
    console.log(`⚠️ Supabase Database: Offline or credentials needed (${dbHealth.reason || 'Check config'})`);
  }
});

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION] at:', promise, 'reason:', reason);
});

// Graceful termination handler
const shutdownGracefully = (signal) => {
  console.log(`\n[${signal}] Initiating graceful shutdown...`);
  server.close(() => {
    console.log('✅ HTTP server closed successfully.');
    process.exit(0);
  });

  // Force close after 10 seconds if hanging
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdownGracefully('SIGTERM'));
process.on('SIGINT', () => shutdownGracefully('SIGINT'));
