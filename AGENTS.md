# AGENTS.md

## Entorno
Este proyecto se desarrolla en Linux Fedora (no Ubuntu/Debian). Usa `dnf` (no `apt`)
para paquetes del sistema, `systemctl` para servicios, y recuerda el paso
`sudo postgresql-setup --initdb` al instalar PostgreSQL. Configura `pg_hba.conf`
con `scram-sha-256` (no `peer`) para las conexiones locales por password que usará
el backend de Node.

## Especificación del proyecto
La especificación completa y autoritativa del proyecto MotorFlow está en
`Prompt-Antigravity-MotorFlow.md`, en la raíz de este repo. Trátala como fuente
de verdad — no la resumas ni la reinterpretes, sigue cada instrucción tal cual.