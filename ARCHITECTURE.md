# Architekturübersicht

## Ziel

Ziel des Projekts ist die Entwicklung einer cloud-nativen Anwendung auf AWS mit Kubernetes, Infrastructure as Code und Integration eines AWS ML-Service.

## Gewählte Projektidee

**Projekt A – Customer Feedback Analyzer**

Verwendeter AWS ML-Service:
- **Amazon Comprehend**

## Architekturdiagramm (textuell)

```text
Benutzer
   ↓
AWS Application Load Balancer (Ingress)
   ↓
Frontend Service (EKS)
   ↓
Frontend Pods
   ↓
API Requests an /api
   ↓
Backend Service (EKS)
   ↓
Backend Pods
   ↓
Amazon Comprehend
   ↓
Amazon RDS PostgreSQL