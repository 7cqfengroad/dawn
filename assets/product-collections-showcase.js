/**
 * Product Collections Showcase Component
 * Handles navigation switching and Swiper carousel initialization
 */

class ProductCollectionsShowcase {
  constructor(container) {
    this.container = container;
    this.navItems = container.querySelectorAll('.collections-item');
    this.showcases = container.querySelectorAll('.collection-showcase');
    this.swipers = {};
    
    this.init();
  }

  init() {
    this.setupNavigation();
    this.initializeSwiper();
    this.setupCustomNavigation();
  }

  setupNavigation() {
    this.navItems.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchCollection(index);
      });
    });
  }

  switchCollection(targetIndex) {
    // Update navigation active state
    this.navItems.forEach((item, index) => {
      if (index === targetIndex) {
        item.classList.add('is-active');
      } else {
        item.classList.remove('is-active');
      }
    });

    // Update showcase active state
    this.showcases.forEach((showcase, index) => {
      if (index === targetIndex) {
        showcase.classList.add('is-active');
      } else {
        showcase.classList.remove('is-active');
      }
    });

    // Initialize Swiper for the active showcase if not already done
    const targetShowcase = this.showcases[targetIndex];
    const swiperId = targetShowcase.querySelector('.collections-swiper').dataset.swiperId;
    
    if (!this.swipers[swiperId]) {
      this.initializeSingleSwiper(targetShowcase, swiperId);
    }
  }

  initializeSwiper() {
    // Initialize Swiper for the first (active) showcase
    const activeShowcase = this.container.querySelector('.collection-showcase.is-active');
    if (activeShowcase) {
      const swiperElement = activeShowcase.querySelector('.collections-swiper');
      const swiperId = swiperElement.dataset.swiperId;
      this.initializeSingleSwiper(activeShowcase, swiperId);
    }
  }

  initializeSingleSwiper(showcase, swiperId) {
    const swiperElement = showcase.querySelector('.collections-swiper');
    
    if (!swiperElement || this.swipers[swiperId]) return;

    // Swiper configuration
    const swiperConfig = {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      speed: 600,
      effect: 'slide',
      grabCursor: true,
      breakpoints: {
        640: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
        1024: {
          slidesPerView: 4,
          spaceBetween: 30,
        },
      },
      // Navigation
      navigation: {
        nextEl: `.swiper-button-next[data-swiper-id="${swiperId}"]`,
        prevEl: `.swiper-button-prev[data-swiper-id="${swiperId}"]`,
      },
      // Accessibility
      a11y: {
        prevSlideMessage: 'Previous product',
        nextSlideMessage: 'Next product',
        firstSlideMessage: 'This is the first product',
        lastSlideMessage: 'This is the last product',
      },
      // Keyboard control
      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },
      // Mouse wheel control
      mousewheel: {
        invert: false,
      },
    };

    // Initialize Swiper
    try {
      this.swipers[swiperId] = new Swiper(swiperElement, swiperConfig);
      
      // Add smooth transition effects
      this.addSwiperTransitionEffects(this.swipers[swiperId]);
    } catch (error) {
      console.warn('Failed to initialize Swiper:', error);
    }
  }

  addSwiperTransitionEffects(swiper) {
    // Add fade-in effect for slides
    swiper.on('slideChangeTransitionStart', () => {
      const activeSlide = swiper.slides[swiper.activeIndex];
      if (activeSlide) {
        activeSlide.style.opacity = '0';
        setTimeout(() => {
          activeSlide.style.opacity = '1';
        }, 100);
      }
    });

    // Pause autoplay on hover
    const swiperContainer = swiper.el;
    swiperContainer.addEventListener('mouseenter', () => {
      swiper.autoplay.stop();
    });

    swiperContainer.addEventListener('mouseleave', () => {
      swiper.autoplay.start();
    });
  }

  setupCustomNavigation() {
    // Handle custom navigation buttons
    const prevButtons = this.container.querySelectorAll('.swiper-button-prev');
    const nextButtons = this.container.querySelectorAll('.swiper-button-next');

    prevButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const swiperId = button.dataset.swiperId;
        if (this.swipers[swiperId]) {
          this.swipers[swiperId].slidePrev();
        }
      });
    });

    nextButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const swiperId = button.dataset.swiperId;
        if (this.swipers[swiperId]) {
          this.swipers[swiperId].slideNext();
        }
      });
    });
  }

  // Destroy all Swiper instances (cleanup)
  destroy() {
    Object.values(this.swipers).forEach(swiper => {
      if (swiper && typeof swiper.destroy === 'function') {
        swiper.destroy(true, true);
      }
    });
    this.swipers = {};
  }
}

// Utility function to handle intersection observer for lazy loading
class LazyLoadObserver {
  constructor() {
    this.observer = null;
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const container = entry.target;
            this.loadCollectionShowcase(container);
            this.observer.unobserve(container);
          }
        });
      }, {
        rootMargin: '50px',
        threshold: 0.1
      });
    }
  }

  observe(element) {
    if (this.observer) {
      this.observer.observe(element);
    }
  }

  loadCollectionShowcase(container) {
    // Initialize the showcase when it comes into view
    if (!container.dataset.initialized) {
      new ProductCollectionsShowcase(container);
      container.dataset.initialized = 'true';
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const showcaseContainers = document.querySelectorAll('.product-collections-showcase');
  const lazyLoader = new LazyLoadObserver();
  
  showcaseContainers.forEach(container => {
    // Use intersection observer for better performance
    lazyLoader.observe(container);
  });
});

// Handle page visibility changes to pause/resume autoplay
document.addEventListener('visibilitychange', () => {
  const showcases = document.querySelectorAll('.product-collections-showcase');
  
  showcases.forEach(showcase => {
    if (showcase.productCollectionsShowcase) {
      Object.values(showcase.productCollectionsShowcase.swipers).forEach(swiper => {
        if (document.hidden) {
          swiper.autoplay.stop();
        } else {
          swiper.autoplay.start();
        }
      });
    }
  });
});

// Keyboard navigation for collections
document.addEventListener('keydown', (e) => {
  if (e.target.closest('.product-collections-showcase')) {
    const showcase = e.target.closest('.product-collections-showcase');
    const navItems = showcase.querySelectorAll('.collections-item');
    const currentActive = showcase.querySelector('.collections-item.is-active');
    
    if (!currentActive) return;
    
    const currentIndex = Array.from(navItems).indexOf(currentActive);
    let newIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : navItems.length - 1;
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        newIndex = currentIndex < navItems.length - 1 ? currentIndex + 1 : 0;
        break;
      default:
        return;
    }
    
    if (showcase.productCollectionsShowcase) {
      showcase.productCollectionsShowcase.switchCollection(newIndex);
    }
  }
});

// Export for global access if needed
window.ProductCollectionsShowcase = ProductCollectionsShowcase; 