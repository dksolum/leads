const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\klopp\\.gemini\\antigravity-ide\\brain\\bbe5f2b4-1532-410c-b478-2ff084faa9a7\\.system_generated\\logs\\transcript.jsonl';

const lines = fs.readFileSync(logPath, 'utf8').split('\n');

for (const line of lines) {
    if (!line.trim()) continue;
    try {
        const obj = JSON.parse(line);
        if (obj.step_index === 124) {
            console.log("Found step 124");
            const tc = obj.tool_calls[0];
            const args = typeof tc.args === 'string' ? JSON.parse(tc.args) : tc.args;
            fs.writeFileSync('scratch/step_124_replacement.txt', args.ReplacementContent);
            fs.writeFileSync('scratch/step_124_target.txt', args.TargetContent);
        }
        if (obj.step_index === 151) {
            console.log("Found step 151");
            const tc = obj.tool_calls[0];
            const args = typeof tc.args === 'string' ? JSON.parse(tc.args) : tc.args;
            const chunks = typeof args.ReplacementChunks === 'string' ? JSON.parse(args.ReplacementChunks) : args.ReplacementChunks;
            chunks.forEach((chunk, i) => {
                fs.writeFileSync(`scratch/step_151_chunk_${i}_replacement.txt`, chunk.ReplacementContent);
                fs.writeFileSync(`scratch/step_151_chunk_${i}_target.txt`, chunk.TargetContent);
            });
        }
    } catch (e) {
        // Ignorar erros se der algum na leitura
    }
}
console.log("Done extracting!");
