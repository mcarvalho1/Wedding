let presentesVisiveis = 6;

// Lista de presentes já confirmados (indisponíveis)
let presentesIndisponiveis = JSON.parse(localStorage.getItem('presentesIndisponiveis') || '[]');

function criarPresenteHTML(presente) {
  // Verifica se o presente está indisponível
  const estaIndisponivel = presentesIndisponiveis.includes(presente.id);
  const precoFormatado = presente.preco.toFixed(2).replace('.', ',');

  if (estaIndisponivel) {
    // Não exibe presentes que estão indisponíveis
    return '';
  }

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
        <button onclick="presentear(${presente.id})" 
                class="mt-3 bg-rose-500 text-white hover:bg-rose-600 py-2 px-4 rounded-lg w-full">
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
    const presenteHTML = criarPresenteHTML(presente);
    if (presenteHTML) {
      grid.innerHTML += presenteHTML;
    }
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

let presenteSelecionadoId = null;

function abrirModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  modalOverlay.classList.remove('hidden');
}

function fecharModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  modalOverlay.classList.add('hidden');
}

document.addEventListener('change', (event) => {
  if (event.target && event.target.name === 'paymentOption') {
    const pixQRCode = document.getElementById('pixQRCode');
    if (event.target.value === 'pix') {
      pixQRCode.classList.remove('hidden');
    } else {
      pixQRCode.classList.add('hidden');
    }
  }
});

function presentear(id) {
  presenteSelecionadoId = id;
  abrirModal();
}

function confirmarEscolha() {
  const paymentOptionCasamento = document.getElementById('optionCasamento').checked;
  const paymentOptionPix = document.getElementById('optionPix').checked;

  if (!paymentOptionCasamento && !paymentOptionPix) {
    alert('Por favor, selecione uma opção de pagamento.');
    return;
  }

  const presentes = JSON.parse(localStorage.getItem('presentes') || '[]');
  const presenteIndex = presentes.findIndex(presente => presente.id === presenteSelecionadoId);

  if (presenteIndex !== -1) {
    // Atualizar o presente com a escolha de pagamento e torná-lo indisponível
    presentes[presenteIndex].indisponivel = true;
    presentes[presenteIndex].metodoPagamento = paymentOptionCasamento ? 'Levar no casamento' : 'Pix';

    // Atualizar o localStorage
    localStorage.setItem('presentes', JSON.stringify(presentes));

    // Atualizar a lista de presentes indisponíveis
    presentesIndisponiveis.push(presenteSelecionadoId);
    localStorage.setItem('presentesIndisponiveis', JSON.stringify(presentesIndisponiveis));
  }

  // Fechar o modal e atualizar os presentes
  fecharModal();
  atualizarPresentes();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('verMais').addEventListener('click', verMaisPresentes);
  atualizarPresentes();
});
