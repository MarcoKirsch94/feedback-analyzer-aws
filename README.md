# Customer Feedback Analyzer on AWS

Cloud-native Abschlussprojekt auf AWS mit EKS, Terraform, RDS, Cognito, ECR, ALB-Ingress und Amazon Comprehend.

## Projektbeschreibung

Die Anwendung ermöglicht es Benutzern, öffentlich Text-Feedback einzureichen.  
Das Backend analysiert dieses Feedback automatisch mit **Amazon Comprehend**:

- **Sentiment-Analyse** (`POSITIVE`, `NEGATIVE`, `NEUTRAL`, `MIXED`)
- **Key Phrase Extraction**

Die Ergebnisse werden in **PostgreSQL auf Amazon RDS** gespeichert und im Admin-Bereich angezeigt.

## Verwendete Technologien

### Backend
- Node.js
- Express
- PostgreSQL (`pg`)
- AWS SDK for JavaScript
- Amazon Comprehend

### Frontend
- HTML
- CSS
- JavaScript
- Nginx

### Infrastruktur
- AWS VPC
- AWS EKS
- AWS RDS PostgreSQL
- AWS Cognito
- AWS ECR
- AWS Load Balancer Controller
- AWS ALB Ingress
- Terraform

### CI/CD
- GitHub Actions

## Projektfunktionen

### Öffentlicher Bereich
- Feedback-Formular
- Sentiment-Analyse
- Key Phrase Anzeige

### Admin-Bereich
- Liste aller Feedbacks
- Filter nach Sentiment
- Statistik der letzten 7 Tage

## API-Endpunkte

### Öffentlich
- `POST /api/feedback`

### Admin
- `GET /api/admin/feedback`
- `GET /api/admin/feedback?sentiment=POSITIVE`
- `GET /api/admin/stats/last-7-days`

## Datenbankschema

Tabelle `feedback`

- `id`
- `text`
- `created_at`
- `sentiment`
- `confidence_json`
- `key_phrases_json`

## Architektur

Die Anwendung besteht aus einem Frontend und einem Backend, die beide als Container auf **Amazon EKS** laufen.

### Datenfluss

1. Benutzer ruft die Webanwendung über den AWS Application Load Balancer auf
2. Frontend wird über EKS ausgeliefert
3. Frontend sendet API-Requests an das Backend
4. Backend analysiert Texte mit Amazon Comprehend
5. Backend speichert Ergebnisse in PostgreSQL auf Amazon RDS
6. Admin-Bereich zeigt gespeicherte Feedbacks und Statistiken

### AWS-Komponenten

- **VPC** mit Public und Private Subnets in 2 Availability Zones
- **Internet Gateway**
- **Security Groups**
- **EKS Cluster**
- **Managed Node Group**
- **RDS PostgreSQL** in Private Subnets
- **Cognito User Pool**
- **ECR Repositories** für Frontend und Backend
- **ALB Ingress** über AWS Load Balancer Controller

## Repository-Struktur

```text
mein-projekt/
├── .github/
│   └── workflows/
│       └── main.yml
├── backend/
├── frontend/
├── terraform/
├── k8s/
├── README.md
└── ARCHITECTURE.md