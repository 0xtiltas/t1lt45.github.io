import os
import markdown
from datetime import datetime

# CONFIGURAÇÕES
POSTS_ROOT = 'posts'
INDEX_FILE = 'index.html'

def generate_blog():
    all_posts = []

    # 1. VARRER E CONVERTER POSTS
    for root, dirs, files in os.walk(POSTS_ROOT):
        for file in files:
            if file.endswith(".md"):
                md_path = os.path.join(root, file)
                html_filename = file.replace(".md", ".html")
                html_path = os.path.join(root, html_filename)

                with open(md_path, 'r', encoding='utf-8') as f:
                    text = f.read()
                    # Título: primeira linha com # ou o nome do arquivo
                    title = text.split('\n')[0].replace('# ', '').strip()
                    content_html = markdown.markdown(text, extensions=['fenced_code', 'tables'])

                # Gera o arquivo HTML do post individual (apontando para o CSS e Favicon)
                full_post_html = f"""<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | t1lt45</title>
    <link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <nav style="margin: 20px;"><a href="index.html">← Voltar para a Home</a></nav>
    <main><article>{content_html}</article></main>
    <footer><p>© 2026 t1lt45.</p></footer>
</body>
</html>"""
                
                with open(html_path, 'w', encoding='utf-8') as f:
                    f.write(full_post_html)

                # Prepara dados para a Index
                web_url = html_path.replace("\\", "/")
                mtime = os.path.getmtime(md_path)
                date = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')
                all_posts.append({'title': title, 'date': date, 'url': web_url, 'ts': mtime})

    # 2. ORDENAR PELO MAIS RECENTE
    all_posts.sort(key=lambda x: x['ts'], reverse=True)

    # 3. GERAR A INDEX.HTML OFICIAL
    write_index_official(all_posts)

def write_index_official(posts):
    # Gera as linhas <li> baseadas na sua estrutura oficial
    post_items_html = ""
    for p in posts:
        post_items_html += f"""
            <li class="post-item">
                <span class="post-date">{p['date']}</span><br>
                <a>🟪<a href="{p['url']}">{p['title']}</a>
            </li>"""

    # O seu template oficial reconstruído com o Favicon
    official_template = f"""<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>t1lt45</title>
    <link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <header>
        <h1>t1lt45</h1>
        <p>Security Researcher</p>
        <nav>
            <a href="index.html">Publicações</a>
            <a href="sobre.html">Sobre</a>
        </nav>
    </header>

    <main>
        <h2>Análises Recentes</h2>
        <ul class="post-list">
            {post_items_html}
        </ul>
    </main>

    <footer>
        <p>© 2026 t1lt45.</p>
    </footer>
</body>
</html>"""

    with open(INDEX_FILE, 'w', encoding='utf-8') as f:
        f.write(official_template)
    print(f"✅ Sucesso! {len(posts)} posts indexados e Favicon aplicado.")

if __name__ == "__main__":
    generate_blog()