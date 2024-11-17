let presentesVisiveis = 6;
let presenteSelecionadoId = null;

async function carregarPresentes() {
  try {
    const response = await fetch('http://localhost:3000/api/presentes');
    const presentes = await response.json();
    const grid = document.getElementById('presentesGrid');

    grid.innerHTML = '';

    presentes.slice(0, presentesVisiveis).forEach(presente => {
      if (!presente.indisponivel) {
        grid.innerHTML += criarPresenteHTML(presente);
      }
    });

    const btnVerMais = document.getElementById('verMais');
    if (presentesVisiveis >= presentes.length) {
      btnVerMais.classList.add('hidden');
    } else {
      btnVerMais.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Erro ao carregar presentes:', error);
  }
}

function criarPresenteHTML(presente) {
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
        <button onclick="presentear(${presente.id})" 
                class="mt-3 bg-rose-500 text-white hover:bg-rose-600 py-2 px-4 rounded-lg w-full">
          Presentear
        </button>
      </div>
    </div>
  `;
}

async function confirmarEscolha() {
  const paymentOptionCasamento = document.getElementById('optionCasamento').checked;
  const paymentOptionPix = document.getElementById('optionPix').checked;
  const pixOptionQR = document.getElementById('optionPixQR').checked;
  const pixOptionChave = document.getElementById('optionPixChave').checked;

  if (!paymentOptionCasamento && !paymentOptionPix) {
    alert('Por favor, selecione uma opção de pagamento.');
    return;
  }

  let metodoPagamento = 'Levar no casamento';
  if (paymentOptionPix) {
    if (pixOptionQR) {
      metodoPagamento = 'Pix - QR Code';
    } else if (pixOptionChave) {
      metodoPagamento = 'Pix - Chave';
    } else {
      alert('Por favor, selecione uma opção de Pix.');
      return;
    }
  }

  try {
    const response = await fetch(`http://localhost:3000/api/presentes/${presenteSelecionadoId}/confirmar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metodoPagamento }),
    });

    if (response.ok) {
      fecharModal();
      carregarPresentes();
      mostrarNotificacao('Presente confirmado com sucesso!', 'success');
    } else {
      mostrarNotificacao('Erro ao confirmar o presente. Tente novamente.', 'error');
    }
  } catch (error) {
    console.error('Erro ao confirmar o presente:', error);
    mostrarNotificacao('Erro ao confirmar o presente. Tente novamente.', 'error');
  }
}

function presentear(id) {
  presenteSelecionadoId = id;
  abrirModal();
}

function abrirModal() {
  const modal = document.getElementById('modalOverlay');
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Resetar estado do modal
  document.getElementById('optionCasamento').checked = false;
  document.getElementById('optionPix').checked = false;
  document.getElementById('mainPaymentOptions').classList.remove('hidden');
  document.getElementById('pixPaymentOptions').classList.add('hidden');
  document.getElementById('pixQRCodeInfo').classList.add('hidden');
  document.getElementById('pixChaveInfo').classList.add('hidden');
}

function fecharModal() {
  const modal = document.getElementById('modalOverlay');
  modal.classList.add('hidden');
  document.body.style.overflow = 'auto';
  presenteSelecionadoId = null;
}

function mostrarNotificacao(mensagem, tipo) {
  const notificacao = document.createElement('div');
  notificacao.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white ${
    tipo === 'success' ? 'bg-green-500' : 'bg-red-500'
  } transform transition-all duration-300 translate-y-0 opacity-100`;
  notificacao.textContent = mensagem;

  document.body.appendChild(notificacao);

  // Animação de fade out
  setTimeout(() => {
    notificacao.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => {
      document.body.removeChild(notificacao);
    }, 300);
  }, 3000);
}

function copiarTexto(elementId) {
  const elemento = document.getElementById(elementId);
  const texto = elemento.value || elemento.textContent;

  navigator.clipboard.writeText(texto).then(() => {
    mostrarNotificacao('Texto copiado com sucesso!', 'success');
  }).catch(err => {
    console.error('Erro ao copiar texto:', err);
    mostrarNotificacao('Erro ao copiar texto', 'error');
  });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar carregamento de presentes
  carregarPresentes();

  // Event listener para opções de pagamento
  document.addEventListener('change', (event) => {
    const mainPaymentOptions = document.getElementById('mainPaymentOptions');
    const pixPaymentOptions = document.getElementById('pixPaymentOptions');
    const pixQRCodeInfo = document.getElementById('pixQRCodeInfo');
    const pixChaveInfo = document.getElementById('pixChaveInfo');

    if (event.target && event.target.name === 'paymentOption') {
      if (event.target.value === 'pix') {
        mainPaymentOptions.classList.add('hidden');
        pixPaymentOptions.classList.remove('hidden');
        pixQRCodeInfo.classList.add('hidden');
        pixChaveInfo.classList.add('hidden');
      } else {
        mainPaymentOptions.classList.remove('hidden');
        pixPaymentOptions.classList.add('hidden');
        pixQRCodeInfo.classList.add('hidden');
        pixChaveInfo.classList.add('hidden');
      }
    }

    if (event.target && event.target.name === 'pixOption') {
      if (event.target.value === 'qr') {
        pixQRCodeInfo.classList.remove('hidden');
        pixChaveInfo.classList.add('hidden');
      } else if (event.target.value === 'chave') {
        pixQRCodeInfo.classList.add('hidden');
        pixChaveInfo.classList.remove('hidden');
      }
    }
  });
});
