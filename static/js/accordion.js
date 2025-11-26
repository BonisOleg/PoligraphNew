/**
 * Логіка акордеонів для сторінки "Про нас"
 * Vanilla JS без залежностей
 * 
 * Функціональність:
 * - Тільки один акордеон може бути відкритим одночасно
 * - Клік на згорнутий акордеон - відкриває його та закриває інші
 * - Клік на відкритий акордеон - закриває його
 * - Клік поза акордеонами - закриває всі
 * - Підтримка клавіатури (Enter, Space, Escape)
 */

document.addEventListener('DOMContentLoaded', () => {
  const accordions = document.querySelectorAll('.accordion');
  
  if (!accordions.length) {
    return;
  }
  
  // Функція для закриття всіх акордеонів
  const closeAllAccordions = () => {
    accordions.forEach(accordion => {
      accordion.classList.remove('accordion--expanded');
      accordion.setAttribute('aria-expanded', 'false');
    });
  };
  
  // Функція для відкриття акордеона
  const openAccordion = (accordion) => {
    accordion.classList.add('accordion--expanded');
    accordion.setAttribute('aria-expanded', 'true');
    
    // Плавний скрол до відкритого акордеона
    setTimeout(() => {
      accordion.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };
  
  // Обробник кліку на акордеон
  accordions.forEach(accordion => {
    const header = accordion.querySelector('.accordion__header');
    
    if (!header) {
      return;
    }
    
    header.addEventListener('click', (e) => {
      e.stopPropagation();
      
      const isExpanded = accordion.classList.contains('accordion--expanded');
      
      if (isExpanded) {
        // Якщо вже відкритий - закрити
        closeAllAccordions();
      } else {
        // Закрити всі інші та відкрити поточний
        closeAllAccordions();
        openAccordion(accordion);
      }
    });
    
    // Підтримка клавіатури (Enter/Space)
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        header.click();
      }
    });
  });
  
  // Клік поза акордеонами - закрити всі
  document.addEventListener('click', (e) => {
    const clickedInsideAccordion = e.target.closest('.accordion');
    
    if (!clickedInsideAccordion) {
      closeAllAccordions();
    }
  });
  
  // Закриття при Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllAccordions();
    }
  });
});


