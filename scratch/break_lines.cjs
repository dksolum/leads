const fs = require('fs');

const breakLines = (f) => {
    let content = fs.readFileSync(f, 'utf8');
    // Se a string estiver envolvida por aspas, remover
    if (content.startsWith('"') && content.endsWith('"')) {
        content = content.slice(1, -1);
    }
    // Substituir \n literal por quebra de linha real, \" por ", etc.
    content = content.replace(/\\n/g, '\n')
                     .replace(/\\"/g, '"')
                     .replace(/\\\\/g, '\\');
    fs.writeFileSync(f, content);
};

breakLines('scratch/step_124_replacement.txt');
breakLines('scratch/step_124_target.txt');
console.log('Done breaking lines!');
