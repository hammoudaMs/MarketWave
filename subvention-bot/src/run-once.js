import { runSearch } from './search.js';

const result = await runSearch({ verbose: true });

console.log('\n--- Search complete ---');
console.log(`Total matched: ${result.totalFound}`);
console.log(`New: ${result.new.length}`);
console.log(`Updated: ${result.updated.length}`);
console.log(`Unchanged: ${result.unchanged}`);
console.log(`Duration: ${(result.durationMs / 1000).toFixed(1)}s`);

if (result.new.length) {
  console.log('\nNew items:');
  for (const item of result.new) {
    console.log(`  • ${item.title} (${item.source})`);
  }
}
