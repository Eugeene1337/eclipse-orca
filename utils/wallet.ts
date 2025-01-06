import fs from "fs"

export function readWallets(filePath: string) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line !== '');
        return lines;
    } catch (error) {
        console.error('Error reading the file:', error.message);
        return [];
    }
}

