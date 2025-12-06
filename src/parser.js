const ShowdownParser = {
    isShowdownBlock: function (text) {
        if (!text) return false;
        // Relaxed check: Needs at least a name line or Ability/EVs/Nature/Moves
        // "Pikachu @ Light Ball" OR "Ability:" AND "Nature"
        const lines = text.split('\n');
        if (lines.length < 2) return false;

        const hasAbility = text.includes('Ability:');
        const hasNature = text.includes(' Nature');
        const hasMoves = text.includes('- ');
        const hasAt = text.includes(' @ ');

        return (hasAbility && hasNature) || (hasAt && hasMoves);
    },

    parseShowdown: function (text) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        const pokemon = {
            name: '',
            item: '',
            ability: '',
            evs: {},
            nature: '',
            moves: []
        };

        if (lines.length === 0) return pokemon;

        // 1. First line: Name @ Item or just Name
        // Handle "!requestswsh " or similar prefixes
        // Replace "!word " at start of line
        let firstLine = lines[0].replace(/^![^\s]+\s+/, '');

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
                // EVs: 252 Atk / 4 SpD / 252 Spe
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
