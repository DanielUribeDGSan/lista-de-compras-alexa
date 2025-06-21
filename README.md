# Lista del Super - Firebase Integration

Una aplicación moderna para gestionar tu lista de compras del supermercado con sincronización en tiempo real usando Firebase Firestore.

## Configuración de Firebase

### 1. Crear proyecto en Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita Firestore Database

### 2. Configurar Firestore
1. En Firestore Database, crea la siguiente estructura:
   ```
   col-sala (colección)
   └── lista-super (documento)
       └── compras (subcolección)
   ```

### 3. Configurar reglas de seguridad
En Firestore Rules, agrega:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /col-sala/lista-super/compras/{document} {
      allow read, write: if true; // Cambia esto por reglas más específicas en producción
    }
  }
}
```

### 4. Obtener configuración
1. Ve a Project Settings > General
2. En "Your apps", selecciona Web app
3. Copia la configuración de Firebase

### 5. Actualizar configuración local
Edita el archivo `src/config/firebase.ts` y reemplaza la configuración:

```typescript
const firebaseConfig = {
  apiKey: "tu-api-key-aqui",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id"
};
```

## Características

- ✅ Sincronización en tiempo real con Firestore
- ✅ Funciona offline con localStorage como respaldo
- ✅ Animaciones suaves y transiciones
- ✅ Eliminar productos con confirmación
- ✅ Categorización de productos
- ✅ Cálculo de precios estimados
- ✅ Diseño responsive y moderno
- ✅ Interfaz en español mexicano

## Estructura de datos en Firestore

```
col-sala/lista-super/compras/{productId}
{
  name: string,
  category: string,
  purchased: boolean,
  estimatedPrice: number,
  quantity: number,
  unit: string,
  createdAt: timestamp
}
```

## Comandos

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```