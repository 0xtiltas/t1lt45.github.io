export const threatDatabase = {
    triage_win: { title: "Live Response (Windows)", color: "#b286fd", steps: [
        { text: "Verificar Conexões Ativas", tool: "netstat", cmd: "netstat -ano | findstr ESTABLISHED" },
        { text: "Processos Suspeitos", tool: "tasklist", cmd: "tasklist /v | findstr /i 'powershell cmd wscript'" },
        { text: "Persistência (Run Keys)", tool: "reg query", cmd: "reg query HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" },
        { text: "Tarefas Agendadas", tool: "schtasks", cmd: "schtasks /query /fo LIST /v | findstr /i 'TaskToRun'" }
    ]},
    triage_lin: { title: "Live Response (Linux/Web)", color: "#b286fd", steps: [
        { text: "Histórico de Logins", tool: "last", cmd: "cat /var/log/auth.log | grep -i 'accepted'" },
        { text: "Processos (CPU)", tool: "top", cmd: "ps -auxww | grep -v '\\['" },
        { text: "Arquivos Recentes (Web)", tool: "find", cmd: "find /var/www/html -type f -mtime -1" },
        { text: "Conexões Reversas", tool: "ss", cmd: "ss -antp | grep ESTAB" }
    ]},
    network: { title: "Tráfego de Rede (PCAP)", color: "#b286fd", steps: [
        { text: "Conversas Longas (C2)", tool: "Wireshark", cmd: "Stats > Conversations > TCP (Sort by Duration)" },
        { text: "Filtro Port Scan", tool: "Filter", cmd: "tcp.flags.syn==1 && tcp.flags.ack==0" },
        { text: "Extração de Arquivos", tool: "Export", cmd: "File > Export Objects > HTTP/SMB" },
        { text: "DNS Tunneling", tool: "Filter", cmd: "dns.qry.name.len > 50" }
    ]},
    memory: { title: "Dump de Memória (Volatility)", color: "#b286fd", steps: [
        { text: "Listar Processos", tool: "pslist", cmd: "python3 vol.py -f dump.mem windows.pslist" },
        { text: "Conexões de Rede", tool: "netscan", cmd: "python3 vol.py -f dump.mem windows.netscan" },
        { text: "Injeção de Código", tool: "malfind", cmd: "python3 vol.py -f dump.mem windows.malfind" },
        { text: "Extrair Binário", tool: "dumpfiles", cmd: "python3 vol.py -f dump.mem windows.dumpfiles --pid <PID>" }
    ]},
    exe: { title: "Executável (EXE/DLL)", color: "#b286fd", steps: [
        { text: "Detectar Packer", tool: "DiE", cmd: "Verifique entropia > 7.0" },
        { text: "Strings", tool: "Floss", cmd: "floss.exe malware.exe > strings.txt" },
        { text: "Capabilities", tool: "Capa", cmd: "capa.exe malware.exe" },
        { text: "Importações", tool: "PEStudio", cmd: "Check: VirtualAlloc, WriteProcessMemory" }
    ]},
    script: { title: "Scripts (PS1, JS, VBS)", color: "#b286fd", steps: [
        { text: "Desofuscação Base64", tool: "CyberChef", cmd: "Recipe: From Base64 > Remove Null Bytes" },
        { text: "Download Cradle", tool: "Manual", cmd: "Busque: IEX, Invoke-Expression, Net.WebClient" }
    ]},
    doc: { title: "Documento (Office, PDF)", color: "#b286fd", steps: [
        { text: "Macros VBA", tool: "olevba", cmd: "olevba arquivo_suspeito.docm" },
        { text: "Template Injection", tool: "Unzip", cmd: "unzip -p documento.docx word/_rels/settings.xml.rels" },
        { text: "PDF Javascript", tool: "pdf-parser", cmd: "pdf-parser.py -s javascript arquivo.pdf" }
    ]},
    email: { title: "E-mail / Phishing", color: "#b286fd", steps: [
        { text: "Headers (Source IP)", tool: "MXToolbox", cmd: "Busque o X-Originating-IP" },
        { text: "Anexos (Hash)", tool: "Get-FileHash", cmd: "SHA256 do anexo antes de abrir" },
        { text: "Links (Sandbox)", tool: "URLScan", cmd: "Copie o link para urlscan.io" }
    ]}
};