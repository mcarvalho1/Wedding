let presentesVisiveis = 6;

function criarPresenteHTML(presente) {
    // Formata o preço com vírgula como separador decimal
    const precoFormatado = presente.preco.toFixed(2).replace('.', ',');

    return `
        <div class="bg-white shadow-md rounded-lg overflow-hidden text-center w-full mx-auto p-4 flex flex-col justify-between h-full">
            <div class="flex-grow">
                <div class="flex justify-center items-center w-full h-[200px]">
                    <img src="${presente.imagem}" alt="${presente.nome}" class="rounded-lg object-cover w-[200px] h-[200px]">
                </div>
                <h3 class="my-4 sm:px-4 text-sm md:text-base font-semibold text-gray-800">${presente.nome}</h3>
            </div>
            <div class="mt-auto">
                <p class="my-1 text-xl font-bold text-gray-800">
                    <span>R$ ${precoFormatado}</span>
                </p>
                <button onclick="presentear(${presente.id})" class="mt-3 bg-rose-500 text-white py-2 px-4 rounded-lg hover:bg-rose-600 w-full">
                    Presentear
                </button>
            </div>
        </div>
    `;
}

function atualizarPresentes() {
    const grid = document.getElementById('presentesGrid');
    const presentes = JSON.parse(localStorage.getItem('presentes') || '[]');
    
    grid.innerHTML = '';
    
    presentes.slice(0, presentesVisiveis).forEach(presente => {
        grid.innerHTML += criarPresenteHTML(presente);
    });

    const btnVerMais = document.getElementById('verMais');
    if (presentesVisiveis >= presentes.length) {
        btnVerMais.classList.add('hidden');
    } else {
        btnVerMais.classList.remove('hidden');
    }
}

function verMaisPresentes() {
    presentesVisiveis += 6;
    atualizarPresentes();
}

// Função para presentear
function presentear(id) {
    alert(`Presente selecionado! Em breve você será redirecionado para o pagamento.`);
    // Adicione aqui a lógica para o processo de presentear
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Adiciona o event listener para o botão ver mais
    document.getElementById('verMais').addEventListener('click', verMaisPresentes);

    // Exibe os presentes iniciais
    atualizarPresentes();

    // Configura um intervalo para verificar novos presentes
    // setInterval(atualizarPresentes, 5000); // Verifica a cada 5 segundos
});
