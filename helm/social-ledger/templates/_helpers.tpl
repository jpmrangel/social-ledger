{{/*
Nome base do chart.
*/}}
{{- define "social-ledger.name" -}}
{{- .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Nome completo da release (usado como prefixo nos recursos).
*/}}
{{- define "social-ledger.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Label chart/version para anotações.
*/}}
{{- define "social-ledger.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Labels comuns aplicados em todos os recursos.
*/}}
{{- define "social-ledger.labels" -}}
helm.sh/chart: {{ include "social-ledger.chart" . }}
{{ include "social-ledger.selectorLabels" . }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Labels de seleção (usados nos Selectors dos Services e Deployments).
*/}}
{{- define "social-ledger.selectorLabels" -}}
app.kubernetes.io/name: {{ include "social-ledger.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
