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
    corIcone: string;
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
    const filtroNormal = 'brightness(0) saturate(100%)';
    const filtroHover = isLightColor(usuario.corLinkHover)
        ? 'brightness(0) saturate(100%)'
        : 'brightness(0) saturate(100%) invert(1)';   
    const isBgLight = isBackgroundLight(usuario.fundo);
    
    const css = `
    body {
        background: ${usuario.fundo};
        background-size: cover;
    }
    
    .profile-name {
        color: ${isBgLight ? '#000000' : '#ffffff'};
        transition: color 0.3s ease;
    }
    
    .link {
        background-color: ${usuario.corLink};
        color: ${usuario.corTextoLink};
        border-radius: ${usuario.borderRadius};
        transition: all 0.3s ease;
        margin: 8px 0;
        padding: 12px 20px;
        display: flex;
        align-items: center;
        text-decoration: none;
        width: 100%;
        font-weight: 600
    }
    
    .link:hover {
        background-color: ${usuario.corLinkHover};
        color: ${isLightColor(usuario.corLinkHover) ? '#000000' : '#ffffff'};
    }    
    
    .link-icon {
        width: 24px;
        height: 24px;
        margin-right: 10px;
        transition: all 0.3s ease;
        filter: ${filtroNormal};
    }
    
    .link:hover .link-icon {
        filter: ${filtroHover};
    }
    `;

    styleElement.textContent = css;
}

function isLightColor(hexColor: string): boolean {
    const hex = hexColor.replace(/^#/, '');

    if (!/^([a-f\d]{3}){1,2}$/i.test(hex)) {
        return true;
    }
        
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminancia > 0.5;
}

function isBackgroundLight(background: string): boolean {

    if (background.startsWith('#')) {
        return isLightColor(background);
    }
    
    if (background.includes('gradient')) {

        const hexColors = background.match(/#[a-fA-F0-9]{3,6}/g);
        if (hexColors && hexColors.length > 0) {
            const middleIndex = Math.floor(hexColors.length / 2);
            return isLightColor(hexColors[middleIndex]);
        }
        
        const rgbColors = background.match(/rgba?\((\d+,\s*\d+,\s*\d+)(?:,\s*[\d.]+)?\)/g);
        if (rgbColors && rgbColors.length > 0) {
            const rgbMatch = rgbColors[0].match(/\d+/g);
            if (rgbMatch && rgbMatch.length >= 3) {
                const r = parseInt(rgbMatch[0], 10);
                const g = parseInt(rgbMatch[1], 10);
                const b = parseInt(rgbMatch[2], 10);
                const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                return luminancia > 0.5;
            }
        }
    }
    
    return false;
}

async function inicializarPagina() {
    const usuario = await buscarDados(id);

    const nome = document.getElementById('nome');
    if (nome) nome.textContent = usuario.nome;

    const imagem = document.getElementById('imagem') as HTMLImageElement;
    if (imagem) {
        imagem.src = usuario.foto;
        imagem.alt = `Foto de perfil de ${usuario.nome}`;
    }    const body = document.body;
    if (body && usuario.fundo) {
        if (usuario.fundo.startsWith('http') || usuario.fundo.startsWith('./')) {
            body.style.backgroundImage = `url(${usuario.fundo})`;
            body.style.backgroundSize = 'cover';
            body.style.backgroundPosition = 'center center';
            body.style.backgroundRepeat = 'no-repeat';
        } else {
            body.style.background = usuario.fundo;
        }
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
