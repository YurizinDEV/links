import './style.css'

// npx json-server dados.json
// http://localhost:5173/?id=123

const params = new URLSearchParams(window.location.search);
const id = params.get('id');

async function buscarDados(id: string | null) {
    const response = await fetch(`http://localhost:3000/usuarios/${id}`);
    if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Dados recebidos:', data);
}

buscarDados(id)
