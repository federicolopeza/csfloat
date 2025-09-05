# 📚 Documentación del Proyecto CSFloat Market API

Esta carpeta contiene la documentación técnica completa del proyecto CSFloat Market API Test Harness, que incluye tanto el cliente CLI en Python como el dashboard web interactivo. Los documentos están organizados en secciones específicas numeradas en español.

## 📋 Índice de Documentos

### 🧭 Navegación por Componente

**Para desarrollo CLI (Python)**: Consultar especialmente documentos 01, 02, 03, 05, 06, 07, 08  
**Para desarrollo Web Dashboard**: Consultar especialmente documentos 01, 02, 03, 04, 06, 07, 08  
**Para arquitectura completa**: Revisar documentos 03 y 04 para entender la integración

### 01. [Producto y Propósito](01-producto-y-proposito.md)
- Descripción del test harness con CLI y dashboard web
- Endpoints soportados según documentación oficial
- Casos de uso específicos para traders (CLI y web)
- Criterios de aceptación para ambos componentes

### 02. [Stack Tecnológico](02-stack-tecnologico.md)
- Requerimientos de Python 3.11+ y Node.js 18+ con dependencias
- Configuración de variables de entorno para CLI y web
- Comandos de desarrollo y testing para ambos componentes
- Configuración HTTP con timeouts y reintentos

### 03. [Estructura y Arquitectura](03-estructura-y-arquitectura.md)
- Estructura completa de directorios (CLI y dashboard web)
- Arquitectura en capas: CLI, Web Dashboard, Proxy, API
- Convenciones de código y patrones para Python y TypeScript
- Objetivos de cobertura de tests para ambos componentes
- 🔗 *Ver también*: [Comandos CLI](05-comandos-cli.md) y [Endpoints API](04-endpoints-api.md)

### 04. [Endpoints API](04-endpoints-api.md)
- Especificaciones detalladas de los 3 endpoints soportados
- Parámetros, filtros y opciones de ordenamiento
- Estructura de respuesta con campos críticos
- Ejemplos de uso en CLI y consumo desde dashboard web

### 05. [Comandos CLI](05-comandos-cli.md)
- Sintaxis completa de los 4 comandos CLI principales
- Opciones, filtros y ejemplos de uso
- Formato de salida con Rich tables
- Cross-referencias con funcionalidad equivalente en dashboard web
- 🔗 *Ver también*: [Arquitectura Web](03-estructura-y-arquitectura.md) para UI equivalente

### 06. [Estrategia de Testing](06-estrategia-testing.md)
- Framework pytest para CLI y testing de componentes React
- Plan específico de tests con casos críticos para ambos componentes
- Mocking strategy con respx y testing del proxy server
- Comandos de testing y debugging para CLI y dashboard web
- 🔗 *Ver también*: [Stack Tecnológico](02-stack-tecnologico.md) para comandos de test

### 07. [Manejo de Errores](07-manejo-errores.md)
- Categorización de errores HTTP en CLI y proxy server
- Algoritmo de backoff exponencial detallado
- Logging estructurado con Rich y manejo de errores web
- Troubleshooting guide para CLI y dashboard web
- 🔗 *Ver también*: [Stack Tecnológico](02-stack-tecnologico.md) para configuración de entorno

### 08. [Modelos Pydantic](08-modelos-pydantic.md)
- Especificaciones completas de todos los modelos
- Campos críticos para tests marcados
- Factory para tests con datos realistas
- Relación con definiciones TypeScript del dashboard web
- 🔗 *Ver también*: [Arquitectura](03-estructura-y-arquitectura.md) para tipos TypeScript

## 🔗 Cross-Referencias entre Componentes

### CLI ↔ Web Dashboard
- **Comandos CLI** (doc 05) ↔ **Funcionalidad Web** (docs 01, 03, 04)
- **Modelos Pydantic** (doc 08) ↔ **Tipos TypeScript** (docs 03, 08)
- **Testing CLI** (doc 06) ↔ **Testing Web** (doc 06)
- **Errores CLI** (doc 07) ↔ **Errores Proxy/Web** (doc 07)

### Flujo de Desarrollo
1. **Setup inicial**: doc 02 (ambos stacks)
2. **Arquitectura**: doc 03 (estructura completa)
3. **API integration**: doc 04 (endpoints compartidos)
4. **Implementación específica**: doc 05 (CLI) o docs 01,03 (web)
5. **Testing**: doc 06 (estrategias por componente)

## 🎯 Propósito de la Documentación

Estos documentos están diseñados para:

- **Guiar a desarrolladores** que trabajen en ambos componentes (CLI y web)
- **Proporcionar contexto específico** a AI assistants para desarrollo full-stack
- **Documentar decisiones técnicas** y patrones de código Python y TypeScript
- **Facilitar el onboarding** de nuevos colaboradores en el ecosistema dual
- **Mantener consistencia** en el desarrollo de CLI y dashboard web

## 🔧 Uso con AI Assistants

Esta documentación está optimizada para ser utilizada como steering rules por AI assistants, proporcionando:

- **Especificaciones técnicas detalladas** para CLI y dashboard web
- **Ejemplos de código específicos** en Python y TypeScript
- **Convenciones y patrones establecidos** para ambos componentes
- **Criterios de calidad y testing** para desarrollo full-stack

## 📝 Mantenimiento

Los documentos deben actualizarse cuando:

- Se agreguen nuevos endpoints o funcionalidades en CLI o web
- Cambien los requerimientos técnicos (Python, Node.js, o dependencias)
- Se modifiquen patrones de código establecidos en cualquier componente
- Se actualicen las dependencias principales del CLI o dashboard web

---

**Nota**: Esta documentación está basada en las especificaciones del archivo `prompt.xml` y refleja los requerimientos específicos del proyecto CSFloat Market API Test Harness, incluyendo tanto el cliente CLI como el dashboard web interactivo.