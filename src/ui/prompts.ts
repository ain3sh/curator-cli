import * as readline from 'readline';

export async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export function success(message: string): void {
  console.log(`✓ ${message}`);
}

export function error(message: string): void {
  console.error(`✗ ${message}`);
}

export function warning(message: string): void {
  console.log(`⚠ ${message}`);
}

export function info(message: string): void {
  console.log(`ℹ ${message}`);
}

export function spinner(message: string): () => void {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  process.stdout.write(`${frames[0]} ${message}`);

  const interval = setInterval(() => {
    i = (i + 1) % frames.length;
    process.stdout.write(`\r${frames[i]} ${message}`);
  }, 80);

  return () => {
    clearInterval(interval);
    process.stdout.write('\r\x1b[K'); // Clear line
  };
}
