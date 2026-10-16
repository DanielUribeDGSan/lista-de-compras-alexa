import React, { useEffect, useState } from 'react';
import { Drawer } from 'vaul';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const TOP_GAP = 16;

const useKeyboardViewport = (enabled: boolean) => {
  const [viewport, setViewport] = useState({ bottom: 0, height: 0 });

  useEffect(() => {
    const vv = window.visualViewport;
    if (!enabled || !vv) return;

    const update = () => {
      const bottom = Math.max(window.innerHeight - vv.height - vv.offsetTop, 0);
      setViewport({ bottom, height: vv.height });
    };

    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [enabled]);

  return viewport;
};

const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
  const { bottom, height } = useKeyboardViewport(isOpen);

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (!target.matches('input, textarea, select')) return;
    // Esperar a que el teclado termine de abrir antes de centrar el campo
    setTimeout(() => target.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300);
  };

  return (
    <Drawer.Root 
      open={isOpen} 
      onOpenChange={(open) => !open && onClose()}
      shouldScaleBackground={false}
      dismissible={true}
      repositionInputs={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300" />
        <Drawer.Content
          className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[24px] bg-white"
          style={{
            bottom,
            maxHeight: height ? `${height - TOP_GAP}px` : '90vh',
          }}
        >
          {/* Handle bar para arrastrar */}
          <Drawer.Handle className="mx-auto mt-3 h-1.5 w-12 flex-shrink-0 rounded-full bg-gray-300 cursor-grab active:cursor-grabbing" />
          
          {/* Header con título */}
          <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <Drawer.Title className="text-lg font-semibold text-gray-900 text-center">
              {title}
            </Drawer.Title>
          </div>
          
          {/* Contenido scrolleable */}
          <div
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-4 pb-safe"
            onFocus={handleFocus}
          >
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default BottomSheet;
