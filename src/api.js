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

        const node = {
            name: speciesName,
            id: id,
            min_level: details ? details.min_level : null,
            trigger: details ? details.trigger.name : null,
            item: details && details.item ? details.item.name : null,
            evolves_to: []
        };

        if (chain.evolves_to && chain.evolves_to.length > 0) {
            node.evolves_to = chain.evolves_to.map(child => this.getEvolutionTree(child));
        }

        return node;
    }
};
