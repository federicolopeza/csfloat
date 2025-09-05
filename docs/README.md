# 📚 Documentación del Proyecto CSFloat Market API

Esta carpeta contiene la documentación técnica completa del proyecto CSFloat Market API Test Harness, organizada en documentos específicos numerados en español.

## 📋 Índice de Documentos

### 01. [Producto y Propósito](01-producto-y-proposito.md)
- Descripción del test harness y sus funcionalidades
- Endpoints soportados según documentación oficial
- Casos de uso específicos para traders
- Criterios de aceptación del proyecto

### 02. [Stack Tecnológico](02-stack-tecnologico.md)
- Requerimientos de Python 3.11+ y dependencias
- Configuración de variables de entorno
- Comandos de desarrollo y testing
- Configuración HTTP con timeouts y reintentos

### 03. [Estructura y Arquitectura](03-estructura-y-arquitectura.md)
- Estructura completa de directorios del proyecto
- Arquitectura en 4 capas (CLI, Endpoints, HTTP, Models)
- Convenciones de código y patrones
- Objetivos de cobertura de tests

### 04. [Endpoints API](04-endpoints-api.md)
- Especificaciones detalladas de los 3 endpoints soportados
- Parámetros, filtros y opciones de ordenamiento
- Estructura de respuesta con campos críticos
- Ejemplos de wrappers y uso

### 05. [Comandos CLI](05-comandos-cli.md)
- Sintaxis completa de los 4 comandos CLI principales
- Opciones, filtros y ejemplos de uso
- Formato de salida con Rich tables
- Implementación técnica de helpers

### 06. [Estrategia de Testing](06-estrategia-testing.md)
- Framework pytest con cobertura ≥70%
- Plan específico de tests con casos críticos
- Mocking strategy con respx
- Comandos de testing y debugging

### 07. [Manejo de Errores](07-manejo-errores.md)
- Categorización de errores HTTP
- Algoritmo de backoff exponencial detallado
- Logging estructurado con Rich
- Troubleshooting guide específico

### 08. [Modelos Pydantic](08-modelos-pydantic.md)
- Especificaciones completas de todos los modelos
- Campos críticos para tests marcados
- Factory para tests con datos realistas
- Patrones de uso y validaciones

## 🎯 Propósito de la Documentación

Estos documentos están diseñados para:

- **Guiar a desarrolladores** que trabajen en el proyecto
- **Proporcionar contexto específico** a AI assistants
- **Documentar decisiones técnicas** y patrones de código
- **Facilitar el onboarding** de nuevos colaboradores
- **Mantener consistencia** en el desarrollo

## 🔧 Uso con AI Assistants

Esta documentación está optimizada para ser utilizada como steering rules por AI assistants, proporcionando:

- **Especificaciones técnicas detalladas**
- **Ejemplos de código específicos**
- **Convenciones y patrones establecidos**
- **Criterios de calidad y testing**

## 📝 Mantenimiento

Los documentos deben actualizarse cuando:

- Se agreguen nuevos endpoints o funcionalidades
- Cambien los requerimientos técnicos
- Se modifiquen patrones de código establecidos
- Se actualicen las dependencias principales

---

**Nota**: Esta documentación está basada en las especificaciones del archivo `prompt.xml` y refleja los requerimientos específicos del proyecto CSFloat Market API Test Harness.