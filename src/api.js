const PokeAPI = {
    fetchPokemonData: async function (name) {
        if (!name) return null;
        const cleanName = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${cleanName}`);
            if (!response.ok) throw new Error('Pokemon not found');
            return await response.json();
        } catch (e) {
            console.error(e);
            return null;
        }
    }
};
