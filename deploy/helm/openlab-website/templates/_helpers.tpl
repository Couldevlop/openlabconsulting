{{/*
Helpers Helm pour openlab-website — labels, sélecteurs, noms.
*/}}

{{- define "openlab-website.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "openlab-website.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{- define "openlab-website.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "openlab-website.labels" -}}
helm.sh/chart: {{ include "openlab-website.chart" . }}
{{ include "openlab-website.selectorLabels" . }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: openlab-website
{{- end -}}

{{- define "openlab-website.selectorLabels" -}}
app.kubernetes.io/name: {{ include "openlab-website.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "openlab-website.serviceAccountName" -}}
{{- default (include "openlab-website.fullname" .) .Values.serviceAccount.name -}}
{{- end -}}
