import './style.css';

// Comando para iniciar o servidor JSON: npx json-server --watch dados.json
// URL exemplo: http://localhost:5173/?id=1

interface Link {
    icone: string;
    texto: string;
    url: string;
}

interface Usuario {
    id: string;
    foto: string;
    nome: string;
    fundo: string;
    corLink: string;
    corLinkHover: string;
    corTextoLink: string;
    borderRadius: string;
    links: Link[];
}

const params = new URLSearchParams(window.location.search);
const id = params.get('id') || '1';

async function buscarDados(id: string) {

    const response = await fetch(`http://localhost:3000/usuarios/${id}`);
    if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Dados recebidos:', data);
    return data as Usuario;
}

function renderizarLinks(usuario: Usuario, container: HTMLElement): void {
    container.innerHTML = '';

    usuario.links.forEach(link => {
        const linkElement = document.createElement('a');
        linkElement.href = link.url;
        linkElement.className = 'link';
        linkElement.target = '_blank';

        if (link.icone) {
            const imgIcon = document.createElement('img');
            imgIcon.src = link.icone;
            imgIcon.alt = `Ícone ${link.texto}`;
            imgIcon.className = 'link-icon';
            linkElement.appendChild(imgIcon);
        }

        const textSpan = document.createElement('span');
        textSpan.textContent = link.texto;
        linkElement.appendChild(textSpan);

        container.appendChild(linkElement);
    });
}

function aplicarEstiloPersonalizado(usuario: Usuario): void {
    let styleElement = document.getElementById('dynamic-style');

    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'dynamic-style';
        document.head.appendChild(styleElement);
    }

    const css = `
    body {
        background: url('${usuario.fundo}') no-repeat center center fixed;
        background-size: cover;
        background: ${usuario.fundo};
    }

        .link {
            background-color: ${usuario.corLink};
            color: ${usuario.corTextoLink};
            border-radius: ${usuario.borderRadius};
            transition: background-color 0.3s ease;
            margin: 8px 0;
            padding: 12px 20px;
            display: flex;
            align-items: center;
            text-decoration: none;
            width: 100%;
        }
        
        .link:hover {
            background-color: ${usuario.corLinkHover};
        }
        
        .link-icon {
            width: 24px;
            height: 24px;
            margin-right: 10px;
        }
    `;

    styleElement.textContent = css;
}

async function inicializarPagina() {
    const usuario = await buscarDados(id);

    const nome = document.getElementById('nome');
    if (nome) nome.textContent = usuario.nome;

    const imagem = document.getElementById('imagem') as HTMLImageElement;
    if (imagem) {
        imagem.src = usuario.foto;
        imagem.alt = `Foto de perfil de ${usuario.nome}`;
    }

    const body = document.getElementById('body');
    if (body && usuario.fundo) {
        body.style.backgroundImage = `url(${usuario.fundo})`;
    }

    const linksContainer = document.getElementById('links');
    if (linksContainer) {
        renderizarLinks(usuario, linksContainer);
    }

    const qrcodeElement = document.getElementById('qrcode') as HTMLImageElement;
    if (qrcodeElement) {
        const currentUrl = window.location.href;
        qrcodeElement.src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(currentUrl)}&size=200x200`;
        qrcodeElement.alt = 'QR Code para esta página';
    }

    aplicarEstiloPersonalizado(usuario);
}

inicializarPagina();