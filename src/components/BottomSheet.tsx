import React from 'react';
import { Drawer } from 'vaul';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <Drawer.Root 
      open={isOpen} 
      onOpenChange={(open) => !open && onClose()}
      shouldScaleBackground={false}
      dismissible={true}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300" />
        <Drawer.Content
          className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[24px] bg-white"
          style={{
            // Altura dinámica para acomodar el teclado
            maxHeight: '90vh',
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
          
          {/* Contenido scrolleable con padding bottom para teclado */}
          <div className="flex-1 overflow-y-auto px-6 py-4 pb-safe">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default BottomSheet;
