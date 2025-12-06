const ShowdownParser = {
    isShowdownBlock: function (text) {
        if (!text) return false;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length < 2) return false;

        // Check for standard Showdown keys to validate it's actually a pokemon set
        let score = 0;

        // Check first line for Item syntax " @ "
        const firstLine = lines[0].replace(/^![^\s]+\s+/, '');
        if (firstLine.includes(' @ ')) score += 1;

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith('Ability:')) score += 1;
            else if (line.startsWith('EVs:')) score += 1;
            else if (line.startsWith('IVs:')) score += 1;
            else if (line.startsWith('Level:')) score += 1;
            else if (line.startsWith('Shiny:')) score += 1;
            else if (line.endsWith(' Nature')) score += 1;
            else if (line.startsWith('- ')) score += 1;
        }

        // Require at least 2 distinct showdown-like features matches
        return score >= 2;
    },

    parseShowdown: function (text) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        const pokemon = {
            name: '',
            item: '',
            ability: '',
            evs: {},
            nature: '',
            moves: [],
            gameVersion: null
        };

        if (lines.length === 0) return pokemon;

        // 1. First line: Name @ Item or just Name
        // Handle "!requestswsh " or similar prefixes
        // Replace "!word " at start of line
        let firstLine = lines[0];
        const prefixMatch = firstLine.match(/^!request(\w+)\s+/);
        if (prefixMatch) {
            const code = prefixMatch[1];
            // naive mapping
            const versionMap = {
                'swsh': 'sword-shield',
                'sv': 'scarlet-violet',
                'bdsp': 'brilliant-diamond-shining-pearl',
                'usum': 'ultra-sun-ultra-moon',
                'sm': 'sun-moon',
                'oras': 'omega-ruby-alpha-sapphire',
                'xy': 'x-y',
                'bw': 'black-white',
                'dp': 'diamond-pearl'
            };
            pokemon.gameVersion = versionMap[code] || null;
            firstLine = firstLine.replace(/^![^\s]+\s+/, '');
        } else {
            // Just remove any other !prefix if we didn't match specific "request" one
            firstLine = firstLine.replace(/^![^\s]+\s+/, '');
        }

        if (firstLine.includes(' @ ')) {
            const parts = firstLine.split(' @ ');
            pokemon.name = parts[0].split(' (')[0].trim();
            if (pokemon.name.includes(')')) {
                const match = pokemon.name.match(/\(([^)]+)\)$/);
                if (match) pokemon.name = match[1];
            }

            pokemon.item = parts[1].trim();
        } else {
            pokemon.name = firstLine.split(' (')[0].trim();
            if (pokemon.name.includes(')')) {
                const match = pokemon.name.match(/\(([^)]+)\)$/);
                if (match) pokemon.name = match[1];
            }
        }

        // Iterate other lines
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];

            if (line.startsWith('Ability: ')) {
                pokemon.ability = line.replace('Ability: ', '').trim();
            } else if (line.startsWith('EVs: ')) {
                const evParts = line.replace('EVs: ', '').split(' / ');
                evParts.forEach(part => {
                    const [val, stat] = part.trim().split(' ');
                    if (val && stat) {
                        pokemon.evs[stat.toLowerCase()] = parseInt(val);
                    }
                });
            } else if (line.endsWith(' Nature')) {
                pokemon.nature = line.replace(' Nature', '').trim();
            } else if (line.startsWith('- ')) {
                pokemon.moves.push(line.replace('- ', '').trim());
            }
        }

        return pokemon;
    }
};
