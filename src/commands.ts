export const processCommand = (input: string) => {
  const cmd = input.toLowerCase().trim();
  
  if (cmd === 'help') return 'COMMANDS: status, scan, deploy --all, clear, logs';
  if (cmd === 'scan') return 'SCANNING NETWORK NODES... [OK] - NO THREATS FOUND.';
  if (cmd === 'deploy --all') return 'INITIALIZING DEPLOYMENT PIPELINE... PROJECT_A: LIVE, PROJECT_B: LIVE.';
  if (cmd === 'logs') return 'FETCHING RECENT ACTIVITY... 12:45 ACCESS_GRANTED.';
  
  return `UNKNOWN COMMAND: "${cmd}". TYPE "HELP" FOR ASSISTANCE.`;
};
