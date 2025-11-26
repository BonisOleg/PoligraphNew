/**
 * Логіка сторінки контактів
 * Vanilla JS без залежностей
 * 
 * Функціональність:
 * - Додаткові анімації та оптимізація при скролі
 * - Sticky поведінка обробляється через CSS
 */

document.addEventListener('DOMContentLoaded', () => {
  const contactsTop = document.querySelector('.contacts__top');
  const contactsBottom = document.querySelector('.contacts__bottom');
  
  if (!contactsTop || !contactsBottom) {
    return;
  }
  
  // Додаємо клас для анімації при скролі (опціонально)
  const handleScroll = () => {
    const scrollY = window.scrollY;
    const topBlockHeight = contactsTop.offsetHeight;
    
    // Додаємо клас, коли нижній блок починає перекривати верхній
    if (scrollY >= topBlockHeight * 0.5) {
      contactsBottom.classList.add('contacts__bottom--active');
    } else {
      contactsBottom.classList.remove('contacts__bottom--active');
    }
  };
  
  // Додаємо обробник скролу з throttle для оптимізації
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  });
  
  // Викликаємо один раз при завантаженні
  handleScroll();
});

