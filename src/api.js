const PokeAPI = {
    fetchPokemonData: async function (name) {
        if (!name) return null;
        const cleanName = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${cleanName}`);
            if (!response.ok) throw new Error('Pokemon not found');
            const pokemonData = await response.json();

            // Fetch Species to get Evolution Chain URL
            const speciesResponse = await fetch(pokemonData.species.url);
            const speciesData = await speciesResponse.json();

            // Fetch Evolution Chain
            const evoResponse = await fetch(speciesData.evolution_chain.url);
            const evoData = await evoResponse.json();

            return {
                ...pokemonData,
                speciesDetails: speciesData,
                evolutionTree: PokeAPI.getEvolutionTree(evoData.chain)
            };
        } catch (e) {
            console.error(e);
            return null;
        }
    },

    // Helper to parse the evolution chain RECURSIVELY
    getEvolutionTree: function (chain) {
        const speciesName = chain.species.name;
        const speciesUrl = chain.species.url;
        const id = speciesUrl.split('/').filter(Boolean).pop();

        const details = chain.evolution_details && chain.evolution_details.length > 0
            ? chain.evolution_details[0]
            : null;

        let condition = null;
        if (details) {
            const parts = [];
            if (details.min_level) parts.push(`Lvl ${details.min_level}`);
            if (details.item) parts.push(details.item.name.replace(/-/g, ' '));
            if (details.held_item) parts.push(`holding ${details.held_item.name.replace(/-/g, ' ')}`);
            if (details.known_move) parts.push(`knows ${details.known_move.name.replace(/-/g, ' ')}`);
            if (details.known_move_type) parts.push(`knows ${details.known_move_type.name} move`);
            if (details.min_happiness) parts.push(`High Happiness`);
            if (details.min_beauty) parts.push(`High Beauty`);
            if (details.min_affection) parts.push(`High Affection`);
            if (details.time_of_day) parts.push(`(${details.time_of_day})`);
            if (details.location) parts.push(`at ${details.location.name.replace(/-/g, ' ')}`);
            if (details.trigger.name === 'trade') parts.push('Trade');

            condition = parts.join(', ');
        }

        const node = {
            name: speciesName,
            id: id,
            condition: condition,
            evolves_to: []
        };

        if (chain.evolves_to && chain.evolves_to.length > 0) {
            node.evolves_to = chain.evolves_to.map(child => this.getEvolutionTree(child));
        }

        return node;
    }
};
