// Seleciona os elementos do menu
const menuToggle = document.getElementById('menuToggle');
const menuClose = document.getElementById('menuClose');
const sideMenu = document.getElementById('sideMenu');
const menuLinks = document.querySelectorAll('.menu-link'); // Seleciona todos os links do menu

// Função para abrir o menu
menuToggle.addEventListener('click', () => {
    sideMenu.classList.remove('-translate-x-full');
});

// Função para fechar o menu
menuClose.addEventListener('click', () => {
    sideMenu.classList.add('-translate-x-full');
});

// Fecha o menu quando qualquer link for clicado
menuLinks.forEach(link => {
    link.addEventListener('click', () => {
        sideMenu.classList.add('-translate-x-full');
    });
});