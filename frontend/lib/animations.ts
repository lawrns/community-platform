// Common Framer Motion animation variants for reuse throughout the application

// Entrance animations
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    } 
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.2,
      ease: "easeIn"
    } 
  }
};

export const slideUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    } 
  },
  exit: { 
    opacity: 0,
    y: 10,
    transition: { 
      duration: 0.2,
      ease: "easeIn"
    } 
  }
};

export const slideDown = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    } 
  },
  exit: { 
    opacity: 0,
    y: -10,
    transition: { 
      duration: 0.2,
      ease: "easeIn"
    } 
  }
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    } 
  },
  exit: { 
    opacity: 0,
    x: -20,
    transition: { 
      duration: 0.2,
      ease: "easeIn"
    } 
  }
};

export const slideInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    } 
  },
  exit: { 
    opacity: 0,
    x: 20,
    transition: { 
      duration: 0.2,
      ease: "easeIn"
    } 
  }
};

export const scaleUp = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    } 
  },
  exit: { 
    opacity: 0,
    scale: 0.9,
    transition: { 
      duration: 0.2,
      ease: "easeIn"
    } 
  }
};

// Hover animations
export const hoverScale = {
  scale: 1.05,
  transition: { type: "spring", stiffness: 400, damping: 10 }
};

export const hoverElevate = {
  y: -4,
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  transition: { type: "spring", stiffness: 400, damping: 10 }
};

export const hoverBounce = {
  scale: 1.05,
  transition: { type: "spring", stiffness: 400, damping: 8, velocity: 2 }
};

// Staggered children animations
export const staggerContainer = (staggerChildren = 0.05, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren
    }
  }
});

export const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  }
};

// List item animations
export const listItem = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      type: "spring",
      stiffness: 260,
      damping: 20
    } 
  },
  exit: { 
    opacity: 0,
    x: -20,
    transition: { 
      duration: 0.2,
      ease: "easeIn"
    } 
  },
  hover: {
    x: 5,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

// Button animations
export const buttonTap = {
  scale: 0.95,
  transition: {
    type: "spring",
    stiffness: 400,
    damping: 17
  }
};

// Page transition animations
export const pageTransition = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

// Tooltip animations
export const tooltipAnimation = {
  initial: { opacity: 0, y: 10, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20
    }
  },
  exit: { 
    opacity: 0, 
    y: 10, 
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: "easeIn"
    }
  }
};

// Loading animations
export const pulseAnimation = {
  initial: { opacity: 0.6 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.8,
      repeat: Infinity,
      repeatType: "reverse"
    }
  }
};

export const spinnerAnimation = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Modal/Dialog animations
export const modalAnimation = {
  hidden: { opacity: 0, scale: 0.95, y: -20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: -20,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};