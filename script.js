/** Rancho Corumbá IV — configuração do site. Preencha somente com dados CONFIRMADOS. */
const SITE_CONFIG = Object.freeze({
  whatsappNumber: '5561999141214',
});

const $ = (selector) => document.querySelector(selector);
const whatsappDigits = (SITE_CONFIG.whatsappNumber || '').replace(/\D/g,'');
const hasWhatsApp = /^55\d{10,11}$/.test(whatsappDigits);

const menuToggle = $('#menuToggle');
const primaryNav = $('#primary-nav');
menuToggle?.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  menuToggle.setAttribute('aria-label', expanded ? 'Abrir menu' : 'Fechar menu');
  primaryNav.classList.toggle('open', !expanded);
});
primaryNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  primaryNav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded','false');
  menuToggle?.setAttribute('aria-label','Abrir menu');
}));

const dateInput = $('#date');
function setMinimumDate() {
  const now = new Date();
  const localDate = [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
  dateInput.min = localDate;
}
setMinimumDate();
$('#year').textContent = new Date().getFullYear();

for (const el of document.querySelectorAll('[data-experience]')) {
  el.addEventListener('click', () => { $('#experience').value = el.dataset.experience; });
}
for (const button of document.querySelectorAll('[data-occasion]')) {
  button.addEventListener('click', () => {
    $('#experience').value = button.dataset.occasion;
    $('#reservar').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    setTimeout(()=>$('#name').focus({preventScroll:true}),300);
  });
}

function buildMessage() {
  const f = $('#bookingForm');
  const name = f.elements.name.value.trim();
  const experience = f.elements.experience.value.trim();
  const date = f.elements.date.value;
  const people = Number(f.elements.people.value);
  if (name.length < 2) throw Error('Informe seu nome.');
  if (!experience) throw Error('Escolha uma ocasião.');
  if (!date || date < dateInput.min) throw Error('Selecione uma data válida.');
  if (!Number.isInteger(people) || people < 1 || people > 30) throw Error('Informe a quantidade de pessoas (1 a 30).');
  const [yy,mm,dd]=date.split('-');
  const notes = f.elements.notes.value.trim();
  return `Olá, equipe Rancho Corumbá IV! Gostaria de consultar uma reserva.\n\nNome: ${name}\nOcasião: ${experience}\nData desejada: ${dd}/${mm}/${yy}\nPessoas: ${people}${notes ? '\nObservações: ' + notes : ''}\n\nPoderiam informar a disponibilidade e os valores?`;
}

function openNewWindow(url) {
  const node = document.createElement('a');
  node.href = url;
  node.target = '_blank';
  node.rel = 'noopener noreferrer';
  document.body.appendChild(node);
  node.click();
  node.remove();
}

$('#bookingForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const errorBox = $('#formError');
  errorBox.textContent = '';
  try {
    const message = buildMessage();
    openNewWindow(`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(message)}`);
  } catch(error) {
    errorBox.textContent = error.message || 'Revise os dados da sua solicitação.';
    errorBox.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
});

// Galeria: zoom e navegação acessível; sem bibliotecas externas.
const galleryItems = Array.from(document.querySelectorAll('[data-gallery]'));
const photoDialog = document.getElementById('photoDialog');
const photoImg = document.getElementById('photoDialogImg');
const photoCaption = document.getElementById('photoCaption');
const photoClose = document.getElementById('photoClose');
let galleryIndex = 0;
let galleryReturnFocus = null;
function showGalleryIndex(index) {
  if (!galleryItems.length) return;
  galleryIndex = (index + galleryItems.length) % galleryItems.length;
  const item = galleryItems[galleryIndex];
  photoImg.src = item.dataset.gallery;
  photoImg.alt = item.dataset.caption || 'Foto real do Rancho Corumbá IV';
  photoCaption.textContent = `${galleryIndex+1}/${galleryItems.length} · ${item.dataset.caption || 'Rancho Corumbá IV'}`;
}
function openGallery(index) {
  galleryReturnFocus = document.activeElement;
  showGalleryIndex(index);
  photoDialog.hidden = false;
  document.body.style.overflow = 'hidden';
  photoClose.focus();
}
function closeGallery() {
  photoDialog.hidden = true;
  document.body.style.overflow = '';
  if (galleryReturnFocus && galleryReturnFocus.focus) galleryReturnFocus.focus();
}
galleryItems.forEach((item,index) => item.addEventListener('click',()=>openGallery(index)));
photoClose?.addEventListener('click',closeGallery);
document.getElementById('photoPrev')?.addEventListener('click',()=>showGalleryIndex(galleryIndex-1));
document.getElementById('photoNext')?.addEventListener('click',()=>showGalleryIndex(galleryIndex+1));
photoDialog?.addEventListener('click',(e)=>{if(e.target===photoDialog)closeGallery();});
document.addEventListener('keydown',(e)=>{
  if (!photoDialog || photoDialog.hidden) return;
  if (e.key==='Escape') closeGallery();
  if (e.key==='ArrowRight') showGalleryIndex(galleryIndex+1);
  if (e.key==='ArrowLeft') showGalleryIndex(galleryIndex-1);
  if (e.key==='Tab') {
    const focusable = [photoClose,document.getElementById('photoPrev'),document.getElementById('photoNext')];
    const activeIndex = focusable.indexOf(document.activeElement);
    if (e.shiftKey && activeIndex<=0){e.preventDefault();focusable[focusable.length-1].focus();}
    else if (!e.shiftKey && activeIndex===focusable.length-1){e.preventDefault();focusable[0].focus();}
  }
});
