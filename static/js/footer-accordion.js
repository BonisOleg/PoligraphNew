/**
 * Логіка акордеонів для footer
 * Vanilla JS без залежностей
 * 
 * Функціональність:
 * - На мобільних пристроях кілька акордеонів можуть бути відкритими одночасно
 * - Клік на згорнутий акордеон - відкриває його
 * - Клік на відкритий акордеон - закриває його
 * - Підтримка клавіатури (Enter, Space, Escape)
 * - На десктопі акордеони неактивні (контент завжди видимий)
 */

document.addEventListener('DOMContentLoaded', () => {
  const footerAccordions = document.querySelectorAll('.footer__accordion');
  
  if (!footerAccordions.length) {
    return;
  }

  // Перевірка чи ми на мобільному пристрої
  const isMobile = () => {
    return window.matchMedia('(max-width: 767px)').matches;
  };

  // Функція для закриття акордеона
  const closeAccordion = (accordion) => {
    accordion.setAttribute('aria-expanded', 'false');
  };

  // Функція для відкриття акордеона
  const openAccordion = (accordion) => {
    accordion.setAttribute('aria-expanded', 'true');
  };

  // Обробник кліку на акордеон
  footerAccordions.forEach(accordion => {
    const header = accordion.querySelector('.footer__accordion-header');
    
    if (!header) {
      return;
    }

    // Перевірка чи акордеон має бути активним (тільки на мобільних)
    const updateAccordionState = () => {
      if (!isMobile()) {
        // На десктопі завжди відкритий
        openAccordion(accordion);
        header.style.pointerEvents = 'none';
        header.style.cursor = 'default';
      } else {
        // На мобільних активний
        header.style.pointerEvents = 'auto';
        header.style.cursor = 'pointer';
      }
    };

    // Ініціалізація стану
    updateAccordionState();

    // Оновлення при зміні розміру вікна
    window.addEventListener('resize', updateAccordionState);

    header.addEventListener('click', (e) => {
      // На десктопі не обробляємо кліки
      if (!isMobile()) {
        return;
      }

      e.stopPropagation();
      
      const isExpanded = accordion.getAttribute('aria-expanded') === 'true';
      
      if (isExpanded) {
        // Якщо вже відкритий - закрити
        closeAccordion(accordion);
      } else {
        // Відкрити
        openAccordion(accordion);
      }
    });
    
    // Підтримка клавіатури (Enter/Space)
    header.addEventListener('keydown', (e) => {
      if (!isMobile()) {
        return;
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        header.click();
      }
    });
  });

  // Закриття при Escape (тільки на мобільних)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMobile()) {
      footerAccordions.forEach(accordion => {
        closeAccordion(accordion);
      });
    }
  });
});

